/**
 * Loads payload.config.ts outside Next, without the broken `payload` CLI.
 *
 * The CLI loads the config through tsx, whose CJS require hook instantiates
 * undici's internal symbols twice; undici's CacheStorage then fails its own
 * `arguments[0] !== kConstruct` identity check and every command dies with
 * `TypeError: Illegal constructor` before reading a single field.
 *
 * So we skip tsx. esbuild bundles only our own TypeScript — the config and the
 * src/ files it imports — into one ESM file, leaving every dependency external
 * so each package is loaded once, by Node, from node_modules. The bundle is
 * written inside the project so those bare specifiers still resolve.
 *
 * Shared by scripts/payload.mjs and scripts/seed.mjs.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import esbuild from "esbuild";

/**
 * Modules that only work inside Next's own bundler, reached from the config
 * through the collections:
 *
 * - `next/cache`, imported by the revalidation hooks. Left external, Node
 *   cannot resolve it at all (ERR_MODULE_NOT_FOUND). Nothing here serves a
 *   page, so there is nothing to revalidate.
 * - `server-only`, imported by the GitHub client as a guard. Outside a React
 *   Server Component build it throws on import by design — that is the whole
 *   point of the package — so here it has to be the no-op it resolves to
 *   under the `react-server` condition.
 *
 * Both become stubs. Neither has any bearing on the schema or the data.
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

/** Bundles the config and returns the resolved Payload config object. */
export async function loadConfig(root = process.cwd()) {
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
    plugins: [stubNextOnlyModules],
    logLevel: "warning",
  });

  return (await import(pathToFileURL(outFile).href)).default;
}

/** Payload's bin modules, reached by absolute URL to get past the exports map. */
export const bin = (file, root = process.cwd()) =>
  import(pathToFileURL(path.join(root, "node_modules/payload/dist/bin", file)).href);
