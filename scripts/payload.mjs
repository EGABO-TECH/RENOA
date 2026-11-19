/**
 * Runs Payload's own tooling without the broken `payload` CLI.
 *
 *   node scripts/payload.mjs generate:types
 *   node scripts/payload.mjs generate:importmap
 *   node scripts/payload.mjs migrate:create <name>
 *   node scripts/payload.mjs migrate | migrate:status | migrate:down | ...
 *
 * Why the CLI cannot be used, and how the config is loaded instead, is in
 * scripts/lib/load-config.mjs.
 *
 * generate:importmap is handled here too, since 2026-11-19. The note that used
 * to stand in its place said to boot `next dev` and let it rewrite
 * src/app/(payload)/admin/importMap.js — that was true on 2026-11-15 and is
 * not now: a dev boot with a new field component left the file untouched, so
 * the admin would have rendered RepoPicker as a missing component. This calls
 * Payload's own generator, which is still the rule the old note was
 * protecting: never hand-write that file.
 */
import path from "node:path";

import { bin, loadConfig } from "./lib/load-config.mjs";

const root = process.cwd();
const [command, ...rest] = process.argv.slice(2);

if (!command) {
  console.error(
    "Usage: node scripts/payload.mjs <generate:types | generate:importmap | migrate...> [args]",
  );
  process.exit(1);
}

const config = await loadConfig(root);

if (command === "generate:types") {
  const { generateTypes } = await bin("generateTypes.js", root);
  // outputFile is resolved against the config file's directory, which is the
  // bundle's directory here, so state the real target instead.
  process.env.PAYLOAD_TS_OUTPUT_PATH = path.join(root, "src/payload-types.ts");
  await generateTypes(config, { log: true });
  process.exit(0);
}

if (command === "generate:importmap") {
  const { generateImportMap } = await bin("generateImportMap/index.js", root);
  // Both paths this resolves — where to write, and what the component
  // specifiers are relative to — come from the real project root rather than
  // the bundle's directory, which is why ROOT_DIR is pinned.
  process.env.ROOT_DIR = root;
  await generateImportMap(config, { log: true });
  process.exit(0);
}

if (command.startsWith("migrate")) {
  const { migrate } = await bin("migrate.js", root);
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
