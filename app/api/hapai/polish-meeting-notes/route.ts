import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

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
- Strip filler words and false starts from the transcript.`;

function sanitizeHtml(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<\/?(?!h2\b|p\b|ul\b|li\b|strong\b)[a-z][^>]*>/gi, "")
    .replace(/\bonly an ai\b/gi, "only a specialist")
    .trim();
}

function fallbackMeetingHtml(raw: string, title: string) {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
  const summary = lines[0] ?? "Notes were captured for this meeting.";
  const discussion = lines.length ? lines : ["Raw notes received."];

  return `<h2>Summary</h2><p>${escapeHtml(title || summary)}</p><h2>Decisions</h2><p>None recorded.</p><h2>Action items</h2><p>None recorded.</p><h2>Discussion</h2><ul>${discussion
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("")}</ul><h2>Next steps</h2><ul><li>Review and assign owners where needed.</li></ul>`;
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

  if (raw.length < 8) {
    return NextResponse.json({ error: "Add a transcript or raw notes first." }, { status: 400 });
  }

  const message = `${SYSTEM_PROMPT}

Meeting title: ${title || "Untitled meeting"}
Attendees: ${attendees || "Not supplied"}

Raw input:
${raw.slice(0, 18_000)}`;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "auaha",
          message,
          sessionId: crypto.randomUUID(),
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        return NextResponse.json({ html: sanitizeHtml(data.response) });
      }
    }
  } catch (error) {
    console.error("[hapai/meeting-notes] polish failed", error);
  }

  return NextResponse.json({ html: fallbackMeetingHtml(raw, title) });
}
