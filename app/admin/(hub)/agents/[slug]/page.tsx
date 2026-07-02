import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import {
  marketplaceAgentBySlug,
  CATEGORY_LABELS,
  priceLabel,
  MODEL_TIER_LABELS,
} from '@/lib/marketplace/agents';
import { getAgentMetrics, getAgentStatusOverrides, nzd } from '@/lib/admin/data';
import { getAgentDbRow, getKnowledgeSources, getPromptOverride } from '@/lib/admin/v2-data';
import {
  setAgentStatus,
  updateAgentMeta,
  stagePromptOverride,
  discardPromptOverride,
  toggleKnowledgeLink,
} from '../actions';
import {
  BODY,
  C,
  CanaryButton,
  Card,
  Eyebrow,
  Grid,
  MONO,
  PageHeader,
  Pill,
  SectionTitle,
  StatCard,
  nzDate,
} from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const STATUSES = ['live', 'draft', 'retired', 'coming_soon'] as const;
const STATUS_TONE: Record<string, 'ok' | 'warn' | 'neutral'> = {
  live: 'ok',
  draft: 'warn',
  coming_soon: 'warn',
  retired: 'neutral',
};

const BUNDLE_OPTIONS = [
  { value: '', label: 'standalone (no bundle)' },
  { value: 'assembler', label: 'Assembler — construction' },
  { value: 'forge', label: 'Forge — automotive' },
  { value: 'ensemble', label: 'Ensemble — creative' },
  { value: 'practice', label: 'Practice — health' },
  { value: 'hearth', label: 'Hearth — family/whānau' },
  { value: 'counsel', label: 'Counsel — legal' },
  { value: 'visa', label: 'Visa — immigration' },
];

const input: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
  fontSize: 14,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  boxSizing: 'border-box',
};

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) notFound();

  const [metrics, overrides, dbRow, override, knowledge] = await Promise.all([
    getAgentMetrics(),
    getAgentStatusOverrides(),
    getAgentDbRow(slug),
    getPromptOverride(slug),
    getKnowledgeSources(),
  ]);
  const m = metrics[slug] ?? { chats: 0, installs: 0, revenue: 0 };
  const status = overrides[slug] ?? (agent.status === 'live' ? 'live' : 'draft');
  const stagedOverride = override && override.status === 'staged' ? override : null;

  return (
    <>
      <Link href="/admin/agents" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', color: C.muted, textDecoration: 'none' }}>
        ← AGENTS
      </Link>
      <div style={{ height: 10 }} />
      <PageHeader
        eyebrow={`Operator hub · ${CATEGORY_LABELS[agent.category] ?? agent.category}`}
        title={agent.name}
        lede={agent.description}
        actions={<Pill tone={STATUS_TONE[status] ?? 'neutral'}>{status.replace('_', ' ')}</Pill>}
      />

      <Grid min={190}>
        <StatCard label="Chats" value={m.chats} />
        <StatCard label="Installs" value={m.installs} />
        <StatCard label="Revenue · est." value={m.revenue ? nzd(m.revenue) : '—'} />
        <StatCard label="Price" value={priceLabel(agent)} />
      </Grid>

      <SectionTitle>Status</SectionTitle>
      <Card>
        <p style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: '0 0 14px' }}>
          Controls catalogue visibility in the <code style={{ fontFamily: MONO, fontSize: 12.5 }}>agents</code> mirror
          table. Live shows on the marketplace; draft, coming soon and retired hide it.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <form key={s} action={setAgentStatus}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                disabled={s === status}
                style={{
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: s === status ? C.ink : C.body,
                  background: s === status ? C.canary : C.paper,
                  border: `1.5px solid ${s === status ? C.canary : C.hairline}`,
                  borderRadius: 999,
                  padding: '8px 18px',
                  cursor: s === status ? 'default' : 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {s.replace('_', ' ')}
              </button>
            </form>
          ))}
        </div>
      </Card>

      <SectionTitle>Catalogue record</SectionTitle>
      <Card>
        <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '0 0 16px' }}>
          Edits the <code style={{ fontFamily: MONO, fontSize: 12.5 }}>agents</code> DB mirror (name, description,
          model tier, bundle). The code registry in{' '}
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>lib/marketplace/agents.ts</code> stays the marketplace
          render source — keep the two in step via the seed migration when a rename ships.
        </p>
        <form action={updateAgentMeta}>
          <input type="hidden" name="slug" value={slug} />
          <Grid min={230} gap={16}>
            <label style={{ display: 'block' }}>
              <Eyebrow style={{ marginBottom: 6 }}>Display name</Eyebrow>
              <input name="name" defaultValue={dbRow?.name ?? agent.name} style={input} />
            </label>
            <label style={{ display: 'block' }}>
              <Eyebrow style={{ marginBottom: 6 }}>Model tier</Eyebrow>
              <select name="model_tier" defaultValue={dbRow?.model_tier ?? agent.modelTier} style={input}>
                {(['cheap', 'mid', 'premium'] as const).map((t) => (
                  <option key={t} value={t}>
                    {MODEL_TIER_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'block' }}>
              <Eyebrow style={{ marginBottom: 6 }}>Bundle</Eyebrow>
              <select name="bundle" defaultValue={dbRow?.bundle ?? ''} style={input}>
                {BUNDLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </Grid>
          <label style={{ display: 'block', marginTop: 16 }}>
            <Eyebrow style={{ marginBottom: 6 }}>Description</Eyebrow>
            <textarea
              name="description"
              rows={3}
              defaultValue={dbRow?.description ?? agent.description}
              style={{ ...input, resize: 'vertical' }}
            />
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
              fontFamily: BODY,
              fontSize: 13.5,
              color: C.body,
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" name="is_bundle_lead" defaultChecked={dbRow?.is_bundle_lead === true} />
            Bundle lead (this agent is the front door of its bundle)
          </label>
          <div style={{ marginTop: 16 }}>
            <CanaryButton>Save catalogue record</CanaryButton>
          </div>
        </form>
        {!dbRow && (
          <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.muted, margin: '14px 0 0' }}>
            No DB mirror row in this environment yet — saving is a no-op until the roster seed has run.
          </p>
        )}
      </Card>

      <SectionTitle>System prompt</SectionTitle>
      <Card tone="cream">
        <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '0 0 12px' }}>
          <strong>Code is canonical.</strong> The runtime reads this prompt from{' '}
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>lib/marketplace/agent-prompts.ts</code> — never from the
          database. An edit below is <strong>staged</strong> in{' '}
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>agent_prompt_overrides</code> for the next code sync; it
          does not change what the agent says until it ships through a PR.
        </p>
        <Eyebrow style={{ marginBottom: 8 }}>Live prompt (from code)</Eyebrow>
        <pre
          style={{
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1.55,
            color: C.ink,
            background: C.paper,
            border: `1px solid ${C.hairline}`,
            borderRadius: 12,
            padding: 16,
            maxHeight: 340,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}
        >
          {agent.systemPrompt}
        </pre>

        <div style={{ height: 18 }} />
        <Eyebrow style={{ marginBottom: 8 }}>
          {stagedOverride ? 'Staged edit — awaiting code sync' : 'Stage an edit'}
        </Eyebrow>
        {stagedOverride && (
          <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.warn, margin: '0 0 10px' }}>
            staged by {stagedOverride.updated_by ?? 'unknown'} · {nzDate(stagedOverride.updated_at)}
          </p>
        )}
        <form action={stagePromptOverride}>
          <input type="hidden" name="slug" value={slug} />
          <textarea
            name="system_prompt"
            rows={10}
            defaultValue={stagedOverride?.system_prompt ?? agent.systemPrompt}
            style={{ ...input, fontFamily: MONO, fontSize: 12, resize: 'vertical' }}
          />
          <input
            name="note"
            placeholder="Why this change? (lands in the sync PR description)"
            defaultValue={stagedOverride?.note ?? ''}
            style={{ ...input, marginTop: 10 }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <CanaryButton>Stage prompt edit</CanaryButton>
          </div>
        </form>
        {stagedOverride && (
          <form action={discardPromptOverride} style={{ marginTop: 10 }}>
            <input type="hidden" name="slug" value={slug} />
            <button
              type="submit"
              style={{
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 13,
                color: C.bad,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Discard staged edit
            </button>
          </form>
        )}
      </Card>

      <SectionTitle>Knowledge sources</SectionTitle>
      <Card>
        {!knowledge.available ? (
          <p style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: 0 }}>
            The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>knowledge_sources</code> registry isn&apos;t live in
            this environment yet.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '0 0 14px' }}>
              Linking adds this agent to a source&apos;s{' '}
              <code style={{ fontFamily: MONO, fontSize: 12.5 }}>dependent_agents</code> — when the source materially
              changes, the Tier A pipeline flags the agent for a scenario-pack refresh.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {knowledge.rows.map((s) => {
                const linked = s.dependent_agents.includes(slug);
                return (
                  <form
                    key={s.source_slug}
                    action={toggleKnowledgeLink}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      border: `1px solid ${linked ? C.gold : C.hairline}`,
                      background: linked ? C.pale : C.paper,
                      borderRadius: 12,
                      padding: '10px 14px',
                    }}
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="source_slug" value={s.source_slug} />
                    <input type="hidden" name="link" value={linked ? '0' : '1'} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13.5, color: C.ink }}>
                        {s.source_name}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted }}>
                        Tier {s.tier} · every {s.refresh_cadence_days}d
                      </div>
                    </div>
                    <button
                      type="submit"
                      style={{
                        fontFamily: MONO,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: linked ? C.ink : C.body,
                        background: linked ? C.canary : C.cream,
                        border: 'none',
                        borderRadius: 999,
                        padding: '5px 12px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {linked ? 'linked' : 'link'}
                    </button>
                  </form>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <SectionTitle>What it does</SectionTitle>
      <Card>
        <ul style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: 0, paddingLeft: 18 }}>
          {agent.whatItDoes.map((w, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {w}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
