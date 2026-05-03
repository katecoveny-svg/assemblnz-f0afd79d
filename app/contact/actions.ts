"use server";

/**
 * TODO: wire to Brevo (BREVO_API_KEY available in env once rotated and
 * stored in Vercel) or to a Supabase edge function once the new project
 * is set up. For now this server action validates input and acknowledges
 * — the submission lands in Vercel's function logs.
 */

import { z } from "zod";

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
  console.log("[contact]", ref, parsed.data);

  return { status: "success", ref };
}
