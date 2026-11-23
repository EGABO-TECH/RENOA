import type { CollectionConfig } from "payload";
import { deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";
import { withActivityLog } from "@/lib/activity";
import { revalidateCollection, testimonialPaths } from "@/lib/revalidate";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    group: "Content",
    useAsTitle: "personName",
    defaultColumns: ["personName", "organization", "verified", "relatedProject"],
    description: "Only verified testimonials render. Never attribute one to a RENOA product.",
  },
  hooks: withActivityLog("Testimonials", revalidateCollection(testimonialPaths)),
  versions: { drafts: true, maxPerDoc: 10 },
  access: { read: publishedOrLoggedIn, create: isEditor, update: isEditor, delete: deleteOnlyAdmin },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "personName", type: "text", required: true },
    { name: "personRole", type: "text", required: true },
    { name: "organization", type: "text", required: true },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "relatedProject", type: "relationship", relationTo: "projects" },
    {
      name: "verified",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Must be true to display anywhere. Requires a consent record.",
      },
    },
    {
      name: "consentRecord",
      type: "textarea",
      admin: {
        description: "How and when consent was given (date, channel, who confirmed).",
      },
    },
  ],
};
