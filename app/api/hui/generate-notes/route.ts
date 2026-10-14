import { NextResponse } from "next/server";
import { rawNotesFallback, sanitizeNotes } from "@/lib/hui/notes-safety";
import { getHuiTemplate } from "@/lib/hui/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/hui/generate-notes
 * Turn a meeting transcript into a kete-specific structured record.
 *
 * Reuses the existing server-side LLM path (the public-chat-llm Supabase edge
 * function, where the Anthropic key lives) — no key is needed in this app.
 * Falls back to a deterministic structurer if the edge function is unreachable,
 * so failure preserves raw notes without inventing structured decisions.
 */

async function invokePublicChatLlm(body: Record<string, unknown>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/public-chat-llm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as { response?: unknown } | null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || typeof body.transcript !== 'string' || body.transcript.length > 24000 ||
      typeof body.templateId !== 'string' || (body.title !== undefined && typeof body.title !== 'string') ||
      (body.attendees !== undefined && typeof body.attendees !== 'string')) {
    return NextResponse.json({ error: 'Invalid or oversized meeting input.' }, { status: 400 });
  }
  const transcript = String(body?.transcript ?? "").trim();
  const templateId = String(body?.templateId ?? "").trim();
  const title = String(body?.title ?? "").trim().slice(0, 160);
  const attendees = String(body?.attendees ?? "").trim().slice(0, 400);

  const template = getHuiTemplate(templateId);
  if (!template) {
    return NextResponse.json({ error: "Pick a meeting output template first." }, { status: 400 });
  }
  if (transcript.length < 12) {
    return NextResponse.json({ error: "Add a transcript, recording, or pasted notes first." }, { status: 400 });
  }

  const message = `Meeting title: ${title || "Untitled meeting"}
Attendees: ${attendees || "Not supplied"}

Transcript / raw notes:
${transcript.slice(0, 24_000)}`;

  try {
    const data = await invokePublicChatLlm({
      kete: template.kete,
      message,
      systemPromptOverride: template.systemPrompt,
      sessionId: crypto.randomUUID(),
      maxTokens: 2800,
    });
    const safeHtml = typeof data?.response === "string" ? sanitizeNotes(data.response) : "";
    if (safeHtml) {
      return NextResponse.json({
        html: safeHtml,
        provenance: "provider-draft",
        degraded: false,
        template: { id: template.id, label: template.label, kete: template.kete, framework: template.framework },
      });
    }
  } catch (error) {
    console.error("[hui/generate-notes] LLM failed", error);
  }

  return NextResponse.json({
    html: rawNotesFallback(transcript),
    template: { id: template.id, label: template.label, kete: template.kete, framework: template.framework },
    degraded: true,
    provenance: "raw-notes-fallback",
  });
}
