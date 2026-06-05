/**
 * POST /api/tool-leads — optional "email me my result" capture for free HAPAI tools.
 *
 * Writes a row to public.tool_leads. Fail-closed and non-blocking by design:
 * the tool itself never depends on capture succeeding, so the client treats a
 * non-2xx here as a soft failure and keeps showing the result.
 *
 * Body: { email, toolSlug, payload?, consentMarketing?, source? }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getHapaiTool } from "@/lib/hapai/shareable-tools";
import { getServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  email: z.string().email("A valid email is required").max(254),
  toolSlug: z.string().min(1).max(64),
  payload: z.record(z.string(), z.unknown()).optional(),
  consentMarketing: z.boolean().optional(),
  source: z.string().max(200).optional(),
});

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

  const { email, toolSlug, payload, consentMarketing, source } = parsed.data;

  // Soft guard: only accept slugs we recognise as real tools.
  if (!getHapaiTool(toolSlug)) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  }

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch (error) {
    // Fail closed: log, but do not surface internals. The tool keeps working.
    console.error("tool-leads service client unavailable", {
      toolSlug,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Capture is unavailable right now" }, { status: 503 });
  }

  const { data, error } = await service
    .from("tool_leads")
    .insert({
      email: email.trim().toLowerCase(),
      tool_slug: toolSlug,
      payload: payload ?? {},
      consent_marketing: consentMarketing ?? false,
      source: source ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("tool-leads insert failed", { toolSlug, message: error?.message });
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
