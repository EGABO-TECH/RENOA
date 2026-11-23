import type { CollectionConfig } from "payload";
import { deleteOnlyAdmin, isEditor, noone } from "@/lib/access";

/**
 * Who changed what, and when (brief section 7, Settings → "activity log").
 *
 * Payload already keeps version history per document, which answers "what did
 * this page look like last week". It does not answer "what happened on the
 * site yesterday" — you would have to open every document to find out. This
 * is that second view: one row per change, across every collection and
 * global, newest first.
 *
 * It is deliberately append-only. Nothing in the app creates, updates or
 * deletes a row through the API — `src/lib/activity.ts` writes them with
 * access overridden from an `afterChange` hook, and every field is read-only
 * in the admin. A log an editor can edit is not a log. Admins can delete,
 * because somebody has to be able to clear it.
 *
 * `userEmail` duplicates the relationship on purpose: a user can be deleted,
 * and the row should still say who did the thing.
 */
export const ActivityLog: CollectionConfig = {
  slug: "activity-log",
  labels: { singular: "Activity", plural: "Activity log" },
  admin: {
    group: "Settings",
    useAsTitle: "summary",
    defaultColumns: ["summary", "action", "userEmail", "createdAt"],
    description:
      "Every content change, newest first. Written automatically; it cannot be edited.",
  },
  access: {
    create: noone,
    read: isEditor,
    update: noone,
    delete: deleteOnlyAdmin,
  },
  defaultSort: "-createdAt",
  timestamps: true,
  fields: [
    {
      name: "summary",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    {
      name: "action",
      type: "select",
      required: true,
      options: [
        { label: "Created", value: "created" },
        { label: "Updated", value: "updated" },
        { label: "Published", value: "published" },
        { label: "Deleted", value: "deleted" },
      ],
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "entity",
      type: "text",
      required: true,
      admin: { readOnly: true, description: "The collection or global that changed." },
    },
    {
      name: "documentId",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "adminUrl",
      type: "text",
      admin: { readOnly: true, description: "Where to open what changed." },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "userEmail",
      type: "text",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Kept as text so the row survives the account being deleted.",
      },
    },
  ],
};
