import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/lib/access";
import { logGlobal } from "@/lib/activity";
import { homepageBlocks } from "@/blocks";
import { homepagePreview } from "@/lib/preview";
import { revalidateRoutes } from "@/lib/revalidate";
import { routes } from "@/lib/site";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  admin: {
    group: "Site",
    description: "Drag to reorder sections. Each one has its own visibility toggle.",
    preview: homepagePreview,
  },
  versions: { drafts: true, max: 30 },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [...revalidateRoutes([routes.home]), ...logGlobal("Homepage")] },
  fields: [
    {
      name: "sections",
      type: "blocks",
      blocks: homepageBlocks,
      admin: { initCollapsed: true },
    },
  ],
};
