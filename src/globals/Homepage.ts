import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/lib/access";
import { homepageBlocks } from "@/blocks";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  admin: { group: "Site", description: "Drag to reorder sections. Each one has its own visibility toggle." },
  versions: { drafts: true, max: 30 },
  access: { read: anyone, update: isEditor },
  fields: [
    {
      name: "sections",
      type: "blocks",
      blocks: homepageBlocks,
      admin: { initCollapsed: true },
    },
  ],
};
