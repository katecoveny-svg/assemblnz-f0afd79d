/** Security pack capture: accepted only after a confirmed delivery or durable write. */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/service";
import { notifyLead, clientIpFromHeaders } from "@/lib/lead-capture";

export const dynamic = "force-dynamic";

const SECURITY_INBOX = "security@assembl.co.nz";

const BodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  org: z.string().trim().min(1, "Organisation is required").max(160),
  role: z.string().trim().min(1, "Role is required").max(120),
  intendedUse: z.string().trim().min(1, "Tell us how you'll use the pack").max(2000),
  ndaSigned: z.boolean(),
});

async function notifySlack(payload: z.infer<typeof BodySchema>): Promise<boolean> {
  const webhook = process.env.TRUST_SLACK_WEBHOOK_URL;
  if (!webhook) return false; // Slack is optional — silently skip if unconfigured.

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
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    // Other confirmed legs can still accept the request.
    console.error("trust-pack-request slack notify failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
  return false;
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

  let persisted = false;
  // A confirmed durable write is one valid acceptance path.
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
    persisted = !error;
    if (error) {
      console.error("trust-pack-request insert failed", { message: error.message });
    }
  } catch (error) {
    console.error("trust-pack-request service client unavailable", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  // 2. Live notification (fail-soft): Slack ping + email to Kate's inbox.
  const slackNotified = await notifySlack(data);
  const notified = await notifyLead({
    formName: "Trust Centre — security pack request",
    name: data.name,
    fields: {
      org: data.org,
      role: data.role,
      ndaSigned: data.ndaSigned,
      intendedUse: data.intendedUse,
      routeTo: SECURITY_INBOX,
    },
    sourceUrl: req.headers.get("referer"),
    ip: clientIpFromHeaders(req.headers),
  }).catch(() => false);

  const accepted = persisted || slackNotified || notified;
  if (!accepted) return NextResponse.json({ ok: false, accepted: false,
    error: 'We could not confirm receipt. Your fields are still here. Continue by email or try again.' }, { status: 503 });
  return NextResponse.json({ ok: true, accepted: true });
}
