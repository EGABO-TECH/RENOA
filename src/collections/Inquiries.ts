import type { CollectionConfig } from "payload";
import { anyone, deleteOnlyAdmin, pipelineRead, pipelineUpdate } from "@/lib/access";
import { withActivityLog } from "@/lib/activity";
import { exportFilename, toCsv } from "@/lib/csv";
import { BUDGET_RANGES, budgetLabel } from "@/lib/forms";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  admin: {
    group: "Pipeline",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "service", "status", "owner", "createdAt"],
    description: "Submissions from the contact form. Members have no access.",
    components: {
      beforeListTable: ["@/components/admin/ExportInquiries#ExportInquiries"],
    },
  },
  /**
   * `GET /api/inquiries/export` — the CSV the brief's section 7 asks for.
   *
   * It runs the ordinary read access rules (`overrideAccess: false` with the
   * signed-in user) rather than checking the role itself, so the export can
   * never return a row the same person could not already open in the admin.
   * A collection endpoint rather than a route under `src/app` because
   * Payload owns everything under `/api`, and because mounting it here means
   * it inherits Payload's session handling for free.
   */
  endpoints: [
    {
      path: "/export",
      method: "get",
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: "Not authorised." }, { status: 401 });
        }

        let docs;
        try {
          ({ docs } = await req.payload.find({
            collection: "inquiries",
            overrideAccess: false,
            user: req.user,
            depth: 1,
            sort: "-createdAt",
            pagination: false,
            limit: 0,
          }));
        } catch {
          return Response.json({ error: "Not authorised." }, { status: 403 });
        }

        const named = (value: unknown, key: string): string => {
          if (value && typeof value === "object" && key in value) {
            return String((value as Record<string, unknown>)[key] ?? "");
          }
          return "";
        };

        const csv = toCsv(
          [
            "Received",
            "Name",
            "Email",
            "Phone",
            "Company",
            "Service",
            "Budget",
            "Timeline",
            "Status",
            "Owner",
            "Source page",
            "Message",
            "Notes",
          ],
          docs.map((doc) => [
            doc.createdAt,
            doc.name,
            doc.email,
            doc.phone,
            doc.company,
            named(doc.service, "title"),
            budgetLabel(doc.budgetRange ?? ""),
            doc.timeline,
            doc.status,
            named(doc.owner, "email"),
            doc.sourcePage,
            doc.message,
            doc.notes,
          ]),
        );

        return new Response(csv, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${exportFilename("inquiries")}"`,
            // Personal data. Nothing between here and the browser should
            // keep a copy.
            "Cache-Control": "no-store, private",
          },
        });
      },
    },
  ],
  hooks: withActivityLog("Inquiries"),
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
      name: "budgetRange",
      type: "select",
      // Spread: BUDGET_RANGES is `as const` so the two sides cannot drift,
      // and Payload wants a mutable array.
      options: BUDGET_RANGES.map((band) => ({ ...band })),
      admin: {
        description: "Optional on the form, and often left blank. Lead qualification only.",
      },
    },
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
