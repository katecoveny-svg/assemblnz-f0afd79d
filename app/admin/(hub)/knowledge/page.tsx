import type { CSSProperties } from 'react';
import { daysSince, getKnowledgeAlerts, getKnowledgeSources, isStale } from '@/lib/admin/v2-data';
import { addKnowledgeSource, resolveKnowledgeAlert, updateKnowledgeSource } from './actions';
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
  Table,
  td,
  nzDate,
} from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

/**
 * /admin/knowledge — the Tier A/B/C source registry (migration 20260701090000).
 * Edit tier + ingest cadence, register new sources, and work the steward alert
 * feed (knowledge_alerts). Staleness = never fetched, blocked, or overdue past
 * the source's refresh cadence.
 */

const input: CSSProperties = {
  padding: '8px 11px',
  fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
  fontSize: 13.5,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  boxSizing: 'border-box',
};

const SEVERITY_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'neutral'> = {
  info: 'neutral',
  warning: 'warn',
  critical: 'bad',
};

export default async function KnowledgePage() {
  const [sources, alerts] = await Promise.all([getKnowledgeSources(), getKnowledgeAlerts()]);

  const stale = sources.rows.filter(isStale);
  const blocked = sources.rows.filter((s) => s.blocked);

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Knowledge"
        title="knowledge sources"
        lede="The Tier A/B/C source registry behind every agent's citations. Tune ingest cadence, register sources, and clear steward alerts."
      />

      {!sources.available ? (
        <Empty>
          The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>knowledge_sources</code> registry isn&apos;t live in
          this environment yet — apply migration 20260701090000.
        </Empty>
      ) : (
        <>
          <Grid min={200}>
            <StatCard label="Sources" value={sources.rows.length} />
            <StatCard
              label="Stale"
              value={stale.length}
              tone={stale.length ? 'warn' : 'ok'}
              hint="overdue, never fetched, or blocked"
            />
            <StatCard label="Blocked" value={blocked.length} tone={blocked.length ? 'bad' : 'ok'} />
            <StatCard
              label="Open alerts"
              value={alerts.available ? alerts.rows.length : '—'}
              tone={alerts.available && alerts.rows.length ? 'warn' : undefined}
            />
          </Grid>

          <SectionTitle>Staleness alerts</SectionTitle>
          {!alerts.available ? (
            <Empty>
              The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>knowledge_alerts</code> feed isn&apos;t live in
              this environment yet.
            </Empty>
          ) : alerts.rows.length === 0 ? (
            <Empty>No open alerts — every source is inside its watermark.</Empty>
          ) : (
            <Table head={['Severity', 'Type', 'Source', 'Message', 'Agents affected', 'Raised', '']}>
              {alerts.rows.map((a) => (
                <tr key={a.id}>
                  <td style={td}>
                    <Pill tone={SEVERITY_TONE[a.severity] ?? 'neutral'}>{a.severity}</Pill>
                  </td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 12 }}>{a.alert_type.replace('_', ' ')}</td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 12 }}>{a.source_slug ?? '—'}</td>
                  <td style={{ ...td, fontFamily: BODY, fontSize: 13, color: C.body, maxWidth: 380 }}>{a.message}</td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 12, color: C.body }}>
                    {a.dependent_agents.length ? a.dependent_agents.join(', ') : '—'}
                  </td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 12, color: C.body }}>{nzDate(a.created_at)}</td>
                  <td style={td}>
                    <form action={resolveKnowledgeAlert}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        style={{
                          fontFamily: BODY,
                          fontWeight: 700,
                          fontSize: 12.5,
                          color: C.ok,
                          background: 'transparent',
                          border: `1.5px solid ${C.ok}`,
                          borderRadius: 999,
                          padding: '5px 13px',
                          cursor: 'pointer',
                        }}
                      >
                        Resolve
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </Table>
          )}

          <SectionTitle>Registry</SectionTitle>
          <div style={{ display: 'grid', gap: 12 }}>
            {sources.rows.map((s) => {
              const d = daysSince(s.last_fetched_at);
              const staleHere = isStale(s);
              return (
                <Card key={s.source_slug} style={{ padding: '16px 20px' }}>
                  <form
                    action={updateKnowledgeSource}
                    style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}
                  >
                    <input type="hidden" name="source_slug" value={s.source_slug} />
                    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, color: C.ink }}>
                          {s.source_name}
                        </span>
                        {s.blocked && <Pill tone="bad">blocked</Pill>}
                        {!s.blocked && staleHere && <Pill tone="warn">stale</Pill>}
                        {!s.active && <Pill tone="neutral">inactive</Pill>}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted, marginTop: 4 }}>
                        {s.source_slug} · {s.source_type ?? '—'} ·{' '}
                        {d === null ? 'never fetched' : `fetched ${d}d ago`} · {s.last_status ?? '—'}
                      </div>
                      {s.dependent_agents.length > 0 && (
                        <div style={{ fontFamily: MONO, fontSize: 12, color: C.body, marginTop: 4 }}>
                          agents: {s.dependent_agents.join(', ')}
                        </div>
                      )}
                    </div>
                    <label>
                      <Eyebrow style={{ marginBottom: 5 }}>Tier</Eyebrow>
                      <select name="tier" defaultValue={s.tier} style={{ ...input, width: 70 }}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </label>
                    <label>
                      <Eyebrow style={{ marginBottom: 5 }}>Cadence (days)</Eyebrow>
                      <input
                        name="refresh_cadence_days"
                        type="number"
                        min={1}
                        defaultValue={s.refresh_cadence_days}
                        style={{ ...input, width: 110 }}
                      />
                    </label>
                    <label>
                      <Eyebrow style={{ marginBottom: 5 }}>Stale after (days)</Eyebrow>
                      <input
                        name="staleness_threshold_days"
                        type="number"
                        min={1}
                        defaultValue={s.staleness_threshold_days}
                        style={{ ...input, width: 120 }}
                      />
                    </label>
                    <label>
                      <Eyebrow style={{ marginBottom: 5 }}>Steward</Eyebrow>
                      <input name="steward" defaultValue={s.steward ?? ''} style={{ ...input, width: 170 }} />
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        fontFamily: BODY,
                        fontSize: 13,
                        color: C.body,
                        paddingBottom: 9,
                        cursor: 'pointer',
                      }}
                    >
                      <input type="checkbox" name="active" defaultChecked={s.active} />
                      active
                    </label>
                    <GoldButton style={{ padding: '8px 16px' }}>Save</GoldButton>
                  </form>
                </Card>
              );
            })}
          </div>

          <SectionTitle>Register a source</SectionTitle>
          <Card>
            <form action={addKnowledgeSource} style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <label style={{ flex: '1 1 180px' }}>
                <Eyebrow style={{ marginBottom: 5 }}>Slug</Eyebrow>
                <input name="source_slug" required placeholder="nzta-ruc-guide" style={{ ...input, width: '100%', fontFamily: MONO, fontSize: 12.5 }} />
              </label>
              <label style={{ flex: '2 1 240px' }}>
                <Eyebrow style={{ marginBottom: 5 }}>Name</Eyebrow>
                <input name="source_name" required placeholder="NZTA — Road User Charges guide" style={{ ...input, width: '100%' }} />
              </label>
              <label style={{ flex: '2 1 260px' }}>
                <Eyebrow style={{ marginBottom: 5 }}>URL</Eyebrow>
                <input name="url" type="url" placeholder="https://…" style={{ ...input, width: '100%' }} />
              </label>
              <label>
                <Eyebrow style={{ marginBottom: 5 }}>Tier</Eyebrow>
                <select name="tier" defaultValue="A" style={{ ...input, width: 70 }}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </label>
              <label>
                <Eyebrow style={{ marginBottom: 5 }}>Type</Eyebrow>
                <select name="source_type" defaultValue="scrape" style={{ ...input, width: 100 }}>
                  <option value="scrape">scrape</option>
                  <option value="rss">rss</option>
                  <option value="api">api</option>
                </select>
              </label>
              <label>
                <Eyebrow style={{ marginBottom: 5 }}>Cadence (days)</Eyebrow>
                <input name="refresh_cadence_days" type="number" min={1} defaultValue={7} style={{ ...input, width: 110 }} />
              </label>
              <GoldButton>Register source</GoldButton>
            </form>
          </Card>
        </>
      )}
    </>
  );
}
