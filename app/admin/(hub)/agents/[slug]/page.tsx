import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import {
  marketplaceAgentBySlug,
  CATEGORY_LABELS,
  MODEL_TIER_LABELS,
} from '@/lib/marketplace/agents';
import {
  getAgentDbRow,
  getKnowledgeSources,
  getPromptOverride,
  getMarketplacePromptRow,
} from '@/lib/admin/v2-data';
import { buildDashboardRows, getAgentAuditLog, STATUS_LABELS } from '@/lib/admin/agents-dashboard';
import {
  setAgentStatus,
  updateAgentMeta,
  stagePromptOverride,
  applyPromptOverride,
  discardPromptOverride,
  toggleKnowledgeLink,
  syncKnowledgeSource,
} from '../actions';
import {
  BODY,
  C,
  DISPLAY,
  GoldButton,
  Card,
  Eyebrow,
  Grid,
  MONO,
  Pill,
  SectionTitle,
  nzDate,
} from '@/components/admin/ui';
import { TestChatPanel } from './TestChatPanel';

export const dynamic = 'force-dynamic';

const STATUSES = ['live', 'draft', 'retired', 'coming_soon'] as const;

const DERIVED_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'neutral'> = {
  live: 'ok',
  chat_only: 'warn',
  stub: 'bad',
  not_started: 'neutral',
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

  const [dashboard, dbRow, override, livePrompt, knowledge, audit] = await Promise.all([
    buildDashboardRows(),
    getAgentDbRow(slug),
    getPromptOverride(slug),
    getMarketplacePromptRow(slug),
    getKnowledgeSources(),
    getAgentAuditLog(slug, 20),
  ]);
  const row = dashboard.rows.find((r) => r.slug === slug);
  const derived = row?.status ?? 'stub';
  const catalogueStatus = dbRow?.status ?? (agent.status === 'live' ? 'live' : 'coming_soon');
  const stagedOverride = override && override.status === 'staged' ? override : null;
  // Mirrors the runtime's resolution order: DB marketplace row, else code.
  const livePromptText = livePrompt?.system_prompt ?? agent.systemPrompt;
  const linkedSources = knowledge.rows.filter((s) => s.dependent_agents.includes(slug));

  return (
    <>
      <Link
        href="/admin/agents"
        style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', color: C.muted, textDecoration: 'none' }}
      >
        ← AGENTS
      </Link>
      <div style={{ height: 10 }} />

      <header style={{ marginBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 10 }}>
          Operator hub · {row?.bundleName !== '—' ? row?.bundleName : CATEGORY_LABELS[agent.category] ?? agent.category}
        </Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: C.ink,
              margin: 0,
              textTransform: 'lowercase',
            }}
          >
            {agent.name}
          </h1>
          {agent.teReo && <span style={{ fontFamily: BODY, fontSize: 15, color: C.muted }}>{agent.teReo}</span>}
          <Pill tone={DERIVED_TONE[derived] ?? 'neutral'}>{STATUS_LABELS[derived]}</Pill>
          {row?.isBundleLead && <Pill tone="gold">bundle lead</Pill>}
        </div>
        <p style={{ fontFamily: BODY, color: C.body, fontSize: 15, margin: '10px 0 0', maxWidth: 640 }}>
          {agent.description}
        </p>
      </header>

      <div className="aad-detail">
        <div style={{ minWidth: 0 }}>
          {/* ── Live surfaces ── */}
          <SectionTitle style={{ marginTop: 0 }}>Live surfaces</SectionTitle>
          <Card>
            {row?.surfaces.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {row.surfaces.map((s) => (
                  <a
                    key={s.href + s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: C.goldDeep,
                      background: C.cream,
                      border: `1px solid ${C.hairline}`,
                      borderRadius: 999,
                      padding: '7px 14px',
                      textDecoration: 'none',
                    }}
                  >
                    {s.label} ↗
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: BODY, color: C.muted, fontSize: 14, margin: 0 }}>
                Not reachable anywhere yet.
              </p>
            )}
          </Card>

          {/* ── Compliance notes ── */}
          <SectionTitle>Compliance notes</SectionTitle>
          <Card tone="cream">
            <ul style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>
                <strong style={{ color: C.ink }}>Draft-mode enforced</strong> — every output is a model-assisted
                draft; nothing sends, books, or files without a human.
              </li>
              {row?.kaumatuaHold && (
                <li>
                  <strong style={{ color: C.warn }}>Kaumātua-hold</strong> — taonga-species content (kiwi, kākāpō,
                  tuatara, whakapapa) is held for a named kaitiaki reviewer; the test chat refuses those queries.
                </li>
              )}
              {row?.tikangaSensitive && (
                <li>
                  <strong style={{ color: C.goldDeep }}>Tikanga-sensitive</strong> — outputs touching mātauranga or
                  taonga run under the tikanga governance layer; naming and whakapapa are never generated.
                </li>
              )}
              {!row?.kaumatuaHold && !row?.tikangaSensitive && (
                <li>No cultural-governance flags on this agent.</li>
              )}
            </ul>
          </Card>

          {/* ── Knowledge sources ── */}
          <SectionTitle>Knowledge sources</SectionTitle>
          <Card>
            {!knowledge.available ? (
              <p style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: 0 }}>
                The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>knowledge_sources</code> registry isn&apos;t
                live in this environment yet.
              </p>
            ) : (
              <>
                <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '0 0 14px' }}>
                  {linkedSources.length
                    ? `${linkedSources.length} Tier A anchor${linkedSources.length === 1 ? ' grounds' : 's ground'} this agent's citations.`
                    : 'No Tier A anchor is linked — answers cite the generic NZ knowledge base only.'}{' '}
                  Linking adds the agent to a source&apos;s{' '}
                  <code style={{ fontFamily: MONO, fontSize: 12.5 }}>dependent_agents</code>; sync-now kicks the
                  ingest function for that source.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                  {knowledge.rows.map((s) => {
                    const linked = s.dependent_agents.includes(slug);
                    return (
                      <div
                        key={s.source_slug}
                        style={{
                          border: `1px solid ${linked ? C.gold : C.hairline}`,
                          background: linked ? C.pale : C.paper,
                          borderRadius: 12,
                          padding: '12px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13.5, color: C.ink }}>
                              {s.source_name}
                            </div>
                            <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, marginTop: 2 }}>
                              Tier {s.tier} · synced {nzDate(s.last_fetched_at)} ·{' '}
                              <span style={{ color: s.last_status === 'ok' || s.last_status === 'unchanged' ? C.ok : C.bad }}>
                                {s.last_status ?? 'never'}
                              </span>
                            </div>
                          </div>
                          <Pill tone={linked ? 'gold' : 'neutral'}>{linked ? 'linked' : 'unlinked'}</Pill>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <form action={toggleKnowledgeLink}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="source_slug" value={s.source_slug} />
                            <input type="hidden" name="link" value={linked ? '0' : '1'} />
                            <button type="submit" style={miniBtn(false)}>
                              {linked ? 'unlink' : 'link'}
                            </button>
                          </form>
                          <form action={syncKnowledgeSource}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="source_slug" value={s.source_slug} />
                            <button type="submit" style={miniBtn(true)}>
                              sync now
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>

          {/* ── System prompt ── */}
          <SectionTitle>System prompt</SectionTitle>
          <Card tone="cream">
            <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '0 0 12px' }}>
              <strong>The database is live.</strong> Chat reads this prompt from{' '}
              <code style={{ fontFamily: MONO, fontSize: 12.5 }}>agent_prompts</code> (pack{' '}
              <code style={{ fontFamily: MONO, fontSize: 12.5 }}>marketplace</code>), falling back to the code
              registry if no row exists. An edit below is <strong>staged</strong> in{' '}
              <code style={{ fontFamily: MONO, fontSize: 12.5 }}>agent_prompt_overrides</code> first — test-chat it
              on the right, then <strong>Apply to live chat</strong> pushes it into the live row. Chat picks it up
              within ~5 minutes.
            </p>
            <Eyebrow style={{ marginBottom: 8 }}>
              {livePrompt
                ? `Live prompt — DB v${livePrompt.version} · applied ${nzDate(livePrompt.updated_at)}`
                : 'Live prompt — code fallback (no DB row yet)'}
            </Eyebrow>
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
              {livePromptText}
            </pre>

            <div style={{ height: 18 }} />
            <Eyebrow style={{ marginBottom: 8 }}>
              {stagedOverride ? 'Staged edit — not live yet' : 'Stage an edit'}
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
                defaultValue={stagedOverride?.system_prompt ?? livePromptText}
                style={{ ...input, fontFamily: MONO, fontSize: 12, resize: 'vertical' }}
              />
              <input
                name="note"
                placeholder="Why this change? (kept on the override row for the audit trail)"
                defaultValue={stagedOverride?.note ?? ''}
                style={{ ...input, marginTop: 10 }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
                <GoldButton>Stage prompt edit</GoldButton>
              </div>
            </form>
            {stagedOverride && (
              <div style={{ display: 'flex', gap: 18, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                {stagedOverride.system_prompt.trim().length > 200 ? (
                  <>
                    <form action={applyPromptOverride}>
                      <input type="hidden" name="slug" value={slug} />
                      <GoldButton>Apply to live chat</GoldButton>
                    </form>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>
                      writes agent_prompts v{(livePrompt?.version ?? 0) + 1} · live in ~5 min
                    </span>
                  </>
                ) : (
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.warn }}>
                    too short to apply — the runtime ignores prompts under 200 characters
                  </span>
                )}
                <form action={discardPromptOverride}>
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
              </div>
            )}
          </Card>

          {/* ── Recent audit log ── */}
          <SectionTitle>Recent audit log</SectionTitle>
          <Card>
            {audit.length === 0 ? (
              <p style={{ fontFamily: BODY, color: C.muted, fontSize: 14, margin: 0 }}>
                No exchanges recorded for this agent yet — test chats on the right land here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {audit.map((a) => (
                  <div key={a.id} style={{ borderBottom: `1px solid ${C.hairline}`, paddingBottom: 10 }}>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, marginBottom: 4 }}>
                      {nzDate(a.created_at)} · {a.tool_name ?? 'exchange'}
                      {a.decision && (
                        <span style={{ color: a.decision === 'kaumatua_hold' ? C.warn : C.goldDeep }}>
                          {' '}
                          · {a.decision}
                        </span>
                      )}
                      {a.trust && <span> · trust {a.trust}</span>}
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: 13.5, color: C.ink, fontWeight: 700 }}>{a.query}</div>
                    <div
                      style={{
                        fontFamily: BODY,
                        fontSize: 13,
                        color: C.body,
                        marginTop: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {a.response}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Catalogue controls (status + mirror record) ── */}
          <SectionTitle>Catalogue status</SectionTitle>
          <Card>
            <p style={{ fontFamily: BODY, color: C.body, fontSize: 14, margin: '0 0 14px' }}>
              Controls catalogue visibility in the <code style={{ fontFamily: MONO, fontSize: 12.5 }}>agents</code>{' '}
              mirror table. The badge up top is <em>derived</em> — live needs this set to live AND a linked Tier A
              source.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {STATUSES.map((s) => (
                <form key={s} action={setAgentStatus}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    disabled={s === catalogueStatus}
                    style={{
                      fontFamily: BODY,
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: s === catalogueStatus ? C.ink : C.body,
                      background: s === catalogueStatus ? C.gold : C.paper,
                      border: `1.5px solid ${s === catalogueStatus ? C.gold : C.hairline}`,
                      borderRadius: 999,
                      padding: '8px 18px',
                      cursor: s === catalogueStatus ? 'default' : 'pointer',
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
                  <select name="bundle" defaultValue={dbRow?.bundle ?? row?.bundle ?? ''} style={input}>
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
                <GoldButton>Save catalogue record</GoldButton>
              </div>
            </form>
            {!dbRow && (
              <p style={{ fontFamily: MONO, fontSize: 11.5, color: C.muted, margin: '14px 0 0' }}>
                No DB mirror row in this environment yet — saving is a no-op until the roster seed has run.
              </p>
            )}
          </Card>
        </div>

        {/* ── Test chat (right rail, sticky, full height) ── */}
        <div className="aad-chat">
          <TestChatPanel
            slug={slug}
            agentName={agent.name.toLowerCase()}
            greeting={agent.greeting}
            kaumatuaHold={row?.kaumatuaHold === true}
          />
        </div>
      </div>

      <style>{`
        .aad-detail {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: 22px;
          align-items: start;
        }
        .aad-chat {
          position: sticky;
          top: 18px;
          height: calc(100vh - 36px);
          min-height: 480px;
        }
        @media (max-width: 1020px) {
          .aad-detail { grid-template-columns: 1fr; }
          .aad-chat { position: static; height: 560px; }
        }
      `}</style>
    </>
  );
}

function miniBtn(gold: boolean): CSSProperties {
  return {
    fontFamily: MONO,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: gold ? C.ink : C.body,
    background: gold ? C.gold : C.cream,
    border: 'none',
    borderRadius: 999,
    padding: '6px 13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}
