import type { CollectionConfig } from "payload";
import { adminFieldOnly, isAdmin } from "@/lib/access";
import { withActivityLog } from "@/lib/activity";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    group: "Settings",
    defaultColumns: ["name", "email", "role", "teamMember"],
  },
  access: {
    // Admins manage accounts. Everyone else can read and update only
    // themselves, which Payload scopes by id.
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    unlock: isAdmin,
  },
  hooks: withActivityLog("Users", {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== "create") return data;

        // Payload lets the very first account be created with no authenticated
        // user. `role` is an admin-only field, so that signup would otherwise
        // fall back to "member" and lock everyone out of their own site.
        // Force the first account to admin; later accounts keep whatever an
        // admin chose, which field access already restricts.
        const { totalDocs } = await req.payload.count({
          collection: "users",
          overrideAccess: true,
        });

        if (totalDocs === 0) {
          return { ...data, role: "admin" };
        }

        return data;
      },
    ],
  }),
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "member",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Member", value: "member" },
      ],
      // Without this a member could PATCH their own role to admin.
      access: { create: adminFieldOnly, update: adminFieldOnly },
      admin: { description: "Admin: everything. Editor: content + pipeline. Member: own profile and drafts." },
    },
    {
      name: "teamMember",
      type: "relationship",
      relationTo: "team-members",
      hasMany: false,
      access: { create: adminFieldOnly, update: adminFieldOnly },
      admin: {
        description: "Links this login to a public profile, which is what lets a member edit their own page.",
      },
    },
  ],
};
