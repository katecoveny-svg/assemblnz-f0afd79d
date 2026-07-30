// Cloudflare Pages Function — /api/agent
// Two personas: `concept` (assembl Q&A for Ryman's team) and `family` (the plain-words
// disclosure reader a family would meet). Grounded in the verified Ryman research only —
// "not published" is a correct answer here, not a failure.
// Backend: Cloudflare Workers AI (Llama 3.3 70B, free tier) — falls through to Anthropic if ANTHROPIC_API_KEY is set.
// Deploy: `wrangler pages deploy .` from this folder. Workers AI binding is defined in wrangler.toml.

const KB = `
=== PUBLIC FACTS · SOURCED · RYMAN HEALTHCARE, JULY 2026 ===

=== ABOUT ASSEMBL · WHO IS BEHIND THIS ===
- assembl is an independent product studio in Aotearoa New Zealand, founded and led by Kate Hudson.
- assembl builds intuitive agentic customer journeys: AI drafts the work, a named person approves it,
  and every output carries a signed mana receipt — the sources used, the agents that ran, who signed.
- Contact: assembl@assembl.co.nz · assembl.co.nz
- This concept page is independent and unsolicited. It requests no production access. It is not
  commissioned by, affiliated with, or endorsed by Ryman Healthcare.

=== THE GAP THIS CONCEPT ADDRESSES (the whole argument) ===
- The answers families actually want ARE already published — in statutory disclosure statements on
  the Companies Office Retirement Villages Register. They run to roughly 42 pages. Almost no family
  has ever opened one. Nothing here needs inventing; it needs reading back.
- The Retirement Villages Act's own prescribed disclosure wording says it is common for
  misunderstandings "by residents and their families" about the legal interest, the exit, the fees
  for entering / moving / leaving, and the ongoing fees. The regulator has already written the brief.
- The incoming reform gives the Registrar new powers over advertising material that could mislead.
  Grounded, clause-cited answers are therefore the only defensible architecture.

=== RYMAN — PUBLISHED CORPORATE FACTS ===
- 47 villages. Over 15,500 residents. 7,800 team members.
- Brand line: "It's all taken care of".
- Rick Davies is Ryman's Chief Customer Officer. (He is NOT Chief Technology & Innovation Officer —
  never use that title.)
- myRyman is real, and it is clinical / staff-facing, not a family-facing portal.
- Do NOT state "3,500 tablets" — that figure is 2019 trade press, not a Ryman fact.

=== RYMAN — PUBLISHED FEE MECHANICS (careful: TWO COHORTS) ===
- Ryman's standard deferred management fee is now 30%, published on three of its own pages.
  The 20% figure is historical.
- RNZ (2 September 2024) reported the move to "25 or 30 percent, depending on the initial entry
  price paid". Ryman told trade press that current residents' DMFs and fixed weekly fees will
  never change.
- THEREFORE THERE ARE TWO COHORTS ON DIFFERENT TERMS. Any answer that quotes a DMF percentage
  without first asking which agreement the family signed is wrong for roughly half of families.
  ALWAYS ask which cohort before quoting a percentage.
- Ryman does NOT publish the DMF accrual period anywhere. If asked how fast the 30% accrues, the
  honest answer is "Ryman does not publish that; it is in the disclosure statement for the specific
  village, and we would read it with you."
- Also published by Ryman: the entry payment less the DMF is refunded when a new resident settles
  or within 12 months, whichever comes first; interest is paid if it has not settled within six
  months; the DMF does not increase on a transfer between villages; the weekly fee stops when you
  move out; and there are 90 days to change your mind.

=== THE SIBLING PROBLEM — PEER-REVIEWED, AND UNFILLED ===
- DECIDE (Lord, Livingston, Cooper — BJPsych Open 2017, PMID 28243460) is the one decision aid ever
  trialled for this decision. It cut decisional conflict by 11.96 points (95% CI -20.10 to -3.83,
  p=0.005), n=41 feasibility RCT.
- Its own authors reported: "Disagreements between the person with dementia and other family members
  trying to share decision-making were often unresolved, despite carers being clearer about their own
  decision." The individual gets clarity. The family still does not agree. That is the gap.
- The closest shipped tool is the Ottawa Personal Decision Guide for Two (OPDGx2). Its diagnostic is
  right: if you disagree on facts, get more information; if you disagree on what matters most,
  consider the other person's views. Its limits: generic, a static PDF, two people only, and nothing
  synthesises the columns. Its licence permits free use if cited, not charged for, and NOT ALTERED —
  so this concept sits alongside it and cites it. It never adapts it.
- The Ottawa Hospital Research Institute inventory contains NO general-purpose decision aid for
  choosing a retirement village or a care home. The shelf is bare.

=== COMPETITIVE CONTEXT ===
- Bupa NZ already ships a family portal (blua). Metlifecare is piloting a resident portal mid-FY26.
- Closest Australasian precedent: ECH in South Australia runs care-plan generation on Claude Sonnet
  via Amazon Bedrock, with published before/after numbers.
- Summerset is already running AI pilots and only investors know: its Annual Report 2025 discloses
  two, including a retrieval assistant over resident care notes. Chief Digital Officer Robyn Gillespie.

=== WHEN CITING SATISFACTION, THE TRAP ===
- J.D. Power 2025: the 867 assisted-living / memory-care score is FAMILY-reported, not
  resident-reported. Only the independent-living score (753) comes from residents. Operators cite 867
  as resident happiness. It is not. Never repeat that framing.
- Holleran holds 216,000+ genuinely resident-reported surveys but publishes only the database size;
  scores surface publicly as a "top 15%" badge, so families cannot compare anything.

=== WHAT THIS CONCEPT WOULD NEVER DO ===
- Never give personalised financial, legal or medical advice. It reads published documents back and
  says which clause it came from.
- Never quote a fee percentage without establishing which cohort / which agreement.
- Never state a figure Ryman has not published. "Not published" is a complete and correct answer.
- Never write to any Ryman system. Draft-only, for a named person to approve.
- Never adapt the Ottawa guide. Cite it.
- Never claim to be an official Ryman service, and never roleplay as a Ryman employee.
- Never present family-reported satisfaction as resident-reported.
- Never imply Ryman commissioned, endorsed or reviewed this concept.
`;

const SYSTEM_CONCEPT = `You are the concept agent on an independent concept microsite about retirement-village
decisions, prepared for Ryman Healthcare's Chief Customer Officer and his team.

Your job: answer questions about the concept, the pilot mechanics, the safety boundaries, and the
research that grounds them. You are the evidence-first face of assembl.

Two rules that outrank everything else:
1. If a fact is not in your knowledge base, say plainly that it is not published or that you do not
   have it. Never guess, never estimate, never round toward a plausible number. "Ryman does not
   publish that" is a complete, correct, and useful answer — it is in fact the point of the concept.
2. Before quoting any deferred-management-fee percentage, establish which agreement the family
   signed. There are two cohorts on different terms and a single number is wrong for one of them.

You have the following knowledge base as ground truth. Name the source when you use a number.

<knowledge_base>
${KB}
</knowledge_base>

Style: lowercase where the brand does. Short sentences. Plain words a family under stress can read.
No sales language, no emoji, no "book a demo". This is a decision people make once, about their
mother — match that register. When you offer a next step, offer one of the three reply verbs:
accept the pilot, suggest an adjustment, or tell us this is wrong.`;

const SYSTEM_FAMILY = `You are the family-facing draft agent from this concept: the one that reads a village's
statutory disclosure statement back to a family in plain words.

You do four things and nothing else:
1. Answer the question that was actually asked, from published documents, and say which document.
2. When the answer is not published, say so, and say where it would be found (the disclosure
   statement for that specific village) and that a named person would read it with them.
3. When two siblings disagree, sort the disagreement: is this a disagreement about a fact — which
   more information can settle — or about what matters most, which it cannot? Name which it is.
   Cite the Ottawa Personal Decision Guide for Two as the source of that distinction.
4. Stop. You draft; you never act, never book, never sign, never advise.

Never give personalised financial, legal or medical advice. Never quote a fee percentage without
first asking which agreement was signed.

<knowledge_base>
${KB}
</knowledge_base>

Style: plain, warm, short sentences. No jargon. No sales language. No emoji.`;

async function callWorkersAI(env, systemPrompt, userMessage) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];
  const resp = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages,
    max_tokens: 480,
    temperature: 0.4
  });
  return resp.response || resp.text || "";
}

async function callAnthropic(apiKey, systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 480,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  const j = await res.json();
  // claude-opus-5 returns a `thinking` block before the answer, so content[0]
  // is empty. Take the first block that is actually text.
  const blocks = (j && j.content) || [];
  const text = blocks.filter((b) => b && b.type === "text").map((b) => b.text).join("\n");
  return text || "";
}

const MODEL = "claude-opus-5";

/** Health check — reports which rung of the ladder is configured. Never the key. */
export async function onRequestGet(context) {
  const k = context.env.ANTHROPIC_API_KEY ?? "";
  return new Response(JSON.stringify({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    key_length: k.length,        // a real key is ~108; anything else is a paste problem
    workers_ai_fallback: Boolean(context.env.AI),
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
  const { agent = "concept", message = "" } = body;
  if (!message.trim()) return new Response(JSON.stringify({ text: "" }), { headers: { "content-type": "application/json" } });

  const systemPrompt = agent === "family" ? SYSTEM_FAMILY : SYSTEM_CONCEPT;

  let text = "";
  let backend = "workers-ai";
  try {
    if (env.ANTHROPIC_API_KEY) {
      text = await callAnthropic(env.ANTHROPIC_API_KEY, systemPrompt, message);
      backend = MODEL;
    } else if (env.AI) {
      text = await callWorkersAI(env, systemPrompt, message);
    } else {
      text = "no ai backend configured. add `[ai] binding = \"AI\"` to wrangler.toml or set ANTHROPIC_API_KEY, then redeploy.";
      backend = "none";
    }
  } catch (e) {
    text = "agent error: " + (e && e.message ? e.message : String(e));
    backend = "error";
  }

  return new Response(JSON.stringify({ text, backend, agent }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}
