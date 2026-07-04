import type { CSSProperties } from 'react';
import { PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';
import { nzd } from '@/lib/admin/data';
import { getAgentsByBundle, getBundles } from '@/lib/admin/v2-data';
import { setAgentBundle, updateBundle } from './actions';
import {
  BODY,
  C,
  GoldButton,
  Card,
  Empty,
  Eyebrow,
  Grid,
  MONO,
  PageHeader,
  Pill,
  SectionTitle,
  StatCard,
} from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

/**
 * /admin/bundles — CRUD over the seven locked bundles (BUNDLES-V4, migration
 * 20260701093000). Edits the bundle card (name, tagline, price, order, status,
 * lead) and manages membership via agents.bundle / is_bundle_lead /
 * parent_slug.
 */

const input: CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
  fontSize: 13.5,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  boxSizing: 'border-box',
};

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'neutral'> = {
  live: 'ok',
  draft: 'warn',
  retired: 'neutral',
};

export default async function BundlesPage() {
  const [{ rows: bundles, available }, byBundle] = await Promise.all([getBundles(), getAgentsByBundle()]);

  const totalMembers = bundles.reduce((s, b) => s + (byBundle.get(b.slug)?.length ?? 0), 0);
  const unbundled = byBundle.get(null) ?? [];
  const agentNames = new Map(PUBLIC_MARKETPLACE_AGENTS.map((a) => [a.slug, a.name]));

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Bundles"
        title="bundles"
        lede="The seven locked buying units. Edit each card, set shelf order, and move agents between bundles. Membership writes agents.bundle; leads carry is_bundle_lead."
      />

      {!available ? (
        <Empty>
          The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>bundles</code> table isn&apos;t live in this
          environment yet — apply migration 20260701093000 (and 20260703100000 for sort order).
        </Empty>
      ) : (
        <>
          <Grid min={200}>
            <StatCard label="Bundles" value={bundles.length} />
            <StatCard label="Bundled agents" value={totalMembers} />
            <StatCard label="Unbundled agents" value={unbundled.length} hint="standalones + unmapped" />
          </Grid>

          {bundles.map((b) => {
            const members = byBundle.get(b.slug) ?? [];
            return (
              <section key={b.slug}>
                <SectionTitle>
                  {b.name}{' '}
                  <span style={{ fontFamily: MONO, fontSize: 13, color: C.muted, fontWeight: 400 }}>
                    · {b.slug} · {b.category ?? '—'}
                  </span>
                </SectionTitle>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <Pill tone={STATUS_TONE[b.status ?? ''] ?? 'neutral'}>{b.status ?? '—'}</Pill>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.body }}>
                      {b.monthly_nzd !== null ? `${nzd(b.monthly_nzd)}/mo` : '—'} · lead: {b.lead_agent_slug ?? '—'}
                    </span>
                  </div>

                  <form action={updateBundle}>
                    <input type="hidden" name="slug" value={b.slug} />
                    <Grid min={170} gap={14}>
                      <label>
                        <Eyebrow style={{ marginBottom: 6 }}>Name</Eyebrow>
                        <input name="name" defaultValue={b.name} style={input} />
                      </label>
                      <label>
                        <Eyebrow style={{ marginBottom: 6 }}>Lead agent slug</Eyebrow>
                        <input name="lead_agent_slug" defaultValue={b.lead_agent_slug ?? ''} style={{ ...input, fontFamily: MONO, fontSize: 12.5 }} />
                      </label>
                      <label>
                        <Eyebrow style={{ marginBottom: 6 }}>Monthly NZ$</Eyebrow>
                        <input name="monthly_nzd" type="number" step="0.01" min="0" defaultValue={b.monthly_nzd ?? 0} style={input} />
                      </label>
                      <label>
                        <Eyebrow style={{ marginBottom: 6 }}>Shelf order</Eyebrow>
                        <input name="sort_order" type="number" defaultValue={b.sort_order} style={input} />
                      </label>
                      <label>
                        <Eyebrow style={{ marginBottom: 6 }}>Status</Eyebrow>
                        <select name="status" defaultValue={b.status ?? 'live'} style={input}>
                          <option value="live">live</option>
                          <option value="draft">draft</option>
                          <option value="retired">retired</option>
                        </select>
                      </label>
                    </Grid>
                    <label style={{ display: 'block', marginTop: 14 }}>
                      <Eyebrow style={{ marginBottom: 6 }}>Tagline (short pitch)</Eyebrow>
                      <textarea name="short_pitch" rows={2} defaultValue={b.short_pitch ?? ''} style={{ ...input, resize: 'vertical' }} />
                    </label>
                    <div style={{ marginTop: 14 }}>
                      <GoldButton>Save bundle</GoldButton>
                    </div>
                  </form>

                  <div style={{ height: 20 }} />
                  <Eyebrow style={{ marginBottom: 10 }}>
                    Members · {members.length}
                  </Eyebrow>
                  {members.length === 0 ? (
                    <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.muted, margin: 0 }}>
                      No live members yet — Phase 2 builds this bundle&apos;s specialists.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {members.map((mem) => (
                        <form
                          key={mem.slug}
                          action={setAgentBundle}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            border: `1px solid ${mem.is_bundle_lead ? C.gold : C.hairline}`,
                            background: mem.is_bundle_lead ? C.pale : C.paper,
                            borderRadius: 999,
                            padding: '6px 8px 6px 14px',
                          }}
                        >
                          <input type="hidden" name="agent_slug" value={mem.slug} />
                          <input type="hidden" name="bundle" value="" />
                          <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 700, color: C.ink }}>
                            {agentNames.get(mem.slug) ?? mem.name ?? mem.slug}
                          </span>
                          {mem.is_bundle_lead && (
                            <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: C.goldEyebrow }}>
                              LEAD
                            </span>
                          )}
                          {mem.status && mem.status !== 'live' && (
                            <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.muted }}>{mem.status}</span>
                          )}
                          <button
                            type="submit"
                            title={`Remove ${mem.slug} from ${b.slug}`}
                            style={{
                              fontFamily: MONO,
                              fontSize: 11,
                              color: C.bad,
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0 4px',
                            }}
                          >
                            ×
                          </button>
                        </form>
                      ))}
                    </div>
                  )}

                  <div style={{ height: 16 }} />
                  <form action={setAgentBundle} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="hidden" name="bundle" value={b.slug} />
                    <select name="agent_slug" defaultValue="" style={{ ...input, width: 280 }}>
                      <option value="" disabled>
                        add an agent to {b.name}…
                      </option>
                      {unbundled.map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {agentNames.get(a.slug) ?? a.name ?? a.slug} ({a.slug})
                        </option>
                      ))}
                    </select>
                    <GoldButton style={{ padding: '8px 16px' }}>Add</GoldButton>
                  </form>
                </Card>
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
