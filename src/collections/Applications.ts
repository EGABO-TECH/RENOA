import type { CollectionConfig } from "payload";
import { anyone, deleteOnlyAdmin, pipelineRead, pipelineUpdate } from "@/lib/access";

export const Applications: CollectionConfig = {
  slug: "applications",
  admin: {
    group: "Pipeline",
    useAsTitle: "name",
    defaultColumns: ["name", "job", "email", "stage", "createdAt"],
    description: "Job applications. Contains personal data — members have no access.",
  },
  access: {
    create: anyone,
    read: pipelineRead,
    update: pipelineUpdate,
    delete: deleteOnlyAdmin,
  },
  fields: [
    { name: "job", type: "relationship", relationTo: "jobs", required: true },
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    {
      name: "cvFile",
      type: "upload",
      relationTo: "media",
      admin: { description: "CV or portfolio, PDF preferred." },
    },
    { name: "message", type: "textarea" },
    {
      name: "stage",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Reviewing", value: "reviewing" },
        { label: "Interview", value: "interview" },
        { label: "Offer", value: "offer" },
        { label: "Declined", value: "declined" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "notes", type: "textarea", admin: { description: "Internal only." } },
  ],
};
