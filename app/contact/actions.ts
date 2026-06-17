"use server";

/**
 * Contact form server action.
 *
 * Validates input via Zod, then forwards the message to the deployed
 * Supabase edge function `send-contact-email`, which sends an email
 * to assembl@assembl.co.nz via Brevo. The edge function reads
 * BREVO_API_KEY from Supabase secrets — no Vercel-side env required
 * beyond NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 *
 * The edge function has verify_jwt = true (Supabase default) so we
 * pass the anon publishable key as Bearer + apikey header — that key
 * is public-by-design (already shipped in browser bundles).
 */

import { z } from "zod";
import { persistLead } from "@/lib/lead-capture";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Please provide a valid email"),
  business: z.string().max(160).optional(),
  kete: z.string().max(40).optional(),
  message: z.string().min(10, "A few sentences please").max(4000),
  intent: z.enum(["demo", "trial", "question"]).default("demo"),
});

export type ContactState =
  | { status: "idle" }
  | { status: "success"; ref: string }
  | { status: "error"; message: string };

const FALLBACK_ERROR =
  "We couldn't send your message right now — please email assembl@assembl.co.nz directly.";

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    business: formData.get("business") || undefined,
    kete: formData.get("kete") || undefined,
    message: formData.get("message"),
    intent: formData.get("intent") || "demo",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ref = `ASB-${Date.now().toString(36).toUpperCase()}`;

  // Belt-and-braces: a durable row lands BEFORE we attempt email, so even a
  // total email outage leaves Kate a queryable record. Fail-soft.
  await persistLead({
    formName: "Contact form",
    name: parsed.data.name,
    email: parsed.data.email,
    fields: {
      ref,
      intent: parsed.data.intent,
      business: parsed.data.business,
      kete: parsed.data.kete,
      message: parsed.data.message,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error("[contact]", ref, "missing Supabase env vars");
    return { status: "error", message: FALLBACK_ERROR };
  }

  // Build a richer message body so the email includes intent + business + kete
  const enriched = [
    `Reference: ${ref}`,
    `Intent: ${parsed.data.intent}`,
    parsed.data.business ? `Business: ${parsed.data.business}` : null,
    parsed.data.kete ? `Kete: ${parsed.data.kete}` : null,
    "",
    parsed.data.message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(
      `${supabaseUrl}/functions/v1/send-contact-email`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          message: enriched,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error(
        "[contact]",
        ref,
        "send-contact-email failed:",
        res.status,
        data
      );
      return { status: "error", message: FALLBACK_ERROR };
    }

    console.log("[contact]", ref, "delivered");
    return { status: "success", ref };
  } catch (err) {
    console.error("[contact]", ref, "fetch error:", err);
    return { status: "error", message: FALLBACK_ERROR };
  }
}
