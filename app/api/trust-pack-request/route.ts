/**
 * POST /api/trust-pack-request — security pack request from the Trust Centre.
 *
 * Captures the procurement-officer details from /trust and routes them to the
 * security team. Two delivery paths, both fail-soft so a flaky dependency never
 * loses the lead:
 *   1. Durable capture: a row in public.trust_pack_requests (if the service
 *      client is configured).
 *   2. Live notification: a Slack ping via TRUST_SLACK_WEBHOOK_URL.
 *
 * Email routing to security@assembl.co.nz is pending a transactional email
 * provider — see TODO below. Until then the Supabase row + Slack ping are the
 * durable record, and SECURITY_PACK_NOTIFY_EMAIL records the intended inbox.
 *
 * Body: { name, org, role, intendedUse, ndaSigned }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const SECURITY_INBOX = "security@assembl.co.nz";

const BodySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  org: z.string().min(1, "Organisation is required").max(160),
  role: z.string().min(1, "Role is required").max(120),
  intendedUse: z.string().min(1, "Tell us how you'll use the pack").max(2000),
  ndaSigned: z.boolean(),
});

async function notifySlack(payload: z.infer<typeof BodySchema>): Promise<void> {
  const webhook = process.env.TRUST_SLACK_WEBHOOK_URL;
  if (!webhook) return; // Slack is optional — silently skip if unconfigured.

  const text = [
    ":lock: *New security pack request* (Trust Centre)",
    `*Name:* ${payload.name}`,
    `*Org:* ${payload.org}`,
    `*Role:* ${payload.role}`,
    `*Signed NDA:* ${payload.ndaSigned ? "Yes" : "No"}`,
    `*Intended use:* ${payload.intendedUse}`,
    `Route to ${SECURITY_INBOX}`,
  ].join("\n");

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    // Non-blocking: a Slack failure must never fail the request.
    console.error("trust-pack-request slack notify failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // 1. Durable capture (fail-soft). The request still succeeds for the user
  //    even if the table or service client isn't available yet.
  try {
    const service = getServiceClient();
    const { error } = await service.from("trust_pack_requests").insert({
      name: data.name,
      org: data.org,
      role: data.role,
      intended_use: data.intendedUse,
      nda_signed: data.ndaSigned,
      notify_email: SECURITY_INBOX,
    });
    if (error) {
      console.error("trust-pack-request insert failed", { message: error.message });
    }
  } catch (error) {
    console.error("trust-pack-request service client unavailable", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  // 2. Live notification (fail-soft).
  await notifySlack(data);

  // TODO: send a transactional email to SECURITY_INBOX once an email provider
  //   (e.g. Brevo) is wired. The Slack ping + Supabase row are the durable
  //   record in the meantime.

  return NextResponse.json({ ok: true });
}
