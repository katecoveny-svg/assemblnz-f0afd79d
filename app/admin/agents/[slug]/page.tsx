import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  marketplaceAgentBySlug,
  CATEGORY_LABELS,
  priceLabel,
  MODEL_TIER_LABELS,
} from '@/lib/marketplace/agents';
import { getAgentMetrics, getAgentStatusOverrides, nzd } from '@/lib/admin/data';
import { setAgentStatus } from '../actions';
import { BODY, C, Card, Eyebrow, Grid, MONO, PageHeader, Pill, SectionTitle, StatCard } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const STATUSES = ['live', 'draft', 'archived'] as const;
const STATUS_TONE: Record<string, 'ok' | 'warn' | 'neutral'> = { live: 'ok', draft: 'warn', archived: 'neutral' };

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) notFound();

  const [metrics, overrides] = await Promise.all([getAgentMetrics(), getAgentStatusOverrides()]);
  const m = metrics[slug] ?? { chats: 0, installs: 0, revenue: 0 };
  const status = overrides[slug] ?? (agent.status === 'live' ? 'live' : 'draft');

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
        actions={<Pill tone={STATUS_TONE[status] ?? 'neutral'}>{status}</Pill>}
      />

      <Grid min={190}>
        <StatCard label="Chats" value={m.chats} />
        <StatCard label="Installs" value={m.installs} />
        <StatCard label="Revenue · est." value={m.revenue ? nzd(m.revenue) : '—'} />
        <StatCard label="Rating" value="—" hint="No ratings yet" />
      </Grid>

      <SectionTitle>Status</SectionTitle>
      <Card>
        <p style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: '0 0 14px' }}>
          Controls catalogue visibility in the <code style={{ fontFamily: MONO, fontSize: 12.5 }}>agents</code> mirror
          table. Live shows on the marketplace; draft and archived hide it.
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
                {s}
              </button>
            </form>
          ))}
        </div>
      </Card>

      <SectionTitle>Metadata</SectionTitle>
      <Card>
        <Grid min={180} gap={18}>
          <Meta label="Slug" value={agent.slug} mono />
          <Meta label="Category" value={CATEGORY_LABELS[agent.category] ?? agent.category} />
          <Meta label="Price" value={priceLabel(agent)} mono />
          <Meta label="Model tier" value={MODEL_TIER_LABELS[agent.modelTier] ?? agent.modelTier} />
          <Meta label="Featured" value={agent.featured ? 'yes' : 'no'} />
          <Meta label="Vertical" value={agent.vertical ? 'yes' : 'no'} />
        </Grid>
        <div style={{ marginTop: 18 }}>
          <Eyebrow>What it does</Eyebrow>
          <ul style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: '8px 0 0', paddingLeft: 18 }}>
            {agent.whatItDoes.map((w, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <SectionTitle>System prompt</SectionTitle>
      <Card tone="cream">
        <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '0 0 12px' }}>
          The system prompt is <strong>locked in code</strong> (
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>lib/marketplace/agent-prompts.ts</code>) and version-controlled —
          it is shown here read-only. Editing prompts ships through a PR so every change is reviewed and recorded.
        </p>
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
            maxHeight: 420,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}
        >
          {agent.systemPrompt}
        </pre>
      </Card>
    </>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div
        style={{
          fontFamily: mono ? MONO : BODY,
          fontSize: mono ? 13 : 15,
          fontWeight: mono ? 400 : 600,
          color: C.ink,
          marginTop: 5,
        }}
      >
        {value}
      </div>
    </div>
  );
}
