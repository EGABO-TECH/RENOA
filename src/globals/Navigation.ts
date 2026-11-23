import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/lib/access";
import { logGlobal } from "@/lib/activity";
import { revalidateEverything } from "@/lib/revalidate";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  admin: { group: "Site" },
  versions: { max: 20 },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [...revalidateEverything, ...logGlobal("Navigation")] },
  fields: [
    {
      name: "headerLinks",
      type: "array",
      labels: { singular: "Header link", plural: "Header links" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
        { name: "order", type: "number", required: true, defaultValue: 99 },
      ],
      admin: { description: "Shown left to right by order. Collapses into the mobile menu." },
    },
    {
      name: "bookCallLink",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true, defaultValue: "Book a call" },
        { name: "url", type: "text", required: true, defaultValue: "/contact" },
      ],
      admin: { description: "Stays pinned to the bottom of the screen on mobile." },
    },
    {
      name: "footerColumns",
      type: "array",
      labels: { singular: "Footer column", plural: "Footer columns" },
      fields: [
        { name: "heading", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
      admin: { initCollapsed: true },
    },
  ],
};
