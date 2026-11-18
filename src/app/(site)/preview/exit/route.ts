import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { publicPathFor } from "@/lib/preview";

/**
 * Leaves draft mode and returns to the published page.
 *
 * Needs no auth check: switching back to published content takes nothing away
 * from the reader. The return path still goes through `publicPathFor`, so this
 * cannot be used to bounce someone to another origin.
 */
export async function GET(req: NextRequest): Promise<Response> {
  (await draftMode()).disable();

  const collection = req.nextUrl.searchParams.get("collection");
  const slug = req.nextUrl.searchParams.get("slug");
  const path = collection && slug ? publicPathFor(collection, slug) : null;

  redirect(path ?? "/");
}
