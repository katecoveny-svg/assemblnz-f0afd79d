/**
 * POST /api/tool-leads — email capture for the free SPARK tools and the
 * /hapai library page.
 *
 * Writes a row to public.hapai_leads. Fail-closed and non-blocking by design:
 * the tool itself never depends on capture succeeding, so the client treats a
 * non-2xx here as a soft failure and keeps showing the result.
 *
 * Body: { email, toolSlug, payload?, consentMarketing?, source? }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getHapaiTool } from "@/lib/hapai/shareable-tools";
import { getServiceClient } from "@/lib/supabase/service";
import { recordLead, clientIpFromHeaders } from "@/lib/lead-capture";

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

  // Soft guard: accept registered SPARK tools plus the standalone capture
  // surfaces (the /hapai library page and the /ai-ready journey gate).
  if (!["hapai-library", "ai-ready"].includes(toolSlug) && !getHapaiTool(toolSlug)) {
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
    .from("hapai_leads")
    .insert({
      email: email.trim().toLowerCase(),
      tool_slug: toolSlug,
      source: source ?? null,
      consent: consentMarketing ?? false,
      payload: payload ?? {},
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("tool-leads insert failed", { toolSlug, message: error?.message });
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }

  // Notify Kate + mirror into the unified leads table. Fail-soft: the tool keeps
  // working even if the email or the mirror write fails.
  const tool = getHapaiTool(toolSlug);
  await recordLead({
    formName: `SPARK tool — ${tool?.name ?? toolSlug}`,
    email,
    fields: {
      tool: toolSlug,
      consentMarketing: consentMarketing ?? false,
      ...(payload ?? {}),
    },
    sourceUrl: source ?? req.headers.get("referer"),
    ip: clientIpFromHeaders(req.headers),
  });

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
