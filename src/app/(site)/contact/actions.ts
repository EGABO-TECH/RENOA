"use server";

import { redirect } from "next/navigation";

import { getServices, getSiteSettings } from "@/lib/cms";
import { sendAlert } from "@/lib/email";
import { budgetLabel, field, formError, isBudgetRange, validate } from "@/lib/forms";
import type { FormState } from "@/lib/forms";
import { getPayloadClient } from "@/lib/payload";
import { checkSubmission } from "@/lib/spam";
import { routes, siteOrigin } from "@/lib/site";

/**
 * The contact form (brief sections 4 and 5: `/contact` has an inquiry form,
 * which writes to the Inquiries collection).
 *
 * A Server Action is reachable by POST without going through the form, so
 * everything here treats its input as hostile: the spam checks run first,
 * every field is validated and capped, and the only values that reach the
 * database are the ones named below. `status` and `owner` are not among
 * them — a submitter does not get to mark their own inquiry "won" or assign
 * it to someone.
 */

const MESSAGE_MAX = 4000;

export async function submitInquiry(
  _previous: FormState,
  data: FormData,
): Promise<FormState> {
  const values = {
    name: field(data, "name", 120),
    email: field(data, "email", 254),
    phone: field(data, "phone", 40),
    company: field(data, "company", 120),
    service: field(data, "service", 20),
    budgetRange: field(data, "budgetRange", 20),
    timeline: field(data, "timeline", 120),
    message: field(data, "message", MESSAGE_MAX),
  };

  const verdict = await checkSubmission(data, { scope: "inquiry", limit: 5 });
  if (!verdict.ok) return formError(verdict.reason, values);

  const errors = validate([
    { name: "name", value: values.name, label: "Your name", required: true, max: 120 },
    { name: "email", value: values.email, label: "Email", required: true, email: true },
    { name: "message", value: values.message, label: "Message", required: true, min: 10, max: MESSAGE_MAX },
  ]);

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the fields below.", errors, values };
  }

  // The service is a relationship, so an arbitrary id must not be trusted:
  // only one of the services actually on the site is accepted, and anything
  // else is dropped rather than rejected — it is an optional field, and
  // losing it should not cost someone their message.
  const services = await getServices();
  const service = services.find((entry) => String(entry.id) === values.service)?.id ?? null;

  const settings = await getSiteSettings();

  try {
    const payload = await getPayloadClient();

    const inquiry = await payload.create({
      collection: "inquiries",
      // The public is allowed to create here (`access.create: anyone`), and
      // running the access rules rather than bypassing them is the point:
      // this request has no user, and it should stay that way.
      overrideAccess: false,
      data: {
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        company: values.company || undefined,
        service,
        // Same rule as `service`: an unrecognised value is dropped, not
        // rejected. It is optional, and nobody loses a message over it.
        budgetRange: isBudgetRange(values.budgetRange) ? values.budgetRange : undefined,
        timeline: values.timeline || undefined,
        message: values.message,
        status: "new",
        sourcePage: field(data, "sourcePage", 200) || routes.contact,
      },
    });

    await sendAlert({
      subject: `New inquiry: ${values.name}`,
      heading: `${values.name} got in touch through the website.`,
      rows: [
        { label: "Email", value: values.email },
        { label: "Phone", value: values.phone },
        { label: "Company", value: values.company },
        {
          label: "Service",
          value: services.find((entry) => entry.id === service)?.title ?? "",
        },
        { label: "Budget", value: budgetLabel(values.budgetRange) },
        { label: "Timeline", value: values.timeline },
      ],
      body: values.message,
      replyTo: values.email,
      link: {
        label: "Open in the admin",
        url: `${siteOrigin(settings)}/admin/collections/inquiries/${inquiry.id}`,
      },
    });
  } catch (error) {
    console.error("[inquiry] could not be saved.", error);
    return formError(
      `Something went wrong on our side. Please email ${settings.contactEmail} and we will pick it up there.`,
      values,
    );
  }

  // Outside the try: `redirect` works by throwing, and catching it here would
  // turn a successful submission into an error message.
  redirect(`${routes.thankYou}?sent=inquiry`);
}
