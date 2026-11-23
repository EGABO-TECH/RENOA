import path from "path";

import type { CollectionConfig } from "payload";
import { anyone, deleteOnlyAdmin, isEditor, isLoggedIn } from "@/lib/access";
import { withActivityLog } from "@/lib/activity";

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Assets", useAsTitle: "alt" },
  hooks: withActivityLog("Media"),
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isEditor,
    delete: deleteOnlyAdmin,
  },
  upload: {
    // Local-dev fallback when BLOB_READ_WRITE_TOKEN is unset. Kept out of
    // src/ (Payload's default is the collection slug beside the config) and
    // gitignored; production serves from Vercel Blob instead.
    staticDir: path.resolve(process.cwd(), "media"),
    // Width-based sizes; height omitted so aspect ratio is preserved.
    imageSizes: [
      { name: "thumbnail", width: 400, withoutEnlargement: true },
      { name: "card", width: 768, withoutEnlargement: true },
      { name: "feature", width: 1280, withoutEnlargement: true },
      { name: "hero", width: 1920, withoutEnlargement: true },
    ],
    focalPoint: true,
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "Describe the image for screen readers. Required — an empty alt fails the WCAG 2.2 AA bar in section 9.",
      },
    },
    { name: "caption", type: "text" },
  ],
};
