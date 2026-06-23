import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are an assembl meeting-note specialist. Turn the following raw meeting input into a clean, structured record.

OUTPUT FORMAT — return HTML using only these tags: <h2>, <p>, <ul>, <li>, <strong>. No other tags. No markdown fences.

Sections in this exact order:
<h2>Summary</h2> — one paragraph, 2-3 sentences.
<h2>Decisions</h2> — bullet list. If none, write <p>None recorded.</p>
<h2>Action items</h2> — bullet list. Format each as "<strong>Owner:</strong> task — due date if mentioned". If no owner is named, write "<strong>Unassigned:</strong>". If none, write <p>None recorded.</p>
<h2>Discussion</h2> — bullet list of the key topics covered, one line each, in the order they came up.
<h2>Next steps</h2> — bullet list of follow-ups, parking-lot items, or future meeting topics.

RULES:
- Use New Zealand English (organisation, behaviour, etc).
- Lowercase "assembl" if it appears.
- Do not invent details. If the input is sparse, the output should be sparse.
- Use "agent" or "specialist" if the input mentions automated tools.
- Keep tone clear and businesslike, not breezy.
- Strip filler words and false starts from the transcript.
- Never mention injected context, runtime context, knowledge retrieval, or whether the query is inside or outside context.`;

function sanitizeHtml(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<p>\s*The user query falls outside the injected context\.?\s*<\/p>/gi, "")
    .replace(/\bThe user query falls outside the injected context\.?\b/gi, "")
    .replace(/<\/?(?!h2\b|p\b|ul\b|li\b|strong\b)[a-z][^>]*>/gi, "")
    .replace(/\bonly an ai\b/gi, "only a specialist")
    .trim();
}

function fallbackMeetingHtml(raw: string, title: string, attendees: string) {
  // Tokenise on newlines AND on sentence-ending dots so "we agreed X. Tom sends Y." both get picked up
  const lines = raw
    .split(/[\n\r]+|(?<=\.)\s+(?=[A-Z])/)
    .map((line) => line.replace(/^[-•*\d.\s]+/, "").trim())
    .filter((line) => line.length > 2);

  const decisionPatterns = /\b(agreed|decided|decision|locked|signed[- ]?off|approved|chose|confirmed|going with)\b/i;
  const actionPatterns = /\b(will|to send|to share|to draft|to chase|to follow up|action|owner|by (mon|tue|wed|thu|fri|sat|sun|tomorrow|today|next week|end of (?:day|week))|EOD|EOW|due )/i;
  const nextStepsPatterns = /\b(next sync|next meeting|follow[- ]?up|park|parked|open question|tbc|tbd|to schedule)\b/i;

  // Try to capture owner from "Tom sends X" or "Kate to draft Y" patterns
  const attendeeList = attendees.split(/[,;]/).map((a) => a.trim()).filter(Boolean);
  function tagOwner(line: string) {
    for (const a of attendeeList) {
      if (!a) continue;
      const first = a.split(/\s+/)[0];
      if (new RegExp(`\\b${first}\\b`, "i").test(line)) {
        return `<strong>${escapeHtml(first)}:</strong> ${escapeHtml(line)}`;
      }
    }
    // Generic "X to Y" or "X sends Y" pattern
    const m = line.match(/^([A-Z][a-zāēīōū]+)\s+(to|sends|drafts|reviews|chases|signs|sets|blocks|emails)\b/);
    if (m) return `<strong>${escapeHtml(m[1])}:</strong> ${escapeHtml(line)}`;
    return `<strong>Unassigned:</strong> ${escapeHtml(line)}`;
  }

  const decisions: string[] = [];
  const actions: string[] = [];
  const nextSteps: string[] = [];
  const discussion: string[] = [];

  for (const line of lines) {
    if (actionPatterns.test(line)) actions.push(tagOwner(line));
    else if (decisionPatterns.test(line)) decisions.push(escapeHtml(line));
    else if (nextStepsPatterns.test(line)) nextSteps.push(escapeHtml(line));
    else discussion.push(escapeHtml(line));
  }

  const summary = title
    ? `${escapeHtml(title)}. Captured from ${attendees ? "attendees: " + escapeHtml(attendees) : "the meeting notes"}.`
    : "Notes captured from the meeting.";

  const ul = (items: string[]) =>
    items.length === 0
      ? "<p>None recorded.</p>"
      : `<ul>${items.map((line) => `<li>${line}</li>`).join("")}</ul>`;

  return [
    `<h2>Summary</h2><p>${summary}</p>`,
    `<h2>Decisions</h2>${ul(decisions)}`,
    `<h2>Action items</h2>${ul(actions)}`,
    `<h2>Discussion</h2>${ul(discussion.slice(0, 12))}`,
    `<h2>Next steps</h2>${ul(nextSteps.length ? nextSteps : ["Review and assign owners where needed."])}`,
  ].join("");
}

function appendAssemblWatermark(html: string, toolLabel: string, toolPath: string) {
  return (
    html +
    `<footer style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(35,33,31,0.12);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(35,33,31,0.62);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;line-height:1.5;">` +
    `<span><span style="font-family:'Fraunces',Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;color:#3A3832;">assembl</span> · ${escapeHtml(toolLabel)}</span>` +
    `<a href="https://assembl.co.nz${toolPath}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">assembl.co.nz${escapeHtml(toolPath)} →</a>` +
    `</footer>`
  );
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

  const response = await fetch(`${supabaseUrl}/functions/v1/public-chat-llm`, {
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const raw = String(body?.raw ?? "").trim();
  const title = String(body?.title ?? "").trim().slice(0, 140);
  const attendees = String(body?.attendees ?? "").trim().slice(0, 300);
  const imageDataUrl = String(body?.imageDataUrl ?? "").trim();

  if (raw.length < 8 && !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Add a transcript, raw notes, or a meeting photo first." }, { status: 400 });
  }

  const message = `Meeting title: ${title || "Untitled meeting"}
Attendees: ${attendees || "Not supplied"}

Raw input:
${raw.slice(0, 18_000)}

${imageDataUrl ? "An agenda, whiteboard, screenshot, or meeting-room photo is attached. Read visible text and combine it with the raw input." : ""}`;

  try {
    const data = await invokePublicChatLlm({
      kete: "auaha",
      message,
      imageDataUrl: imageDataUrl || undefined,
      systemPromptOverride: SYSTEM_PROMPT,
      sessionId: crypto.randomUUID(),
      maxTokens: 2500,
    });
    if (typeof data?.response === "string" && data.response.trim()) {
      const cleaned = sanitizeHtml(data.response);
      return NextResponse.json({ html: appendAssemblWatermark(cleaned, "meeting recorder", "/hapai/meeting-recorder") });
    }
  } catch (error) {
    console.error("[hapai/meeting-notes] polish failed", error);
  }

  return NextResponse.json({
    html: appendAssemblWatermark(
      fallbackMeetingHtml(
        raw || (imageDataUrl ? "Meeting photo received, but the visible text could not be read clearly." : ""),
        title,
        attendees,
      ),
      "meeting recorder",
      "/hapai/meeting-recorder",
    ),
  });
}
