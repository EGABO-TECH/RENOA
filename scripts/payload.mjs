/**
 * Runs Payload's own tooling without the broken `payload` CLI.
 *
 *   node scripts/payload.mjs generate:types
 *   node scripts/payload.mjs migrate:create <name>
 *   node scripts/payload.mjs migrate | migrate:status | migrate:down | ...
 *
 * Why this exists: the CLI loads payload.config.ts through tsx, whose CJS
 * require hook instantiates undici's internal symbols twice. undici's
 * CacheStorage then fails its own `arguments[0] !== kConstruct` identity check,
 * so every `payload ...` command dies with `TypeError: Illegal constructor`
 * before it reads a single field. Node version changes, deduping undici and
 * --no-experimental-require-module do not fix it.
 *
 * So we skip tsx. esbuild bundles only our own TypeScript — the config and the
 * src/ files it imports — into one ESM file, leaving every dependency external
 * so each package is loaded once, by Node, from node_modules. The bundle goes
 * inside the project so those bare specifiers still resolve, and we import
 * Payload's bin modules by absolute file URL because its package exports map
 * does not expose ./dist/bin/*.
 *
 * Not handled here: generate:importmap. `next dev` regenerates
 * src/app/(payload)/admin/importMap.js correctly on boot, so add a component,
 * boot dev, and commit the regenerated file. Never hand-write it.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import esbuild from "esbuild";

const root = process.cwd();
const [command, ...rest] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/payload.mjs <generate:types | migrate...> [args]");
  process.exit(1);
}

/** Payload's bin modules, reached by absolute URL to get past the exports map. */
const bin = (file) =>
  import(pathToFileURL(path.join(root, "node_modules/payload/dist/bin", file)).href);

// Payload loads .env itself when run through its CLI; we are not, so do it here.
process.loadEnvFile?.(path.join(root, ".env"));

const outFile = path.join(root, "node_modules/.cache/renoa/payload.config.mjs");
await mkdir(path.dirname(outFile), { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, "src/payload.config.ts")],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  packages: "external",
  alias: { "@": path.join(root, "src") },
  loader: { ".scss": "empty", ".css": "empty" },
  logLevel: "warning",
});

const config = await (await import(pathToFileURL(outFile).href)).default;

if (command === "generate:types") {
  const { generateTypes } = await bin("generateTypes.js");
  // outputFile is resolved against the config file's directory, which is the
  // bundle's directory here, so state the real target instead.
  process.env.PAYLOAD_TS_OUTPUT_PATH = path.join(root, "src/payload-types.ts");
  await generateTypes(config, { log: true });
  process.exit(0);
}

if (command.startsWith("migrate")) {
  const { migrate } = await bin("migrate.js");
  await migrate({
    config,
    // Same reason: pin the directory rather than let it resolve from the bundle.
    migrationDir: path.join(root, "src/migrations"),
    parsedArgs: { _: [command, ...rest] },
  });
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
process.exit(1);
