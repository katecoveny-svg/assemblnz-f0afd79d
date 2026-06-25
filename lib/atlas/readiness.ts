/**
 * Atlas readiness diagnostic — the structured 10-question on-ramp.
 *
 * A non-technical New Zealander answers ten plain multiple-choice questions
 * (one per screen) and Atlas scores them into a readiness band, recommends
 * agents from the shelf, and flags the NZ Acts they need to keep in mind. It is
 * the accessible front door to the same 5-level Atlas coaching flow — the quiz
 * is the on-ramp, the conversation is the deep dive.
 *
 * This module is pure + isomorphic: the question set, the scoring, the Act
 * mapping and the share codec all live here with no DOM or network, so the same
 * logic powers the client UI, the PDF export and any future server use. It never
 * touches a system prompt; recommendations come from {@link recommendAgents}.
 */
import { recommendAgents, type AgentMatch } from './recommend';

// ── The question set ────────────────────────────────────────────────────────
// Ten questions, NZ-rooted, foxbyte's filler dropped and the rest sharpened.
// Q5 (time loss) and Q9 (compliance) carry six options; the rest carry five.

export type QuestionId =
  | 'role'
  | 'team-size'
  | 'data'
  | 'workflow'
  | 'time-loss'
  | 'ai-confidence'
  | 'risk'
  | 'privacy'
  | 'compliance'
  | 'success';

export type ReadinessOption = {
  /** stable id stored in answers + the share link. */
  value: string;
  /** the card label. */
  label: string;
  /** a small sub-line under the label (optional). */
  hint?: string;
};

export type ReadinessQuestion = {
  id: QuestionId;
  /** Space Mono eyebrow above the question. */
  eyebrow: string;
  /** the Cormorant question itself. */
  prompt: string;
  options: ReadinessOption[];
};

export const QUESTIONS: ReadinessQuestion[] = [
  {
    id: 'role',
    eyebrow: 'About you',
    prompt: 'What’s your role?',
    options: [
      { value: 'owner', label: 'Owner or founder' },
      { value: 'manager', label: 'Manager' },
      { value: 'team-lead', label: 'Team lead' },
      { value: 'ic', label: 'Individual contributor' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'team-size',
    eyebrow: 'Your team',
    prompt: 'How many people are on your team?',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: '2-5', label: '2–5' },
      { value: '6-20', label: '6–20' },
      { value: '21-100', label: '21–100' },
      { value: '100+', label: '100+' },
    ],
  },
  {
    id: 'data',
    eyebrow: 'Your information',
    prompt: 'How would you describe your data setup?',
    options: [
      { value: 'head', label: 'Mostly in my head' },
      { value: 'docs', label: 'In spreadsheets and docs' },
      { value: 'system', label: 'In a CRM or system' },
      { value: 'scattered', label: 'Across many disconnected tools' },
      { value: 'untracked', label: 'I don’t really track it' },
    ],
  },
  {
    id: 'workflow',
    eyebrow: 'How work flows',
    prompt: 'What best describes your workflow?',
    options: [
      { value: 'manual', label: 'Mostly manual and repetitive' },
      { value: 'templated', label: 'Some templates and automation' },
      { value: 'built-in', label: 'Built into our systems' },
      { value: 'varies', label: 'Different every time' },
    ],
  },
  {
    id: 'time-loss',
    eyebrow: 'Where the time goes',
    prompt: 'Where does most of your time go that AI could help with?',
    options: [
      { value: 'admin', label: 'Admin and reporting' },
      { value: 'comms', label: 'Customer comms' },
      { value: 'writing', label: 'Writing and drafting' },
      { value: 'research', label: 'Research and analysis' },
      { value: 'coordination', label: 'Coordination and meetings' },
      { value: 'not-sure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'ai-confidence',
    eyebrow: 'Where you’re at',
    prompt: 'How confident are you with AI today?',
    options: [
      { value: 'never', label: 'Never used it' },
      { value: 'tried', label: 'Tried ChatGPT a few times' },
      { value: 'weekly', label: 'Use it weekly' },
      { value: 'daily', label: 'Use it daily' },
      { value: 'building', label: 'Building things with it' },
    ],
  },
  {
    id: 'risk',
    eyebrow: 'How far you’d go',
    prompt: 'How comfortable are you trusting AI with real work?',
    options: [
      { value: 'check-all', label: 'I need to check everything' },
      { value: 'review', label: 'Comfortable with a review step' },
      { value: 'guardrails', label: 'Happy to automate with guardrails' },
      { value: 'autonomy', label: 'Want full autonomy where it’s safe' },
    ],
  },
  {
    id: 'privacy',
    eyebrow: 'Your data, honestly',
    prompt: 'How sensitive is the data you handle?',
    options: [
      { value: 'personal-health', label: 'Personal info or health', hint: 'Privacy Act 2020 · IPP 3A' },
      { value: 'financial', label: 'Financial or commercial' },
      { value: 'internal', label: 'Internal only' },
      { value: 'public', label: 'All public' },
      { value: 'not-sure', label: 'Not sure' },
    ],
  },
  {
    id: 'compliance',
    eyebrow: 'Your sector',
    prompt: 'Are you in a regulated space?',
    options: [
      { value: 'construction', label: 'Construction', hint: 'HSWA' },
      { value: 'health', label: 'Health', hint: 'HDC' },
      { value: 'finance', label: 'Finance', hint: 'AML/CFT' },
      { value: 'education', label: 'Education', hint: 'NZQA' },
      { value: 'hospitality', label: 'Hospitality', hint: 'Food Act' },
      { value: 'none', label: 'None of the above' },
    ],
  },
  {
    id: 'success',
    eyebrow: 'What good looks like',
    prompt: 'What would make this worth your time?',
    options: [
      { value: 'hours', label: 'Save hours each week' },
      { value: 'mistakes', label: 'Reduce mistakes' },
      { value: 'opportunities', label: 'Spot opportunities sooner' },
      { value: 'harder-work', label: 'Free me up for harder work' },
      { value: 'independent', label: 'Make my team more independent' },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export type ReadinessAnswers = Partial<Record<QuestionId, string>>;

// ── Readiness band ──────────────────────────────────────────────────────────

export type BandKey = 'beginner' | 'familiar' | 'fluent' | 'builder';

export type ReadinessBand = {
  key: BandKey;
  label: string;
  /** one honest line on what this band means + the next move. */
  blurb: string;
};

const BANDS: Record<BandKey, ReadinessBand> = {
  beginner: {
    key: 'beginner',
    label: 'Beginner',
    blurb:
      'New to AI — and that’s a fine place to start. Pick one small, low-risk task and let an agent do the heavy lifting while you watch how it works.',
  },
  familiar: {
    key: 'familiar',
    label: 'Familiar',
    blurb:
      'You’ve dipped a toe in. You’re ready to make AI a weekly habit on the tasks that quietly drain your time.',
  },
  fluent: {
    key: 'fluent',
    label: 'Fluent',
    blurb:
      'You use AI regularly and you know where it lets you down. You’re ready to automate the repetitive parts — with a person still in the loop.',
  },
  builder: {
    key: 'builder',
    label: 'Builder',
    blurb:
      'You’re already building. Pilot can help you turn your best workflow into an agent your whole team can lean on.',
  },
};

/** Confidence (Q6) → score, weighted x2. */
const CONFIDENCE_SCORE: Record<string, number> = {
  never: 0,
  tried: 1,
  weekly: 2,
  daily: 3,
  building: 4,
};

/** Risk appetite (Q7) → score. */
const RISK_SCORE: Record<string, number> = {
  'check-all': 0,
  review: 1,
  guardrails: 2,
  autonomy: 3,
};

/**
 * Band from confidence + AI use + risk appetite (the brief's mapping).
 * confidence carries the weight (×2); risk nudges within a band.
 *   Builder ≥ 8 · Fluent ≥ 5 · Familiar ≥ 2 · else Beginner.
 */
export function bandForAnswers(answers: ReadinessAnswers): ReadinessBand {
  const conf = CONFIDENCE_SCORE[answers['ai-confidence'] ?? ''] ?? 0;
  const risk = RISK_SCORE[answers.risk ?? ''] ?? 0;
  const score = conf * 2 + risk;
  if (score >= 8) return BANDS.builder;
  if (score >= 5) return BANDS.fluent;
  if (score >= 2) return BANDS.familiar;
  return BANDS.beginner;
}

// ── Recommendation mapping ──────────────────────────────────────────────────
// Map the answers to a free-text need string, then reuse the shelf scorer.

const ROLE_KEYWORDS: Record<string, string> = {
  owner: 'owner business admin reporting',
  manager: 'manager team reporting roster',
  'team-lead': 'team roster coordination',
  ic: 'drafting admin tasks',
  other: '',
};

/** Time loss (Q5) → the dominant recommendation signal. */
const TIME_LOSS_KEYWORDS: Record<string, string> = {
  admin: 'admin reporting invoices expenses tax gst',
  comms: 'email inbox customer reception phone calls',
  writing: 'writing drafting content social copy',
  research: 'research analysis power bill plan',
  coordination: 'meeting notes hui minutes roster coordination',
  'not-sure': '',
};

/** Human label for time loss, used in the "why this fits" line. */
export const TIME_LOSS_LABEL: Record<string, string> = {
  admin: 'admin and reporting',
  comms: 'customer comms',
  writing: 'writing and drafting',
  research: 'research and analysis',
  coordination: 'coordination and meetings',
  'not-sure': 'your repetitive work',
};

const SECTOR_KEYWORDS: Record<string, string> = {
  construction: 'compliance safety building consent',
  health: 'clinical care patient scribe',
  finance: 'invoice reconcile tax gst',
  education: 'school notice newsletter panui',
  hospitality: 'roster food temp stock',
  none: '',
};

/** Build the plain-words need string Atlas matches the shelf against. */
export function recommendationQuery(answers: ReadinessAnswers): string {
  const parts = [
    ROLE_KEYWORDS[answers.role ?? ''] ?? '',
    TIME_LOSS_KEYWORDS[answers['time-loss'] ?? ''] ?? '',
    SECTOR_KEYWORDS[answers.compliance ?? ''] ?? '',
  ];
  // Dedupe tokens so the scorer sees each signal once.
  const seen = new Set<string>();
  for (const tok of parts.join(' ').split(/\s+/)) {
    if (tok) seen.add(tok);
  }
  return [...seen].join(' ');
}

/** Up to three shelf agents ranked by fit. Falls back to a broad query. */
export function recommendForAnswers(answers: ReadinessAnswers, limit = 3): AgentMatch[] {
  const query = recommendationQuery(answers);
  const matches = recommendAgents(query, limit);
  if (matches.length > 0) return matches;
  // Nothing matched (e.g. "not sure" everywhere) — give a sensible default set.
  return recommendAgents('admin email reporting meeting notes', limit);
}

/** An honest one-liner tying a recommended agent to the user's answers. */
export function whyFits(match: AgentMatch, answers: ReadinessAnswers): string {
  const tl = TIME_LOSS_LABEL[answers['time-loss'] ?? ''] ?? 'your repetitive work';
  const desc = match.description.replace(/\.+\s*$/, '');
  const lower = desc.charAt(0).toLowerCase() + desc.slice(1);
  return `You lose time to ${tl} — ${lower}.`;
}

// ── Privacy + compliance flags (NZ Acts) ────────────────────────────────────

export type ComplianceNote = {
  /** the Act or code, named. */
  act: string;
  /** why it applies to them, in plain words. */
  why: string;
};

/** Privacy Acts surfaced by the data-sensitivity answer (Q8). */
export function privacyNotes(answers: ReadinessAnswers): ComplianceNote[] {
  const v = answers.privacy;
  if (v === 'personal-health') {
    return [
      {
        act: 'Privacy Act 2020',
        why: 'You handle personal information. The 13 Information Privacy Principles apply — collect only what you need, keep it safe in NZ or Australia, and let people see what you hold about them.',
      },
      {
        act: 'IPP 3A — automated decisions (from 1 May 2026)',
        why: 'When an automated system makes or materially affects a decision about a person, you must tell them. Build that disclosure in from day one — don’t bolt it on later.',
      },
      {
        act: 'Health Information Privacy Code 2020',
        why: 'Health information carries extra rules on top of the Privacy Act. Treat patient data as the most sensitive category you hold, and keep a human accountable for every call.',
      },
    ];
  }
  if (v === 'financial') {
    return [
      {
        act: 'Privacy Act 2020',
        why: 'Financial and commercial data is sensitive. Keep it in NZ-or-Australia residency where you can, limit who and what can see it, and log who accessed what.',
      },
    ];
  }
  if (v === 'not-sure') {
    return [
      {
        act: 'Privacy Act 2020',
        why: 'Not sure how sensitive your data is? Start by assuming the Privacy Act 2020 applies — most NZ work touches some personal information, even just names and emails.',
      },
    ];
  }
  return [];
}

/** Sector-specific obligations surfaced by the regulated-space answer (Q9). */
export function sectorNotes(answers: ReadinessAnswers): ComplianceNote[] {
  switch (answers.compliance) {
    case 'construction':
      return [
        {
          act: 'Health and Safety at Work Act 2015 (HSWA)',
          why: 'You carry a duty to keep people safe. AI can draft risk registers, SWMS and toolbox talks — but a competent person signs them, and notifiable events still go to WorkSafe.',
        },
      ];
    case 'health':
      return [
        {
          act: 'HDC Code of Health and Disability Services Consumers’ Rights',
          why: 'Consumers have rights to quality care and informed choice. AI may scribe or summarise, but the clinician stays accountable for every clinical decision and record.',
        },
      ];
    case 'finance':
      return [
        {
          act: 'AML/CFT Act 2009',
          why: 'You have customer due-diligence and reporting duties. AI can speed the paperwork, but suspicious-activity judgement and record-keeping must stay auditable and human-owned.',
        },
      ];
    case 'education':
      return [
        {
          act: 'Education and Training Act 2020 · NZQA rules',
          why: 'Learner data and assessment integrity are protected. AI can help with admin and drafting, but keep assessment decisions and student records under human oversight.',
        },
      ];
    case 'hospitality':
      return [
        {
          act: 'Food Act 2014',
          why: 'Your Food Control Plan and verification records must hold up. AI can log temperatures and tidy records, but the records have to be accurate and traceable to a real check.',
        },
      ];
    default:
      return [];
  }
}

/** True if anything in the answers needs a compliance call-out on the report. */
export function hasComplianceFlags(answers: ReadinessAnswers): boolean {
  return privacyNotes(answers).length > 0 || sectorNotes(answers).length > 0;
}

// ── Plain-words summary (PDF + Atlas handoff) ───────────────────────────────

function labelFor(id: QuestionId, value: string | undefined): string {
  const q = QUESTIONS.find((qq) => qq.id === id);
  return q?.options.find((o) => o.value === value)?.label ?? '';
}

/** A short readable summary of the person's situation, for the PDF + handoff. */
export function summaryFor(answers: ReadinessAnswers): string {
  const role = labelFor('role', answers.role).toLowerCase();
  const team = labelFor('team-size', answers['team-size']);
  const timeLoss = (TIME_LOSS_LABEL[answers['time-loss'] ?? ''] ?? 'repetitive work').toLowerCase();
  const success = labelFor('success', answers.success).toLowerCase();
  const teamPhrase =
    answers['team-size'] === 'solo' ? 'working solo' : team ? `on a team of ${team}` : '';
  const article = /^[aeiou]/i.test(role) ? 'an' : 'a';
  const pieces = [
    role ? `You’re ${role === 'something else' ? 'in a mixed role' : `${article} ${role}`}` : 'You',
    teamPhrase,
  ].filter(Boolean);
  const lead = pieces.join(' ').replace(/\s+/g, ' ').trim();
  const goal = success ? ` What would make AI worth it: ${success}.` : '';
  return `${lead}. Most of your time goes to ${timeLoss}.${goal}`.replace(/\s+/g, ' ').trim();
}

// ── Share codec ─────────────────────────────────────────────────────────────
// Compact, URL-safe encoding of the answers so a report is shareable as a link
// with no backend: ?r=<base64url(JSON)>. Round-trips on the client (btoa/atob).

export function encodeAnswers(answers: ReadinessAnswers): string {
  try {
    const json = JSON.stringify(answers);
    const b64 =
      typeof btoa === 'function'
        ? btoa(json)
        : (globalThis as { Buffer?: { from(s: string): { toString(e: string): string } } }).Buffer!.from(json).toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeAnswers(code: string | null | undefined): ReadinessAnswers | null {
  if (!code) return null;
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function'
        ? atob(b64)
        : (globalThis as { Buffer?: { from(s: string, e: string): { toString(e: string): string } } }).Buffer!.from(b64, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as ReadinessAnswers;
    if (!parsed || typeof parsed !== 'object') return null;
    // Keep only known question ids with string values.
    const clean: ReadinessAnswers = {};
    for (const q of QUESTIONS) {
      const val = parsed[q.id];
      if (typeof val === 'string' && q.options.some((o) => o.value === val)) clean[q.id] = val;
    }
    return Object.keys(clean).length ? clean : null;
  } catch {
    return null;
  }
}

/** True when every question has an answer (the report can be trusted). */
export function isComplete(answers: ReadinessAnswers): boolean {
  return QUESTIONS.every((q) => typeof answers[q.id] === 'string');
}

/** A Pilot brief, pre-filled for Builders who want to build their first agent. */
export function pilotBrief(answers: ReadinessAnswers): string {
  const role = labelFor('role', answers.role) || 'a team member';
  const timeLoss = TIME_LOSS_LABEL[answers['time-loss'] ?? ''] ?? 'repetitive work';
  const success = labelFor('success', answers.success).toLowerCase() || 'save time each week';
  return `I’m ${role.toLowerCase()} and most of my time goes to ${timeLoss}. I’d like to build an agent that helps with that, so I can ${success}.`;
}
