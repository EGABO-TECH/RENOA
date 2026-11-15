import type { CollectionConfig } from "payload";
import { anyone, deleteOnlyAdmin, pipelineRead, pipelineUpdate } from "@/lib/access";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  admin: {
    group: "Pipeline",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "service", "status", "owner", "createdAt"],
    description: "Submissions from the contact form. Members have no access.",
  },
  access: {
    // The public form writes here; only editors and admins can read it back.
    create: anyone,
    read: pipelineRead,
    update: pipelineUpdate,
    delete: deleteOnlyAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "company", type: "text" },
    { name: "service", type: "relationship", relationTo: "services" },
    {
      name: "timeline",
      type: "text",
      admin: { description: "When they want to start or ship." },
    },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Proposal", value: "proposal" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar", description: "Who is following this up." },
    },
    { name: "notes", type: "textarea", admin: { description: "Internal only. Never shown publicly." } },
    {
      name: "sourcePage",
      type: "text",
      admin: { readOnly: true, position: "sidebar", description: "Page the form was submitted from." },
    },
  ],
};
