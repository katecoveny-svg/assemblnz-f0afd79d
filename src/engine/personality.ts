// ═══════════════════════════════════════════════
// ASSEMBL HUMANIST ENGINE — Personality & Mood
// ═══════════════════════════════════════════════

export interface UserContext {
  firstName: string;
  businessName?: string;
  industry?: string;
  employeeCount?: number;
  timezone: string;
  signupDate: string;
  messagesThisMonth: number;
  lastActiveDate: string;
  milestones: string[];
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'direct';
    detailLevel: 'summary' | 'detailed' | 'expert';
  };
  currentMood?: 'stressed' | 'neutral' | 'positive';
  significantDates: { label: string; date: string }[];
}

// ── Time-aware greetings ──

export function getTimeGreeting(timezone: string = 'Pacific/Auckland'): string {
  try {
    const hour = parseInt(
      new Date().toLocaleString('en-NZ', { timeZone: timezone, hour: 'numeric', hour12: false })
    );
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  } catch {
    return 'morning';
  }
}

export function getGreetingText(name?: string, timezone?: string): string {
  const period = getTimeGreeting(timezone || 'Pacific/Auckland');
  const displayName = name || '';
  const now = new Date();
  const nzDay = parseInt(
    now.toLocaleString('en-NZ', { timeZone: timezone || 'Pacific/Auckland', weekday: 'narrow' })
  );

  // Check day of week in NZ time
  const dayOfWeek = now.toLocaleString('en-NZ', { timeZone: timezone || 'Pacific/Auckland', weekday: 'long' });

  if (dayOfWeek === 'Friday' && (period === 'afternoon' || period === 'evening')) {
    return displayName ? `Nearly there, ${displayName}. What do you need before the weekend?` : 'Nearly there. What do you need before the weekend?';
  }
  if (dayOfWeek === 'Monday' && period === 'morning') {
    return displayName ? `Fresh week, ${displayName}. What's first?` : "Fresh week. What's first?";
  }

  switch (period) {
    case 'morning':
      return displayName ? `Mōrena, ${displayName}` : 'Mōrena';
    case 'afternoon':
      return displayName ? `Good afternoon, ${displayName}` : 'Good afternoon';
    case 'evening':
      return displayName ? `Still at it, ${displayName}?` : 'Good evening';
    case 'night':
      return displayName ? `Burning the midnight oil, ${displayName}?` : 'Good evening';
    default:
      return displayName ? `Kia ora, ${displayName}` : 'Kia ora';
  }
}

// ── Seasonal context (NZ reversed seasons) ──

export function getSeasonalContext(): 'summer' | 'autumn' | 'winter' | 'spring' {
  const month = new Date().getMonth();
  if (month >= 11 || month <= 1) return 'summer';
  if (month >= 2 && month <= 4) return 'autumn';
  if (month >= 5 && month <= 7) return 'winter';
  return 'spring';
}

// ── Mood Detection ──

export function detectMood(
  message: string,
  timeOfDay: string,
  recentMessages: string[] = []
): 'stressed' | 'neutral' | 'positive' {
  const stressIndicators = [
    message.length < 20 && !message.includes('?'),
    /urgent|asap|help|stuck|broken|wrong|mess|disaster|stressed|overwhelm/i.test(message),
    timeOfDay === 'night',
    recentMessages.length > 5 && recentMessages.every(m => m.length < 30),
  ];

  const positiveIndicators = [
    /thanks|great|awesome|perfect|love|brilliant|amazing|sorted|cheers/i.test(message),
    /!/.test(message) && !/help|urgent|wrong/i.test(message),
    /😊|🎉|👍|💪|🙌/.test(message),
  ];

  const stressScore = stressIndicators.filter(Boolean).length;
  const positiveScore = positiveIndicators.filter(Boolean).length;

  if (stressScore >= 2) return 'stressed';
  if (positiveScore >= 2) return 'positive';
  return 'neutral';
}

// ── Agent loading messages ──

export const AGENT_LOADING_MESSAGES: Record<string, string> = {
  ledger: 'Crunching the numbers…',
  aroha: 'Checking the legislation…',
  apex: 'Drawing up the plans…',
  prism: 'Getting creative…',
  anchor: 'Reviewing the fine print…',
  haven: 'Inspecting the details…',
  forge: 'Under the hood…',
  echo: 'Channelling your voice…',
  spark: 'Building something…',
  flux: 'Tracking the pipeline…',
  nova: 'Mapping the journey…',
  nexus: 'Checking the tariffs…',
  helm: 'Organising the chaos…',
  aura: 'Curating the experience…',
  terra: 'Checking the forecast…',
  kindle: 'Fuelling the mission…',
  vault: 'Securing the numbers…',
  shield: 'Assessing the risk…',
  signal: 'Scanning the systems…',
  axis: 'Planning the next move…',
  compass: 'Navigating the pathway…',
  vitae: 'Checking in on you…',
  titan: 'Powering up…',
  verde: 'Thinking green…',
  pulse: 'Checking the vitals…',
  zenith: 'Reaching higher…',
  weave: 'Stitching it together…',
  atlas: 'Plotting the course…',
  sage: 'Drawing from experience…',
  mana: 'Honouring the kaupapa…',
  civic: 'Serving the community…',
  awa: 'Flowing with purpose…',
  ora: 'Nurturing wellbeing…',
  whetu: 'Guiding the way…',
  koru: 'Finding balance…',
  rua: 'Growing stronger…',
  ahi: 'Lighting the way…',
  mahi: 'Getting it done…',
};

// ── Milestones ──

export interface Milestone {
  id: string;
  label: string;
  threshold: number;
  message: string;
  metric: string; // which counter to check
}

export const MILESTONES: Milestone[] = [
  { id: 'first_document', label: 'First document generated', threshold: 1, metric: 'documents', message: "Your first document — this is where it starts." },
  { id: 'ten_documents', label: '10 documents generated', threshold: 10, metric: 'documents', message: "That's 10 documents generated. You've saved roughly 5 hours of manual work." },
  { id: 'fifty_documents', label: '50 documents generated', threshold: 50, metric: 'documents', message: "50 documents. At this point, Assembl has paid for itself many times over." },
  { id: 'first_workflow', label: 'First symbiotic workflow', threshold: 1, metric: 'workflows', message: "You just triggered your first symbiotic workflow — multiple agents working together." },
  { id: 'seven_day_streak', label: '7-day usage streak', threshold: 7, metric: 'streak', message: "A full week of daily use. Your agents know your business well now." },
  { id: 'first_app', label: 'First SPARK app deployed', threshold: 1, metric: 'apps', message: "Your first live app. You just shipped something that would have cost $3-5K to build." },
];

// ── Seasonal agent prompts ──

export function getSeasonalAgentHint(agentId: string): string | null {
  const season = getSeasonalContext();
  const month = new Date().getMonth();

  const hints: Record<string, Record<string, string>> = {
    terra: {
      spring: 'Calving season coming up — have you reviewed your animal welfare plan?',
      summer: 'Dry conditions expected — irrigation planning is key right now.',
    },
    aura: {
      summer: 'Summer peak approaching — staffing sorted for the holidays?',
      winter: 'Quieter season — perfect time to refresh your guest experience strategy.',
    },
    ledger: {
      autumn: month === 2 ? 'End of financial year in 4 weeks. Good time to review your position.' : '',
    },
    haven: {
      winter: 'Heating compliance matters more in winter — tenants notice.',
      autumn: 'Pre-winter maintenance checks are due. Gutters, heating, insulation.',
    },
  };

  return hints[agentId]?.[season] || null;
}
