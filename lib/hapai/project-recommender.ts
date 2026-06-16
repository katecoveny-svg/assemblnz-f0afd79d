export type HapaiTier = "akoranga" | "kaimahi" | "tohunga" | "rangatira" | "pou";
export type HapaiFunction = "ops" | "hr" | "marketing" | "finance" | "sales" | "support" | "other";
export type HapaiTeamSize = "solo" | "small" | "medium" | "large";

export type ProjectCandidate = {
  slug: string;
  title: string;
  tier: HapaiTier[];
  functions: HapaiFunction[];
  sizes: HapaiTeamSize[];
  effortHours: number;
  hoursSavedPerWeek: number;
  summary: string;
  buildHint: string;
  tools: string[];
  prompts: string[];
  failureModes: string[];
};

export const NZ_BLENDED_HOURLY_RATE = 80;

export const TIER_LABELS: Record<HapaiTier, string> = {
  akoranga: "akoranga",
  kaimahi: "kaimahi",
  tohunga: "tohunga",
  rangatira: "rangatira",
  pou: "pou",
};

export const PROJECT_CANDIDATES: ProjectCandidate[] = [
  {
    slug: "shared-prompt-library",
    title: "Shared prompt library",
    tier: ["akoranga", "kaimahi"],
    functions: ["ops", "hr", "marketing", "finance", "sales", "support", "other"],
    sizes: ["solo", "small", "medium", "large"],
    effortHours: 4,
    hoursSavedPerWeek: 3,
    summary: "Put the team’s useful prompts in one searchable place with owners and examples.",
    buildHint: "Start with ten real prompts from this week, not a blank taxonomy.",
    tools: ["Notion or Google Docs", "Claude or ChatGPT", "One team owner"],
    prompts: ["Rewrite this workflow prompt so a new teammate can run it safely."],
    failureModes: ["Too many categories", "No named owner", "Prompts without examples"],
  },
  {
    slug: "team-agent-onboarding",
    title: "30-minute team onboarding",
    tier: ["akoranga"],
    functions: ["ops", "hr", "marketing", "finance", "sales", "support", "other"],
    sizes: ["small", "medium", "large"],
    effortHours: 3,
    hoursSavedPerWeek: 2,
    summary: "A short internal session that teaches three repeatable agent workflows.",
    buildHint: "Use the team’s own docs and inbox examples. No abstract training.",
    tools: ["Slides", "One approved agent tool", "Three live examples"],
    prompts: ["Turn this messy request into a reusable team workflow."],
    failureModes: ["Teaching features instead of workflows", "No follow-up owner"],
  },
  {
    slug: "meeting-notes-actions",
    title: "Meeting notes to action list",
    tier: ["kaimahi", "tohunga", "rangatira"],
    functions: ["ops", "sales", "support", "other"],
    sizes: ["small", "medium", "large"],
    effortHours: 6,
    hoursSavedPerWeek: 5,
    summary: "Paste meeting notes and return owners, dates, decisions, and open questions.",
    buildHint: "Make the output format match the system your team already uses.",
    tools: ["Claude", "Asana / Linear / Trello", "Calendar"],
    prompts: ["Extract actions, owners, dates, decisions, and unresolved questions from these notes."],
    failureModes: ["No owner field", "No decision log", "Pushing tasks into a tool nobody checks"],
  },
  {
    slug: "hr-faq-assistant",
    title: "Internal HR FAQ assistant",
    tier: ["kaimahi", "tohunga"],
    functions: ["hr", "ops"],
    sizes: ["medium", "large"],
    effortHours: 10,
    hoursSavedPerWeek: 7,
    summary: "Answer common leave, policy, onboarding, and benefits questions from approved docs.",
    buildHint: "Keep it read-only and cite the source policy in every answer.",
    tools: ["Google Drive or Notion", "Claude Projects", "HR policy folder"],
    prompts: ["Answer only from these HR policies. If the answer is missing, say who to ask."],
    failureModes: ["No source citations", "Drafting policy instead of answering it", "Stale documents"],
  },
  {
    slug: "jd-composer",
    title: "Job description composer",
    tier: ["kaimahi", "tohunga"],
    functions: ["hr"],
    sizes: ["small", "medium", "large"],
    effortHours: 5,
    hoursSavedPerWeek: 4,
    summary: "Turn role notes into an inclusive, structured JD with interview criteria.",
    buildHint: "Lock the company voice and required legal boilerplate before drafting.",
    tools: ["Claude", "Existing JDs", "Hiring scorecard"],
    prompts: ["Draft a job description from these role notes using inclusive NZ English."],
    failureModes: ["Generic benefit copy", "No must-have/nice-to-have split"],
  },
  {
    slug: "campaign-brief-composer",
    title: "Campaign brief composer",
    tier: ["kaimahi", "tohunga"],
    functions: ["marketing", "sales"],
    sizes: ["solo", "small", "medium", "large"],
    effortHours: 6,
    hoursSavedPerWeek: 5,
    summary: "Convert scattered launch notes into a one-page campaign brief.",
    buildHint: "Force one audience, one message, one measure of success.",
    tools: ["Claude", "Campaign examples", "Google Docs"],
    prompts: ["Turn these notes into a campaign brief with audience, insight, message, channels, and proof."],
    failureModes: ["Too many audiences", "No decision owner", "Output too long to use"],
  },
  {
    slug: "customer-response-drafter",
    title: "Customer response drafter",
    tier: ["kaimahi", "tohunga"],
    functions: ["support", "sales", "ops"],
    sizes: ["small", "medium", "large"],
    effortHours: 8,
    hoursSavedPerWeek: 8,
    summary: "Draft support replies from approved templates and the customer’s message.",
    buildHint: "Keep human approval mandatory and log which template was used.",
    tools: ["Helpdesk", "Claude", "Response templates"],
    prompts: ["Draft a calm customer reply using this template and this customer message."],
    failureModes: ["Sending without review", "No escalation rules", "Tone drift"],
  },
  {
    slug: "finance-narrative-pack",
    title: "Finance narrative for the board",
    tier: ["kaimahi", "tohunga"],
    functions: ["finance", "ops"],
    sizes: ["small", "medium", "large"],
    effortHours: 7,
    hoursSavedPerWeek: 4,
    summary: "Turn monthly numbers into a plain-English variance note for leaders.",
    buildHint: "Start from exported P&L rows and require source numbers beside every claim.",
    tools: ["Spreadsheet export", "Claude", "Board template"],
    prompts: ["Explain these variances in NZ English. Cite the row number beside each claim."],
    failureModes: ["Uncited claims", "Explaining noise", "No cash-risk section"],
  },
  {
    slug: "sales-follow-up-engine",
    title: "Sales follow-up engine",
    tier: ["kaimahi", "tohunga"],
    functions: ["sales", "marketing"],
    sizes: ["solo", "small", "medium"],
    effortHours: 5,
    hoursSavedPerWeek: 5,
    summary: "Turn call notes into a follow-up email, CRM summary, and next-step task.",
    buildHint: "Make the CRM fields explicit so the output can be pasted cleanly.",
    tools: ["CRM", "Claude", "Email"],
    prompts: ["Create a follow-up email, CRM note, and next-step task from these call notes."],
    failureModes: ["Too much enthusiasm", "No agreed next step", "CRM fields missing"],
  },
  {
    slug: "internal-tool-with-auth",
    title: "Internal tool with auth + database",
    tier: ["tohunga", "rangatira", "pou"],
    functions: ["ops", "hr", "finance", "sales", "support", "other"],
    sizes: ["small", "medium", "large"],
    effortHours: 14,
    hoursSavedPerWeek: 10,
    summary: "Build a simple internal app for one approval, request, or review workflow.",
    buildHint: "Pick one table, one form, one reviewer, and one export.",
    tools: ["Next.js or Lovable", "Supabase", "Vercel"],
    prompts: ["Build an internal tool with a form, reviewer queue, status, and CSV export."],
    failureModes: ["Too many workflows", "No permissions model", "No audit trail"],
  },
  {
    slug: "onboarding-automation",
    title: "Customer onboarding automation",
    tier: ["tohunga", "rangatira", "pou"],
    functions: ["sales", "support", "ops"],
    sizes: ["medium", "large"],
    effortHours: 16,
    hoursSavedPerWeek: 12,
    summary: "Collect onboarding inputs, draft setup tasks, and produce a kickoff note you can send the customer.",
    buildHint: "Use human review before anything reaches the customer.",
    tools: ["Form", "CRM", "Task manager", "Claude"],
    prompts: ["Turn these onboarding answers into setup tasks, risks, and a kickoff email."],
    failureModes: ["Skipping review", "No exception queue", "Unclear handoff owner"],
  },
  {
    slug: "mcp-data-server",
    title: "Internal data connector",
    tier: ["rangatira", "pou"],
    functions: ["ops", "finance", "support", "other"],
    sizes: ["medium", "large"],
    effortHours: 24,
    hoursSavedPerWeek: 15,
    summary: "Expose approved internal data to agents through a narrow, logged connector.",
    buildHint: "Start read-only, with three approved queries and a clear owner.",
    tools: ["MCP server", "Database", "Audit log"],
    prompts: ["Design a read-only connector with allowed queries, auth, and logs."],
    failureModes: ["Too much data access", "No logging", "No revocation path"],
  },
  {
    slug: "evaluation-harness",
    title: "Custom evaluation suite",
    tier: ["rangatira", "pou"],
    functions: ["ops", "support", "finance", "other"],
    sizes: ["medium", "large"],
    effortHours: 18,
    hoursSavedPerWeek: 9,
    summary: "Test agent outputs against known examples before rollout.",
    buildHint: "Use twenty real examples and score for accuracy, tone, and escalation.",
    tools: ["Dataset", "Vitest or spreadsheet", "Review rubric"],
    prompts: ["Score this output against the rubric and explain any failure."],
    failureModes: ["Synthetic examples", "No fail threshold", "No regression checks"],
  },
  {
    slug: "multi-agent-qa",
    title: "Multi-step QA reviewer",
    tier: ["rangatira", "pou"],
    functions: ["support", "ops", "finance", "other"],
    sizes: ["medium", "large"],
    effortHours: 22,
    hoursSavedPerWeek: 13,
    summary: "Review draft work through specialist checks before a human signs off.",
    buildHint: "Separate factual, policy, tone, and risk checks instead of one mega-prompt.",
    tools: ["Agent runner", "Rubrics", "Evidence log"],
    prompts: ["Run factual, policy, tone, and risk checks. Return pass/fail with citations."],
    failureModes: ["No final human owner", "Checks overlap", "No evidence trail"],
  },
];

const FUNCTION_WEIGHT: Record<HapaiFunction, Partial<Record<string, number>>> = {
  ops: { "meeting-notes-actions": 5, "internal-tool-with-auth": 4, "onboarding-automation": 2 },
  hr: { "hr-faq-assistant": 6, "jd-composer": 5, "team-agent-onboarding": 2 },
  marketing: { "campaign-brief-composer": 6, "sales-follow-up-engine": 2, "shared-prompt-library": 2 },
  finance: { "finance-narrative-pack": 6, "evaluation-harness": 2, "mcp-data-server": 2 },
  sales: { "sales-follow-up-engine": 6, "customer-response-drafter": 3, "onboarding-automation": 3 },
  support: { "customer-response-drafter": 6, "hr-faq-assistant": 2, "multi-agent-qa": 3 },
  other: { "shared-prompt-library": 3, "meeting-notes-actions": 3, "internal-tool-with-auth": 2 },
};

export function recommendProjects({
  tier,
  teamSize,
  primaryFunction,
}: {
  tier: HapaiTier;
  teamSize: HapaiTeamSize;
  primaryFunction: HapaiFunction;
}): ProjectCandidate[] {
  const weighted = PROJECT_CANDIDATES.map((candidate) => {
    let score = 0;
    if (candidate.tier.includes(tier)) score += 8;
    if (candidate.functions.includes(primaryFunction)) score += 6;
    if (candidate.sizes.includes(teamSize)) score += 3;
    score += FUNCTION_WEIGHT[primaryFunction][candidate.slug] ?? 0;
    score += candidate.hoursSavedPerWeek / Math.max(candidate.effortHours, 1);
    return { candidate, score };
  });

  return weighted
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

export function findProject(slug: string): ProjectCandidate | undefined {
  return PROJECT_CANDIDATES.find((candidate) => candidate.slug === slug);
}

export function annualRoiNzd(candidate: ProjectCandidate): number {
  return Math.round(candidate.hoursSavedPerWeek * 52 * NZ_BLENDED_HOURLY_RATE);
}
