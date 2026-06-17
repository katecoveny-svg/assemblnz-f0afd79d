/**
 * POST /api/data-waitlist — free-tier API-key request for the NZ regulatory
 * Data-as-a-Service offering (the /data page).
 *
 * Phase 1 is a waitlist: there is no live key issuance yet. This route routes
 * the inquiry through the shared, proven recordLead() pipeline so it does both
 * legs at once — emails assembl@assembl.co.nz AND writes a durable
 * public.lead_inquiries row. Fail-soft: recordLead never throws, so a slow or
 * blocked notification cannot break the form. We still 200 on a captured lead
 * and surface { notified, persisted } so the client can confirm honestly.
 *
 * Body: { email, name?, organisation?, useCase?, intent? }
 *   intent: 'api-key' (free Pulse waitlist) | 'talk-to-kate' (consult)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { recordLead, clientIpFromHeaders } from "@/lib/lead-capture";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  email: z.string().email("A valid email is required").max(254),
  name: z.string().max(120).optional(),
  organisation: z.string().max(160).optional(),
  useCase: z.string().max(2000).optional(),
  intent: z.enum(["api-key", "talk-to-kate"]).default("api-key"),
});

const INTENT_LABEL: Record<z.infer<typeof BodySchema>["intent"], string> = {
  "api-key": "Data API — free key waitlist",
  "talk-to-kate": "Data API — talk to Kate",
};

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

  const { email, name, organisation, useCase, intent } = parsed.data;

  const result = await recordLead({
    formName: INTENT_LABEL[intent],
    email,
    name: name || null,
    fields: {
      organisation: organisation ?? "",
      useCase: useCase ?? "",
      intent,
      offering: "Data-as-a-Service (NZ regulatory feeds)",
    },
    sourceUrl: req.headers.get("referer"),
    ip: clientIpFromHeaders(req.headers),
  });

  // A captured lead is a success for the visitor even if one leg lagged; the
  // safety net means Kate still gets it. Only 5xx if BOTH legs failed.
  if (!result.notified && !result.persisted) {
    console.error("[data-waitlist] both legs failed", { intent, email });
    return NextResponse.json(
      { error: "We couldn't record that just now. Please email assembl@assembl.co.nz." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
