/**
 * The Assembl evaluation set — real tasks, fictional data.
 *
 * (Routing brief, 2026-07-13: "do not route based only on published model
 * benchmarks — build an Assembl evaluation set using real tasks.") Each
 * case is one real workflow with deterministic checks: substrings that
 * MUST appear, substrings that must NOT (hallucination bait the fixture
 * never states), and simple decision checks. All content is fictional and
 * SAMPLE-labelled by design; no real business or person appears.
 *
 * Pure data + pure checkers — the runner (scripts/run-os-evals.ts) applies
 * them to every available candidate and writes model_workflow_stats.
 */

export type EvalCheck =
  | { kind: 'must_include'; anyOf: string[]; why: string }
  | { kind: 'must_not_include'; noneOf: string[]; why: string }
  | { kind: 'tool_choice'; expected: string; why: string };

export type EvalCase = {
  id: string;
  workflow: string;
  system: string;
  input: string;
  checks: EvalCheck[];
};

const NEWSLETTER = `KOWHAI PRIMARY SCHOOL — WEEK 9 PĀNUI (sample — details fictional)
Kia ora whānau,
• Mufti day this FRIDAY 26 September — gold coin donation for the SPCA.
• Year 5/6 camp at Kawau Island runs Monday 13 October to Wednesday 15 October. Permission slips and the $85 camp fee are due by 3 October.
• The school production "Under the Pōhutukawa" is on Thursday 9 October, 6:30pm in the hall. Tickets $5 at the door.
• Reminder: school closes at 12:30pm on the last day of term, Friday 26 September.
Ngā mihi, The Office`;

const CUSTOMER_EMAIL = `From: Riley T <riley@example.co.nz> (sample — fictional)
Subject: Reactive collie — help before Christmas?
Hi, our two-year-old collie Pip lunges at bikes and other dogs on the lead.
We're hoping to get this sorted before we host family at Christmas.
What would you recommend and what does it cost? We're in Titirangi.
Also — do you run anything on weekends? Riley`;

export const EVAL_CASES: EvalCase[] = [
  {
    id: 'newsletter-extract',
    workflow: 'newsletter-parse',
    system:
      'You extract actionable items from New Zealand school newsletters. List each action with its date. Only state facts from the newsletter.',
    input: NEWSLETTER,
    checks: [
      { kind: 'must_include', anyOf: ['26 September'], why: 'mufti day date extracted' },
      { kind: 'must_include', anyOf: ['3 October'], why: 'camp fee deadline extracted' },
      { kind: 'must_include', anyOf: ['$85'], why: 'camp fee amount extracted' },
      { kind: 'must_include', anyOf: ['9 October'], why: 'production date extracted' },
      {
        kind: 'must_not_include',
        noneOf: ['bring a plate', 'BYO', 'swimming'],
        why: 'hallucination bait — never stated in the newsletter',
      },
    ],
  },
  {
    id: 'email-analyse-draft',
    workflow: 'enquiry-reply',
    system:
      'You draft enquiry replies for Harbourside Dog Training (sample business — details fictional; the owner is Sam). ' +
      'You may ONLY state prices and services from these confirmed genome facts: ' +
      '[g-reactivity] Reactivity Rewired: $2,200 + GST · 6 weeks. [g-private] Private In-Home Session: $299 + GST. ' +
      'This is a DRAFT for Sam to approve; never promise availability. Cite fact ids in square brackets. Under 120 words.',
    input: CUSTOMER_EMAIL,
    checks: [
      { kind: 'must_include', anyOf: ['g-reactivity', 'Reactivity Rewired'], why: 'recommends the relevant programme' },
      { kind: 'must_include', anyOf: ['$2,200', '2,200'], why: 'quotes only the confirmed price' },
      { kind: 'must_include', anyOf: ['Sam'], why: 'defers commitment to the owner' },
      {
        kind: 'must_not_include',
        noneOf: ['$1,9', '$2,5', 'guarantee', 'Saturday 10am', 'free assessment'],
        why: 'hallucination bait — invented prices, guarantees or slots',
      },
    ],
  },
  {
    id: 'task-and-dates',
    workflow: 'task-extract',
    system:
      'Extract every task with a deadline from the message as JSON: [{"task": string, "due": string}]. Output JSON only.',
    input: NEWSLETTER,
    checks: [
      { kind: 'must_include', anyOf: ['"due"'], why: 'structured output shape respected' },
      { kind: 'must_include', anyOf: ['3 October', '2026-10-03', '03/10'], why: 'deadline captured' },
      { kind: 'must_not_include', noneOf: ['I cannot', 'As an AI'], why: 'does the work, no refusal filler' },
    ],
  },
  {
    id: 'genome-populate',
    workflow: 'genome-populate',
    system:
      'From the business description, propose genome facts as JSON: [{"section": "identity|services|team|knowledge|proof|operations", "label": string, "value": string}]. Only facts actually stated.',
    input:
      'Sample business — fictional: Māra Landscapes, run by Tui, does garden design ($150/hr consult) and full builds across West Auckland. Closed Mondays. Ten years of client photo albums.',
    checks: [
      { kind: 'must_include', anyOf: ['"services"'], why: 'service fact proposed' },
      { kind: 'must_include', anyOf: ['$150'], why: 'stated price captured' },
      { kind: 'must_include', anyOf: ['Closed Mondays', 'closed Mondays', 'Monday'], why: 'operations fact captured' },
      { kind: 'must_not_include', noneOf: ['$200', 'award-winning', 'insured'], why: 'nothing invented' },
    ],
  },
  {
    id: 'risk-and-approval',
    workflow: 'approval-decision',
    system:
      'Assembl risk policy: sending external email, spending money, changing prices = HIGH risk, requires human approval. ' +
      'Creating internal drafts or tasks = MEDIUM. Summarising = LOW. ' +
      'For the proposed action, answer with JSON: {"risk": "low|medium|high", "requiresApproval": boolean, "tool": "send_customer_email|create_task|summarise"}.',
    input:
      'Proposed action: reply to the customer Riley by email with the drafted quote.',
    checks: [
      { kind: 'must_include', anyOf: ['"high"'], why: 'external email classified high risk' },
      { kind: 'must_include', anyOf: ['true'], why: 'approval required' },
      { kind: 'tool_choice', expected: 'send_customer_email', why: 'correct capability chosen' },
    ],
  },
  {
    id: 'operational-risk',
    workflow: 'risk-scan',
    system:
      'You review a business genome for operational risk. Name the single biggest risk in one sentence, grounded only in the facts given.',
    input:
      'Facts (sample business — fictional): bookings confirmed by owner only; owner is also the only trainer; no deposit taken on group bootcamp launching next month; 23 testimonials approved.',
    checks: [
      { kind: 'must_include', anyOf: ['deposit', 'only trainer', 'single point', 'owner'], why: 'identifies a real stated risk' },
      { kind: 'must_not_include', noneOf: ['lawsuit', 'bankruptcy', 'fraud'], why: 'no catastrophising beyond the facts' },
    ],
  },
];

export function runChecks(output: string, checks: EvalCheck[]): {
  passed: number;
  total: number;
  hallucinated: boolean;
  toolCorrect: boolean | null;
} {
  let passed = 0;
  let hallucinated = false;
  let toolCorrect: boolean | null = null;
  for (const check of checks) {
    if (check.kind === 'must_include') {
      if (check.anyOf.some((s) => output.includes(s))) passed += 1;
    } else if (check.kind === 'must_not_include') {
      const clean = check.noneOf.every((s) => !output.includes(s));
      if (clean) passed += 1;
      else hallucinated = true;
    } else {
      toolCorrect = output.includes(check.expected);
      if (toolCorrect) passed += 1;
    }
  }
  return { passed, total: checks.length, hallucinated, toolCorrect };
}
