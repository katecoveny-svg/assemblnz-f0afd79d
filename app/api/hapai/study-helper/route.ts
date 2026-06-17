import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { gate, gateBlockedResponse } from "@/lib/gating/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the assembl Study Helper: a practical New Zealand study coach for students, parents, and teachers.

Tonight's default context is a Year 9 English novel study essay on "Falling into Rarohenga" by Steph Matuku.

KNOWN PUBLIC CONTEXT ONLY:
- The novel follows Tui and Kae entering Rarohenga to rescue Maia.
- Useful study lenses may include whānau/family, courage under challenge, identity and culture, relationships, setting, symbols/motifs, and foreshadowing.

OUTPUT FORMAT:
Return HTML only using these tags: <h2>, <p>, <ul>, <li>, <strong>. No markdown fences and no other tags.

CORE RULES:
- Coach the student to plan, recall, practise, and improve. Do not write a final essay for submission.
- Do not invent quotations, page numbers, teacher instructions, events, or assessment criteria.
- If the student has not supplied exact quotes, give "evidence to find" prompts and tell them to verify wording from their copy of the text.
- Use NZ English and a teenager-friendly tone without being babyish.
- Keep the student steady with concrete next actions, short sprints, and clear examples. Do not sound soft, vague, or waffly.
- If an image is supplied, read only visible text you can confidently identify. Say when something needs checking.
- When year level, subject, or task is supplied, map the help broadly to New Zealand Curriculum English skills: making meaning, creating meaning, ideas, language features, structure, evidence, audience, and purpose. Do not claim formal NCEA assessment coverage unless supplied.

For "essay-plan", include:
<h2>Exam focus</h2>
<h2>Thesis options</h2>
<h2>Paragraph plan</h2>
<h2>Evidence to find</h2>
<h2>Practice paragraph</h2>
<h2>Self-check before bed</h2>

For "quiz", include:
<h2>Recall warm-up</h2>
<h2>Theme questions</h2>
<h2>Evidence hunt</h2>
<h2>Quick oral drill</h2>
<h2>Mark your confidence</h2>

For "sprint", include:
<h2>Tonight's 60-minute plan</h2>
<h2>20-minute sprint one</h2>
<h2>20-minute sprint two</h2>
<h2>20-minute sprint three</h2>
<h2>What to pack for the exam</h2>

For "paragraph", include:
<h2>What is working</h2>
<h2>How to sharpen it</h2>
<h2>Rewrite scaffold</h2>
<h2>Quote check</h2>
<h2>Next practice</h2>`;

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
    .replace(/\bonly an ai\b/gi, "only a study coach")
    .trim();
}

function appendWatermark(html: string) {
  return (
    html +
    `<footer style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(35,33,31,0.12);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(35,33,31,0.62);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;line-height:1.5;">` +
    `<span><span style="font-family:'Fraunces',Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;color:#2B6B57;">assembl</span> · study helper</span>` +
    `<a href="https://assembl.co.nz/hapai/study-helper" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">assembl.co.nz/hapai/study-helper →</a>` +
    `</footer>`
  );
}

function fallbackStudyHtml(input: {
  student: string;
  yearLevel: string;
  textTitle: string;
  author: string;
  mode: string;
  essayQuestion: string;
  roughIdeas: string;
  quoteBank: string;
  imageAttached: boolean;
}) {
  const student = escapeHtml(input.student || "the student");
  const text = escapeHtml(input.textTitle || "the text");
  const author = escapeHtml(input.author || "the author");
  const question = escapeHtml(input.essayQuestion || "a novel study essay question");
  const suppliedQuotes =
    input.quoteBank.trim().length > 0 && !/\b(no exact|no quotes|not yet|none supplied|don'?t have)\b/i.test(input.quoteBank);
  const imageNote = input.imageAttached
    ? "<li>Check the uploaded photo against the book or teacher handout before relying on it.</li>"
    : "";

  if (input.mode === "quiz") {
    return [
      `<h2>Recall warm-up</h2><p>${student}, close the book for five minutes and say the story out loud: who wants what, what gets in the way, and what changes by the end.</p>`,
      `<h2>Theme questions</h2><ul><li>How does ${text} show whānau or loyalty under pressure?</li><li>What does Rarohenga make the characters face that ordinary life does not?</li><li>How does Steph Matuku use setting to create challenge, mystery, or meaning?</li></ul>`,
      `<h2>Evidence hunt</h2><ul><li>Find one exact quote for setting.</li><li>Find one exact quote for a relationship.</li><li>Find one exact quote where a character changes or makes a brave choice.</li>${imageNote}</ul>`,
      `<h2>Quick oral drill</h2><p>Use this sentence: <strong>Matuku shows [idea] through [moment], which helps the reader understand [deeper meaning].</strong></p>`,
      `<h2>Mark your confidence</h2><p>Give yourself 1 to 5 for plot, characters, themes, quotes, and paragraph structure. Start revising the lowest score.</p>`,
    ].join("");
  }

  if (input.mode === "sprint") {
    return [
      `<h2>Tonight's 60-minute plan</h2><p>Keep it simple: recall, organise, then practise. No rereading the whole novel tonight.</p>`,
      `<h2>20-minute sprint one</h2><ul><li>Write a 10-line plot summary from memory.</li><li>Circle three key moments that could fit many essay questions.</li></ul>`,
      `<h2>20-minute sprint two</h2><ul><li>Build three paragraph plans: setting, relationship, character change.</li><li>Add one quote or page reference to each. ${suppliedQuotes ? "Use the supplied quote bank first." : "Do not make up quotes; find exact wording in the book."}</li></ul>`,
      `<h2>20-minute sprint three</h2><ul><li>Write one timed paragraph using Point, Evidence, Explain, Link.</li><li>Read it aloud and add one sentence about the author's purpose.</li></ul>`,
      `<h2>What to pack for the exam</h2><ul><li>Pen, spare pen, water, and any allowed notes or text if the teacher permits them.</li><li>One memorised essay spine, not a full memorised essay.</li>${imageNote}</ul>`,
    ].join("");
  }

  if (input.mode === "paragraph") {
    return [
      `<h2>What is working</h2><p>Look for one clear idea, one piece of evidence, and one explanation of why it matters. Those three parts make the paragraph useful.</p>`,
      `<h2>How to sharpen it</h2><ul><li>Start with a direct point that answers the question: ${question}.</li><li>Use a scene or exact quote from ${text}; verify wording before memorising it.</li><li>Explain what Matuku is showing the reader, not just what happens.</li></ul>`,
      `<h2>Rewrite scaffold</h2><p><strong>In ${text}, ${author} shows [theme] when [moment]. This matters because [deeper meaning]. The evidence that proves this is [exact quote or scene]. This connects to the question because [link].</strong></p>`,
      `<h2>Quote check</h2><p>${suppliedQuotes ? "Use the quote bank, but check the punctuation and page reference in the novel." : "No exact quotes were supplied, so treat any quote slot as a placeholder until checked from the book."}</p>`,
      `<h2>Next practice</h2><p>Write one paragraph in eight minutes, then spend two minutes adding a stronger final linking sentence.</p>`,
    ].join("");
  }

  return [
    `<h2>Exam focus</h2><p>${student} is preparing for a ${escapeHtml(input.yearLevel || "Year 9")} English essay on ${text} by ${author}. The likely task is: ${question}.</p>`,
    `<h2>Thesis options</h2><ul><li><strong>Character and challenge:</strong> The novel shows that courage is built through pressure, not comfort.</li><li><strong>Whānau and loyalty:</strong> The journey matters because the characters are driven by care for each other.</li><li><strong>Setting and meaning:</strong> Rarohenga is more than a backdrop; it tests the characters and reveals what they value.</li></ul>`,
    `<h2>Paragraph plan</h2><ul><li><strong>Paragraph 1:</strong> Introduce a key challenge and explain how it reveals character.</li><li><strong>Paragraph 2:</strong> Use a relationship or whānau moment to show what motivates the characters.</li><li><strong>Paragraph 3:</strong> Explain how the setting of Rarohenga shapes mood, danger, or growth.</li></ul>`,
    `<h2>Evidence to find</h2><ul><li>One exact quote about Rarohenga or atmosphere.</li><li>One exact quote showing loyalty, fear, bravery, or change.</li><li>One page reference for an important decision or turning point.</li>${imageNote}</ul>`,
    `<h2>Practice paragraph</h2><p>Use PEEL: <strong>Point</strong> answer the question, <strong>Evidence</strong> quote or scene, <strong>Explain</strong> author's purpose, <strong>Link</strong> back to the question.</p>`,
    `<h2>Self-check before bed</h2><ul><li>Can you explain the plot in 60 seconds?</li><li>Can you name three themes and one scene for each?</li><li>Have you checked every quote from the book?</li><li>Have you practised one timed paragraph?</li></ul>`,
  ].join("");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const student = String(body?.student ?? "Jack").trim().slice(0, 120);
  const yearLevel = String(body?.yearLevel ?? "Year 9").trim().slice(0, 80);
  const school = String(body?.school ?? "Sacred Heart College").trim().slice(0, 160);
  const textTitle = String(body?.textTitle ?? "Falling into Rarohenga").trim().slice(0, 180);
  const author = String(body?.author ?? "Steph Matuku").trim().slice(0, 160);
  const examContext = String(body?.examContext ?? "English novel study essay tomorrow").trim().slice(0, 400);
  const essayQuestion = String(body?.essayQuestion ?? "").trim().slice(0, 1200);
  const roughIdeas = String(body?.roughIdeas ?? "").trim().slice(0, 6000);
  const quoteBank = String(body?.quoteBank ?? "").trim().slice(0, 4000);
  const mode = ["essay-plan", "quiz", "sprint", "paragraph"].includes(String(body?.mode))
    ? String(body?.mode)
    : "essay-plan";
  const imageDataUrl = String(body?.imageDataUrl ?? "").trim();

  if (imageDataUrl && !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Upload a photo or screenshot image." }, { status: 400 });
  }

  if (imageDataUrl.length > 11_200_000) {
    return NextResponse.json({ error: "Please upload an image under 8MB." }, { status: 413 });
  }

  if (`${essayQuestion}${roughIdeas}${quoteBank}${imageDataUrl ? "image" : ""}`.trim().length < 8) {
    return NextResponse.json({ error: "Add a likely question, rough notes, a quote bank, or upload a photo first." }, { status: 400 });
  }

  // Access gate: 1 free run for anonymous students, 5/day once an email lifts it.
  const gateVerdict = await gate(req, "hapai", "study-helper");
  if (!gateVerdict.allowed) return gateBlockedResponse(gateVerdict);

  const message = `Student: ${student}
Year / school: ${yearLevel}, ${school}
Assessment context: ${examContext}
Text: ${textTitle}
Author: ${author}
Mode: ${mode}

Likely question or teacher wording:
${essayQuestion || "Not supplied. Build a flexible study plan for a novel study essay."}

What the student remembers or is worried about:
${roughIdeas || "Not supplied."}

Quote bank or page references supplied by the student:
${quoteBank || "No exact quotes supplied. Do not invent quotes; give evidence-to-find prompts instead."}

Attachment:
${imageDataUrl ? "A photo or screenshot is attached. Read visible text only if clear; otherwise say what needs checking." : "No attachment supplied."}`;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "ako",
          message,
          systemPromptOverride: SYSTEM_PROMPT,
          sessionId: crypto.randomUUID(),
          imageDataUrl: imageDataUrl || undefined,
          maxTokens: 2600,
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        return NextResponse.json({ html: appendWatermark(sanitizeHtml(data.response)) });
      }
    }
  } catch (error) {
    console.error("[hapai/study-helper] generation failed", error);
  }

  return NextResponse.json({
    html: appendWatermark(
      fallbackStudyHtml({
        student,
        yearLevel,
        textTitle,
        author,
        mode,
        essayQuestion,
        roughIdeas,
        quoteBank,
        imageAttached: Boolean(imageDataUrl),
      }),
    ),
  });
}
