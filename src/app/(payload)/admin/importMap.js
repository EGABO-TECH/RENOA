/**
 * Import map for custom admin components.
 *
 * Normally produced by `payload generate:importmap`. That CLI currently
 * crashes on this setup: it loads payload.config.ts through `tsx`, whose
 * require hook instantiates undici's `lib/core/symbols` twice, so the
 * `kConstruct` symbol identity check in undici's CacheStorage constructor
 * fails ("Illegal constructor"). Next bundles the config itself and is not
 * affected, so the map is maintained by hand until the CLI is fixed.
 *
 * Keep every key in sync with the component paths in payload.config.ts.
 */
import { Logo as Logo_0, Icon as Icon_1 } from "@/components/admin/Logo";
import { Dashboard as Dashboard_2 } from "@/components/admin/Dashboard";

export const importMap = {
  "@/components/admin/Logo#Logo": Logo_0,
  "@/components/admin/Logo#Icon": Icon_1,
  "@/components/admin/Dashboard#Dashboard": Dashboard_2,
};
