// Agent-specific starter prompts shown on the chat welcome screen.
// Each entry maps a kete/agent id to 3-4 short, click-to-send openers.

export const KETE_STARTER_PROMPTS: Record<string, string[]> = {
  toroa: [
    "What's on for the family this week?",
    "Draft a permission slip reply for Mia's camp",
    "Plan dinners for the next 5 nights",
    "Remind me what's due at school by Friday",
  ],
  auaha: [
    "Draft a launch post for Instagram and LinkedIn",
    "Suggest 5 content ideas for next week",
    "Critique my brand voice in 3 bullets",
    "Build a 4-week content calendar",
  ],
  pakihi: [
    "Summarise this month's cash position",
    "What invoices are overdue and what should I chase first?",
    "Draft a friendly payment reminder email",
    "Forecast next quarter's revenue",
  ],
  hangarau: [
    "Audit my stack for compliance gaps",
    "Recommend 3 automations I could add this week",
    "Explain our last incident in plain English",
    "Draft an internal AI use policy",
  ],
  hanga: [
    "What's the status of my active builds?",
    "Check subbie compliance for this week",
    "Draft a variation request to the client",
    "Summarise H&S incidents this month",
  ],
  "te-kahui-reo": [
    "Show this week's te reo usage across the team",
    "Suggest a karakia for our Monday hui",
    "Translate this update into te reo Māori",
    "What tikanga should I consider for a new client meeting?",
  ],
};

export const DEFAULT_STARTER_PROMPTS = [
  "What can you help me with?",
  "Show me what's important today",
  "Draft something for me",
  "Summarise recent activity",
];

export function getStarterPrompts(keteId: string, agentId?: string): string[] {
  const key = (agentId && KETE_STARTER_PROMPTS[agentId]) ? agentId : keteId;
  return KETE_STARTER_PROMPTS[key] ?? DEFAULT_STARTER_PROMPTS;
}
