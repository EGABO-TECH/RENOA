/**
 * Runs Payload's own tooling without the broken `payload` CLI.
 *
 *   node scripts/payload.mjs generate:types
 *   node scripts/payload.mjs generate:importmap
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
 * generate:importmap is handled here too, since 2026-11-19. The note that
 * used to stand in its place said to boot `next dev` and let it rewrite
 * src/app/(payload)/admin/importMap.js — that was true on 2026-11-15 and is
 * not now: a dev boot with a new field component left the file untouched,
 * so the admin would have rendered RepoPicker as a missing component. This
 * calls Payload's own generator, which is still the rule the old note was
 * protecting: never hand-write that file.
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

/**
 * Modules that only work inside Next's own bundler, reached from the config
 * through the collections:
 *
 * - `next/cache`, imported by the revalidation hooks. Left external, Node
 *   cannot resolve it at all (ERR_MODULE_NOT_FOUND). Neither of these
 *   commands serves a page, so there is nothing to revalidate.
 * - `server-only`, imported by the GitHub client as a guard. Outside a React
 *   Server Component build it throws on import by design — that is the whole
 *   point of the package — so here it has to be the no-op it resolves to
 *   under the `react-server` condition.
 *
 * Both become stubs. Neither has any bearing on the schema these commands
 * read.
 */
const stubNextOnlyModules = {
  name: "stub-next-only-modules",
  setup(build) {
    build.onResolve({ filter: /^next\/cache$/ }, () => ({
      path: "next-cache",
      namespace: "stub",
    }));
    build.onResolve({ filter: /^server-only$/ }, () => ({
      path: "server-only",
      namespace: "stub",
    }));
    build.onLoad({ filter: /.*/, namespace: "stub" }, ({ path: id }) => ({
      contents:
        id === "next-cache"
          ? "export const revalidatePath = () => {};\nexport const revalidateTag = () => {};\n"
          : "export {};\n",
      loader: "js",
    }));
  },
};

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
  plugins: [stubNextOnlyModules],
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

if (command === "generate:importmap") {
  const { generateImportMap } = await bin("generateImportMap/index.js");
  // Both paths this resolves — where to write, and what the component
  // specifiers are relative to — come from the real project root rather than
  // the bundle's directory, which is why ROOT_DIR is pinned.
  process.env.ROOT_DIR = root;
  await generateImportMap(config, { log: true });
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
