import { NextResponse } from "next/server";
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
 * so the flow always returns something a person can file.
 */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeHtml(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<\/?(?!h2\b|h3\b|p\b|ul\b|li\b|strong\b)[a-z][^>]*>/gi, "")
    .replace(/\bAs an AI\b/gi, "As a specialist")
    .trim();
}

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
  });

  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as { response?: unknown } | null;
}

/** Deterministic fallback so the flow never dead-ends if the LLM is unreachable. */
function fallbackHtml(raw: string, sections: string[]) {
  const lines = raw
    .split(/[\n\r]+|(?<=\.)\s+(?=[A-Z])/)
    .map((line) => line.replace(/^[-•*\d.\s]+/, "").trim())
    .filter((line) => line.length > 2);

  const summary = lines.slice(0, 2).join(" ") || "Notes captured from the meeting.";
  const body = sections
    .map((heading, i) => {
      if (i === 0) return `<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(summary)}</p>`;
      const slice = lines.slice(2).filter((_, idx) => idx % (sections.length - 1) === i - 1);
      const items = slice.length
        ? `<ul>${slice.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`
        : "<p>None recorded.</p>";
      return `<h2>${escapeHtml(heading)}</h2>${items}`;
    })
    .join("");

  return body;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
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
    if (typeof data?.response === "string" && data.response.trim()) {
      return NextResponse.json({
        html: sanitizeHtml(data.response),
        template: { id: template.id, label: template.label, kete: template.kete, framework: template.framework },
      });
    }
  } catch (error) {
    console.error("[hui/generate-notes] LLM failed", error);
  }

  return NextResponse.json({
    html: fallbackHtml(transcript, template.sections),
    template: { id: template.id, label: template.label, kete: template.kete, framework: template.framework },
    degraded: true,
  });
}
