import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the assembl 9am Brief specialist for a New Zealand operator.

Turn messy morning context into a useful operating brief. The output must help a human decide what to do first.

Inputs may include a photo, screenshot, timetable, whiteboard, school notice, sports draw, agenda, or messy note. If an attachment is visible, extract only what you can confidently read and turn it into actions. Do not pretend unclear text is readable.

OUTPUT FORMAT — return HTML using only these tags: <h2>, <p>, <ul>, <li>, <strong>. No other tags. No markdown fences.

Sections in this exact order:
<h2>Morning read</h2> — one short paragraph.
<h2>Top 3 priorities</h2> — exactly three bullets, each with why it matters today.
<h2>Follow-ups</h2> — bullets with owner if named. If none, write <p>None recorded.</p>
<h2>Calendar risks</h2> — bullets for meetings, deadlines, travel, prep gaps, or double-booking risks. If none, write <p>None obvious from the context supplied.</p>
<h2>Pack, prep, bring</h2> — bullets for things the person should gather, bring, print, read, ask, or prepare today. If none, write <p>Nothing obvious from the context supplied.</p>
<h2>Drafts to prepare</h2> — bullets for emails, messages, agenda notes, or documents the operator should draft for human review.
<h2>Decision log</h2> — bullets for any decisions already made or decisions that need to be made today.

RULES:
- Use New Zealand English.
- Lowercase "assembl" if it appears.
- Do not invent people, meetings, obligations, or deadlines.
- Do not claim anything was sent, booked, scheduled, filed, or changed.
- Every external action is draft-only and needs named human approval.
- Keep the tone calm, practical, and executive-assistant useful without sounding American corporate.`;

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
    .replace(/<\/?(?!h2\b|p\b|ul\b|li\b|strong\b)[a-z][^>]*>/gi, "")
    .replace(/\bonly an ai\b/gi, "only a specialist")
    .trim();
}

function appendWatermark(html: string) {
  return (
    html +
    `<footer style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(35,33,31,0.12);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(35,33,31,0.62);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;line-height:1.5;">` +
    `<span><span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;color:#2B6B57;">assembl</span> · 9am brief</span>` +
    `<a href="https://assembl.co.nz/hapai/9am-brief" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">assembl.co.nz/hapai/9am-brief →</a>` +
    `</footer>`
  );
}

function lineItems(value: string) {
  return value
    .split(/[\n\r]+/)
    .map((line) => line.replace(/^[-•*\d.\s]+/, "").trim())
    .filter((line) => line.length > 2)
    .slice(0, 16);
}

function fallbackBriefHtml(input: {
  today: string;
  meetings: string;
  followUps: string;
  worries: string;
  notes: string;
  imageAttached: boolean;
}) {
  const meetings = lineItems(input.meetings);
  const followUps = lineItems(input.followUps);
  const worries = lineItems(input.worries);
  const notes = lineItems(input.notes);
  const all = [...meetings, ...followUps, ...worries, ...notes];
  const priorities = [...worries, ...followUps, ...meetings, ...notes].slice(0, 3);
  while (priorities.length < 3) priorities.push("Choose the next concrete action before opening inbox or chat.");
  const bringItems = all.filter((item) =>
    /\b(pack|bring|wear|print|read|prep|prepare|permission|slip|book|uniform|kit|boots|trainers|lunch|bottle|umbrella|rain|jacket|library|sport|training|test|homework)\b/i.test(
      item,
    ),
  );
  if (input.imageAttached) {
    bringItems.unshift("Review the uploaded image and turn any visible timetable, notice, gear, dates, or deadlines into a bring-list before leaving.");
  }

  const ul = (items: string[]) =>
    items.length === 0
      ? "<p>None recorded.</p>"
      : `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  return [
    `<h2>Morning read</h2><p>${escapeHtml(input.today || "Today needs a calm scan of meetings, follow-ups, and loose commitments before new work starts.")}</p>`,
    `<h2>Top 3 priorities</h2><ul>${priorities
      .map((item) => `<li><strong>${escapeHtml(item.split(":")[0] || "Priority")}:</strong> ${escapeHtml(item)}</li>`)
      .join("")}</ul>`,
    `<h2>Follow-ups</h2>${ul(followUps)}`,
    `<h2>Calendar risks</h2>${meetings.length || worries.length ? ul([...meetings, ...worries].slice(0, 8)) : "<p>None obvious from the context supplied.</p>"}`,
    `<h2>Pack, prep, bring</h2>${bringItems.length ? ul(bringItems.slice(0, 8)) : "<p>Nothing obvious from the context supplied.</p>"}`,
    `<h2>Drafts to prepare</h2>${ul(all.filter((item) => /\b(email|send|reply|draft|message|note|agenda|proposal)\b/i.test(item)).slice(0, 8))}`,
    `<h2>Decision log</h2>${ul(all.filter((item) => /\b(decide|decision|choose|approve|sign|confirm)\b/i.test(item)).slice(0, 8))}`,
  ].join("");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const today = String(body?.today ?? "").trim().slice(0, 1200);
  const meetings = String(body?.meetings ?? "").trim().slice(0, 4000);
  const followUps = String(body?.followUps ?? "").trim().slice(0, 4000);
  const worries = String(body?.worries ?? "").trim().slice(0, 3000);
  const notes = String(body?.notes ?? "").trim().slice(0, 8000);
  const imageDataUrl = String(body?.imageDataUrl ?? "").trim();

  if (imageDataUrl && !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Upload a photo or screenshot image." }, { status: 400 });
  }

  if (imageDataUrl.length > 11_200_000) {
    return NextResponse.json({ error: "Please upload an image under 8MB." }, { status: 413 });
  }

  if (`${today}${meetings}${followUps}${worries}${notes}${imageDataUrl ? "image" : ""}`.trim().length < 12) {
    return NextResponse.json({ error: "Add a few notes or upload a photo first." }, { status: 400 });
  }

  const message = `What today feels like:
${today || "Not supplied"}

Meetings and deadlines:
${meetings || "Not supplied"}

Follow-ups and people to nudge:
${followUps || "Not supplied"}

Risks, worries, or blocked work:
${worries || "Not supplied"}

Loose notes:
${notes || "Not supplied"}

Attachment:
${imageDataUrl ? "A photo or screenshot is attached. Read it carefully and extract visible dates, places, gear, deadlines, people, and action items. If it looks like a school or sports timetable, include pack/prep/bring reminders." : "No attachment supplied."}`;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "arataki",
          message,
          systemPromptOverride: SYSTEM_PROMPT,
          sessionId: crypto.randomUUID(),
          imageDataUrl: imageDataUrl || undefined,
          maxTokens: 2500,
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        return NextResponse.json({ html: appendWatermark(sanitizeHtml(data.response)) });
      }
    }
  } catch (error) {
    console.error("[hapai/9am-brief] generation failed", error);
  }

  return NextResponse.json({
    html: appendWatermark(fallbackBriefHtml({ today, meetings, followUps, worries, notes, imageAttached: Boolean(imageDataUrl) })),
  });
}
