import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { publicPathFor } from "@/lib/preview";

/**
 * Turns on draft mode for a signed-in editor, then sends them to the page.
 *
 * The admin's Preview button links here. Three things have to hold before
 * draft mode is enabled, because draft mode makes every page on this origin
 * serve unpublished content to whoever holds the cookie:
 *
 * 1. **A real Payload session.** `payload.auth` validates the admin cookie the
 *    browser already has. No token in the query string, so a preview link is
 *    useless to anyone who is not already signed in.
 * 2. **A route we own.** The destination is derived from the collection and
 *    slug through the same map the rest of the site uses, never taken from the
 *    request, so this cannot be turned into an open redirect.
 * 3. **A known collection.** Anything else is rejected rather than guessed at.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const collection = req.nextUrl.searchParams.get("collection");
  const slug = req.nextUrl.searchParams.get("slug");

  if (!collection || !slug) {
    return new Response("Missing collection or slug.", { status: 400 });
  }

  const path = publicPathFor(collection, slug);
  if (!path) {
    return new Response("That collection has no public page.", { status: 400 });
  }

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: req.headers });

  if (!user) {
    return new Response("Sign in to the admin first.", { status: 401 });
  }

  (await draftMode()).enable();

  redirect(path);
}
