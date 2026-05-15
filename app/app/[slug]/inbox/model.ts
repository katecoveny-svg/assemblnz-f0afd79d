import {
  agentBySlug,
  PHASE_LABELS,
  PHASE_ORDER,
  type Agent,
  type AgentPhase,
} from '@/lib/agents';

export type InboxFilter =
  | 'all'
  | 'hunt'
  | 'pitch'
  | 'execution'
  | 'ledger'
  | 'high-confidence'
  | 'needs-your-voice';

export type DraftMetadata = {
  title?: string;
  subject?: string;
  phase?: AgentPhase;
  citations?: string[];
  sources?: string[];
  legislation?: string[];
  needs_operator_voice?: boolean;
  deferred_until?: string;
  job?: string;
  reasoning_trace_id?: string;
  ledger_ready?: boolean;
};

export type OperatorDraftRow = {
  id: string;
  status: string;
  draft_body: string;
  incoming_body: string | null;
  confidence: number | null;
  created_by_agent: string;
  contact_name: string | null;
  contact_identifier: string | null;
  source_metadata: DraftMetadata | null;
  extracted_actions: unknown;
  created_at: string;
};

export type OperatorDraft = {
  id: string;
  status: string;
  title: string;
  preview: string;
  draftBody: string;
  confidence: number | null;
  agentSlug: string;
  agentName: string;
  phase: AgentPhase;
  phaseLabel: string;
  citations: string[];
  needsOperatorVoice: boolean;
  highConfidence: boolean;
  ledgerReady: boolean;
  createdAt: string;
  contact: string | null;
};

export type PhaseGroup = {
  phase: AgentPhase;
  label: string;
  drafts: OperatorDraft[];
};

export type AgentGroup = {
  agentSlug: string;
  agentName: string;
  role: string;
  phaseGroups: PhaseGroup[];
  draftCount: number;
};

export const FILTERS: Array<{ id: InboxFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'hunt', label: 'Hunt' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'execution', label: 'Execution' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'high-confidence', label: 'High-confidence' },
  { id: 'needs-your-voice', label: 'Needs your voice' },
];

export function toOperatorDraft(row: OperatorDraftRow): OperatorDraft {
  const agent = agentBySlug(row.created_by_agent.toLowerCase());
  const metadata = row.source_metadata ?? {};
  const phase = resolvePhase(metadata, agent);
  const citations = collectCitations(metadata, row.extracted_actions, agent);
  const title = titleForDraft(row, metadata);
  const preview = previewForDraft(row.draft_body);
  const confidence = row.confidence == null ? null : Number(row.confidence);

  return {
    id: row.id,
    status: row.status,
    title,
    preview,
    draftBody: row.draft_body,
    confidence,
    agentSlug: agent?.slug ?? row.created_by_agent.toLowerCase(),
    agentName: agent?.name ?? humanise(row.created_by_agent),
    phase,
    phaseLabel: PHASE_LABELS[phase],
    citations,
    needsOperatorVoice: Boolean(metadata.needs_operator_voice),
    highConfidence: confidence != null && confidence >= 0.86,
    ledgerReady: Boolean(metadata.ledger_ready),
    createdAt: row.created_at,
    contact: row.contact_name ?? row.contact_identifier,
  };
}

export function groupDraftsByAgent(drafts: OperatorDraft[]): AgentGroup[] {
  const byAgent = new Map<string, OperatorDraft[]>();
  for (const draft of drafts) {
    const existing = byAgent.get(draft.agentSlug) ?? [];
    existing.push(draft);
    byAgent.set(draft.agentSlug, existing);
  }

  return [...byAgent.entries()]
    .map(([agentSlug, rows]) => {
      const agent = agentBySlug(agentSlug);
      const phaseGroups = PHASE_ORDER
        .filter((phase) => phase !== 'infra')
        .map((phase) => ({
          phase,
          label: PHASE_LABELS[phase],
          drafts: rows.filter((draft) => draft.phase === phase),
        }))
        .filter((group) => group.drafts.length > 0);

      return {
        agentSlug,
        agentName: agent?.name ?? rows[0]?.agentName ?? humanise(agentSlug),
        role: agent?.role ?? 'Operator draft',
        phaseGroups,
        draftCount: rows.length,
      };
    })
    .sort((a, b) => a.agentName.localeCompare(b.agentName));
}

export function filterDrafts(drafts: OperatorDraft[], filter: InboxFilter) {
  if (filter === 'all') return drafts;
  if (filter === 'high-confidence') return drafts.filter((draft) => draft.highConfidence);
  if (filter === 'needs-your-voice') return drafts.filter((draft) => draft.needsOperatorVoice);
  return drafts.filter((draft) => draft.phase === filter);
}

export function summariseDrafts(drafts: OperatorDraft[]) {
  const byPhase = new Map<AgentPhase, number>();
  const highConfidence = drafts.filter((draft) => draft.highConfidence).length;
  const needsVoice = drafts.filter((draft) => draft.needsOperatorVoice).length;

  for (const draft of drafts) {
    byPhase.set(draft.phase, (byPhase.get(draft.phase) ?? 0) + 1);
  }

  return {
    total: drafts.length,
    highConfidence,
    needsVoice,
    byPhase: PHASE_ORDER
      .filter((phase) => phase !== 'infra')
      .map((phase) => ({
        phase,
        label: PHASE_LABELS[phase],
        count: byPhase.get(phase) ?? 0,
      })),
  };
}

function resolvePhase(metadata: DraftMetadata, agent?: Agent): AgentPhase {
  if (metadata.phase && PHASE_ORDER.includes(metadata.phase)) return metadata.phase;
  if (agent?.phase && agent.phase !== 'infra') return agent.phase;
  return 'execution';
}

function collectCitations(
  metadata: DraftMetadata,
  extractedActions: unknown,
  agent?: Agent,
) {
  const values = [
    ...(metadata.citations ?? []),
    ...(metadata.sources ?? []),
    ...(metadata.legislation ?? []),
  ];

  if (Array.isArray(extractedActions)) {
    for (const action of extractedActions) {
      if (!action || typeof action !== 'object') continue;
      const maybe = action as { citations?: unknown; source?: unknown; legislation?: unknown };
      if (Array.isArray(maybe.citations)) values.push(...maybe.citations.filter(isString));
      if (typeof maybe.source === 'string') values.push(maybe.source);
      if (typeof maybe.legislation === 'string') values.push(maybe.legislation);
    }
  }

  if (values.length === 0 && agent?.legislation) values.push(...agent.legislation.slice(0, 2));
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))].slice(0, 5);
}

function titleForDraft(row: OperatorDraftRow, metadata: DraftMetadata) {
  const explicit = metadata.title ?? metadata.subject;
  if (explicit && explicit.trim().length > 0) return explicit.trim();

  const source = row.incoming_body ?? row.draft_body;
  const firstLine = source
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) return 'Review draft';
  return firstLine.length > 96 ? `${firstLine.slice(0, 93)}...` : firstLine;
}

function previewForDraft(body: string) {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
  return lines.join(' ');
}

function humanise(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
