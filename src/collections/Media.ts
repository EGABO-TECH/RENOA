import type { CollectionConfig } from "payload";
import { anyone, deleteOnlyAdmin, isEditor, isLoggedIn } from "@/lib/access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Assets", useAsTitle: "alt" },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isEditor,
    delete: deleteOnlyAdmin,
  },
  upload: {
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
