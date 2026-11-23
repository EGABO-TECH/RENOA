import type { CollectionConfig } from "payload";
import { deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";
import { withActivityLog } from "@/lib/activity";
import { seoGroup, slugField } from "@/lib/fields";
import { pageBlocks } from "@/blocks";
import { revalidateCollection, pagePaths } from "@/lib/revalidate";
import { previewConfig } from "@/lib/preview";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    ...previewConfig("pages"),
    group: "Site",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    description: "Backs /faq, /security, /privacy, /terms and any other standalone page.",
  },
  hooks: withActivityLog("Pages", revalidateCollection(pagePaths)),
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrLoggedIn, create: isEditor, update: isEditor, delete: deleteOnlyAdmin },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    { name: "layout", type: "blocks", blocks: pageBlocks, admin: { initCollapsed: true } },
    seoGroup,
  ],
};
