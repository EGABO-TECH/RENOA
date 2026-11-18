import { cache } from "react";

import configPromise from "@payload-config";
import { getPayload } from "payload";

/**
 * The Payload local API client.
 *
 * Public pages read through this rather than over HTTP: it is an in-process
 * call, so there is no round trip, no serialization and no auth token to pass.
 *
 * `cache` is React's per-request memo, not a time cache. Payload's local API
 * does not go through `fetch`, so Next cannot cache it the way it caches HTTP
 * data; what this prevents is one render resolving the same settings or
 * navigation several times. Freshness is handled the other way round: pages
 * are static and the collections revalidate the routes they affect on change
 * (see `src/lib/revalidate.ts`).
 */
export const getPayloadClient = cache(async () => getPayload({ config: configPromise }));
