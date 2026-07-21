/**
 * The shape of an agent built via /build-an-agent.
 *
 * The 6 parts on the 3D scene each hold sub-state here. The system prompt for
 * the real Claude call is composed from this record — so what the visitor
 * drags together on the canvas literally shapes what the model does.
 */

export type ModelTier = 'cheap' | 'mid' | 'premium';
export type MemoryScope = 'none' | 'session' | 'persistent';

export interface BuildConfig {
  /** Visitor-supplied name for the agent, optional. */
  name: string;
  /** Business context passed through from the intake section, optional. */
  business: string;
  modelTier: ModelTier;
  memoryScope: MemoryScope;
  tools: string[];
  knowledge: string[];
  /** Visitor-typed persona brief. */
  voice: string;
  guardrails: string[];
}

export const DEFAULT_CONFIG: BuildConfig = {
  name: '',
  business: '',
  modelTier: 'mid',
  memoryScope: 'session',
  tools: ['web-search', 'calendar'],
  knowledge: ['ird', 'worksafe'],
  voice: '',
  guardrails: ['cite-sources', 'no-personal-data'],
};

// ── Option catalogues (labels shown in the chip pickers) ────────────────────

export const MODEL_TIERS: Array<{ id: ModelTier; label: string; helper: string }> = [
  { id: 'cheap',   label: 'Fast',   helper: 'quick answers, lighter model'   },
  { id: 'mid',     label: 'Balanced', helper: 'good writing, still fast'     },
  { id: 'premium', label: 'Deep',   helper: 'the biggest model for tricky work' },
];

export const MEMORY_SCOPES: Array<{ id: MemoryScope; label: string; helper: string }> = [
  { id: 'none',       label: 'None',       helper: 'forgets after every question' },
  { id: 'session',    label: 'Session',    helper: 'remembers this conversation'  },
  { id: 'persistent', label: 'Persistent', helper: 'remembers between visits'     },
];

export const TOOL_OPTIONS: Array<{ id: string; label: string; helper: string }> = [
  { id: 'web-search',  label: 'Web search',  helper: 'look things up on the open web' },
  { id: 'calendar',    label: 'Calendar',    helper: 'read and draft events' },
  { id: 'email',       label: 'Email',       helper: 'draft replies for you to approve' },
  { id: 'spreadsheet', label: 'Spreadsheet', helper: 'read and summarise sheets' },
  { id: 'calculator',  label: 'Calculator',  helper: 'do the numbers reliably' },
  { id: 'image-reader',label: 'Image reader',helper: 'read a photo — an invoice, a form' },
];

export const KNOWLEDGE_OPTIONS: Array<{ id: string; label: string; helper: string }> = [
  { id: 'ird',              label: 'IRD updates',       helper: 'tax notices, GST changes' },
  { id: 'mbie',             label: 'MBIE',              helper: 'business.govt + employment' },
  { id: 'worksafe',         label: 'WorkSafe',          helper: 'health & safety, notifiable events' },
  { id: 'nz-gazette',       label: 'NZ Gazette',        helper: 'official notices, tenders' },
  { id: 'rbp',              label: 'RBP grants',        helper: 'Regional Business Partner funding' },
  { id: 'companies-office', label: 'Companies Office',  helper: 'director changes, filings' },
  { id: 'my-docs',          label: 'My own documents',  helper: 'anything you upload later' },
];

export const GUARDRAIL_OPTIONS: Array<{ id: string; label: string; helper: string }> = [
  { id: 'safe-for-work',    label: 'Safe-for-work',        helper: 'keep it professional'    },
  { id: 'no-financial',     label: 'No financial advice',  helper: 'point at an adviser'     },
  { id: 'cite-sources',     label: 'Cite sources',         helper: 'name where a fact came from' },
  { id: 'no-personal-data', label: 'No personal data',     helper: 'never repeat identifiers' },
  { id: 'nz-english',       label: 'NZ English',           helper: 'colour, organise, whānau' },
];

// ── Serialise / label helpers ───────────────────────────────────────────────

function labelsFor<T extends { id: string; label: string }>(catalog: T[], picked: string[]): string[] {
  const map = new Map(catalog.map((o) => [o.id, o.label]));
  return picked.map((id) => map.get(id) ?? id);
}

/**
 * Compose the system prompt for the Claude call from the parts on the canvas.
 * Every part contributes a plain-English rule or context line.
 */
export function buildSystemPrompt(config: BuildConfig): string {
  const name = config.name.trim() || 'your assembl agent';
  const tools = labelsFor(TOOL_OPTIONS, config.tools);
  const knowledge = labelsFor(KNOWLEDGE_OPTIONS, config.knowledge);
  const guardrails = labelsFor(GUARDRAIL_OPTIONS, config.guardrails);
  const memoryLine =
    config.memoryScope === 'none'
      ? 'You forget between messages — every question is stand-alone.'
      : config.memoryScope === 'session'
      ? 'You remember earlier messages in this conversation.'
      : 'You remember what you learn about this business between visits.';

  const voiceBrief = config.voice.trim();
  const businessContext = config.business.trim();

  const parts: string[] = [];
  parts.push(
    `You are ${name}, an AI agent a NZ business owner just assembled by hand on the assembl website.`,
  );
  parts.push(
    `You have been shaped by the parts they placed on the canvas — every rule below is one of those parts. Read your answer in that light: warm, first-person, plain.`,
  );

  if (businessContext) {
    parts.push(`## The business you are working for\n${businessContext}`);
  }

  parts.push(`## Parts they placed\n\n- **Memory** — ${memoryLine}
- **Tools available** — ${tools.length ? tools.join(', ') : '(none — you have to reason from the question alone)'}
- **Knowledge sources** — ${knowledge.length ? knowledge.join(', ') : '(none configured — flag if you would need one)'}
- **Guardrails** — ${guardrails.length ? guardrails.join('; ') : '(none — but still act like a decent colleague)'}`);

  if (voiceBrief) {
    parts.push(`## How you speak (visitor's own words)\n"${voiceBrief}"`);
  }

  parts.push(`## Voice rules

- Warm, direct, first person. NZ English.
- NEVER open with "As an AI…" or a numbered list.
- No hype words: "seamless", "effortless", "unlock", "empower", "supercharge", "revolutionise", "cutting-edge".
- Answer in 2-4 short paragraphs of prose. Concrete. No filler.
- If a guardrail applies, honour it plainly in the answer (e.g. cite the source, decline the financial specifics).
- This is a preview inside a viral demo on assembl.co.nz — a real assembl workspace runs on your business's Genome (services, pricing, FAQs, policies). Here you are answering from the visitor's paragraph plus general common sense.`);

  return parts.join('\n\n');
}

/**
 * A short label of what got placed — useful for lead emails and share cards.
 */
export function configSummary(config: BuildConfig): string {
  const tiers = MODEL_TIERS.find((t) => t.id === config.modelTier)?.label ?? config.modelTier;
  const mem = MEMORY_SCOPES.find((m) => m.id === config.memoryScope)?.label ?? config.memoryScope;
  const parts = [
    `Model: ${tiers}`,
    `Memory: ${mem}`,
    `Tools: ${config.tools.length ? labelsFor(TOOL_OPTIONS, config.tools).join(' · ') : '—'}`,
    `Knowledge: ${config.knowledge.length ? labelsFor(KNOWLEDGE_OPTIONS, config.knowledge).join(' · ') : '—'}`,
    `Guardrails: ${config.guardrails.length ? labelsFor(GUARDRAIL_OPTIONS, config.guardrails).join(' · ') : '—'}`,
  ];
  if (config.voice.trim()) parts.push(`Voice: ${config.voice.trim().slice(0, 140)}`);
  return parts.join('\n');
}
