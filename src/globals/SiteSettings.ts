import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "@/lib/access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Settings" },
  versions: { max: 20 },
  // Editors read, only admins write (brief section 6).
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identity",
          fields: [
            { name: "siteName", type: "text", required: true, defaultValue: "RENOA" },
            { name: "tagline", type: "text" },
            {
              name: "productionDomain",
              type: "text",
              required: true,
              admin: {
                description:
                  "Origin with no trailing slash, e.g. https://renoacollective.vercel.app. Every canonical URL and share image is built from this — never hardcode a domain.",
              },
            },
            {
              name: "journalLabel",
              type: "text",
              required: true,
              defaultValue: "Journal",
              admin: { description: 'Rename the section without code changes. Used in nav, headings and RSS.' },
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            { name: "contactEmail", type: "email", required: true },
            {
              name: "whatsappNumber",
              type: "text",
              admin: {
                description:
                  "Full international format, e.g. +256700000000. Leave EMPTY to hide the WhatsApp button everywhere — do not enter a placeholder.",
              },
            },
            { name: "phone", type: "text" },
            { name: "address", type: "textarea" },
            { name: "hours", type: "text" },
            {
              name: "socialLinks",
              type: "array",
              fields: [
                { name: "platform", type: "text", required: true },
                { name: "url", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Stats",
          fields: [
            {
              name: "stats",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                {
                  name: "source",
                  type: "select",
                  defaultValue: "manual",
                  options: [
                    { label: "Manual value", value: "manual" },
                    { label: "Count of live projects", value: "projects-live" },
                    { label: "Count of all projects", value: "projects-all" },
                    { label: "Count of team members", value: "team-count" },
                  ],
                  admin: { description: "Counted values stay consistent on their own." },
                },
                {
                  name: "value",
                  type: "text",
                  admin: { condition: (_, s) => s?.source === "manual" },
                },
              ],
            },
          ],
        },
        {
          label: "Branding",
          fields: [
            {
              name: "brandColors",
              type: "array",
              fields: [
                { name: "token", type: "text", required: true, admin: { description: 'e.g. "accent"' } },
                { name: "value", type: "text", required: true, admin: { description: "Hex, e.g. #2563EB" } },
              ],
            },
          ],
        },
        {
          label: "Notices",
          fields: [
            {
              name: "announcementBar",
              type: "group",
              fields: [
                { name: "enabled", type: "checkbox", defaultValue: false },
                { name: "text", type: "text" },
                { name: "url", type: "text" },
              ],
            },
            {
              name: "maintenanceMode",
              type: "checkbox",
              defaultValue: false,
              admin: { description: "Serves a holding page to visitors. The admin stays reachable." },
            },
          ],
        },
        {
          label: "Default SEO",
          fields: [
            { name: "defaultMetaTitle", type: "text" },
            { name: "defaultMetaDescription", type: "textarea", maxLength: 200 },
            { name: "defaultShareImage", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },
  ],
};
