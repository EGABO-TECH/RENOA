"use server";

import { redirect } from "next/navigation";

import { getJob, getSiteSettings } from "@/lib/cms";
import { sendAlert } from "@/lib/email";
import { field, formError, validate } from "@/lib/forms";
import type { FormState } from "@/lib/forms";
import { getPayloadClient } from "@/lib/payload";
import { checkSubmission } from "@/lib/spam";
import { routes, siteOrigin } from "@/lib/site";

/**
 * The job application form (brief section 4: `/careers/[slug]` carries the
 * application form).
 *
 * The same rules as the inquiry action, plus two of its own:
 *
 * - **The job is re-read on the server.** The form posts a slug, and the slug
 *   is looked up again here. A closed or unpublished role cannot be applied
 *   to by replaying an old form, whatever the hidden field says.
 * - **The CV is checked before it is stored.** Type and size are verified
 *   here, not only in the file picker, because `accept` is a hint to the
 *   browser and nothing more.
 */

/** Comfortably under the 5MB Server Action body limit in next.config.ts. */
const MAX_CV_BYTES = 4 * 1024 * 1024;
const CV_TYPES = ["application/pdf"];

export async function submitApplication(
  _previous: FormState,
  data: FormData,
): Promise<FormState> {
  const values = {
    slug: field(data, "slug", 200),
    name: field(data, "name", 120),
    email: field(data, "email", 254),
    phone: field(data, "phone", 40),
    message: field(data, "message", 4000),
  };

  const verdict = await checkSubmission(data, { scope: "application", limit: 3 });
  if (!verdict.ok) return formError(verdict.reason, values);

  const errors = validate([
    { name: "name", value: values.name, label: "Your name", required: true, max: 120 },
    { name: "email", value: values.email, label: "Email", required: true, email: true },
  ]);

  const cv = data.get("cv");
  const file = cv instanceof File && cv.size > 0 ? cv : null;

  if (file) {
    if (!CV_TYPES.includes(file.type)) {
      errors.cv = "Please attach a PDF.";
    } else if (file.size > MAX_CV_BYTES) {
      errors.cv = "That file is over 4MB. Please attach a smaller PDF.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the fields below.", errors, values };
  }

  const job = await getJob(values.slug);
  if (!job || !job.isOpen) {
    return formError(
      "That role is no longer open. See the current openings on the careers page.",
      values,
    );
  }

  const settings = await getSiteSettings();

  try {
    const payload = await getPayloadClient();

    let cvFile: number | undefined;

    if (file) {
      // Media creation is restricted to signed-in users, so this one call
      // runs with access overridden — deliberately, and only after the type
      // and size checks above. The upload itself is what the public is
      // allowed to do here; the library is not otherwise open to them.
      const media = await payload.create({
        collection: "media",
        data: { alt: `CV — ${values.name} (${job.title})` },
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          mimetype: file.type,
          name: `cv-${values.slug}-${Date.now()}.pdf`,
          size: file.size,
        },
      });

      cvFile = media.id;
    }

    const application = await payload.create({
      collection: "applications",
      overrideAccess: false,
      data: {
        job: job.id,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message || undefined,
        cvFile,
        stage: "new",
      },
    });

    await sendAlert({
      subject: `Application: ${job.title} — ${values.name}`,
      heading: `${values.name} applied for ${job.title}.`,
      rows: [
        { label: "Email", value: values.email },
        { label: "Phone", value: values.phone },
        { label: "CV", value: file ? "Attached in the admin" : "None attached" },
      ],
      body: values.message,
      replyTo: values.email,
      link: {
        label: "Open in the admin",
        url: `${siteOrigin(settings)}/admin/collections/applications/${application.id}`,
      },
    });
  } catch (error) {
    console.error("[application] could not be saved.", error);
    return formError(
      `Something went wrong on our side. Please email ${settings.contactEmail} with your CV and we will pick it up there.`,
      values,
    );
  }

  redirect(`${routes.thankYou}?sent=application`);
}
