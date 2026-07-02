import { getHealthLogs } from '@/lib/admin/data';
import { BODY, C, Card, Empty, Grid, MONO, PageHeader, Pill, SectionTitle, Table, td, nzDate } from '@/components/admin/ui';

/**
 * Pipeline health — the last 24h of health-check-cron runs (health_check_logs).
 *
 * Rebuilt onto the admin hub chrome: the standalone token gate is gone (the
 * /admin layout gates on ensureAdmin), and the data fetch is shared via
 * lib/admin/data. Brevo IP-allowlist alarm kept front-and-centre.
 */

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'bad'> = { ok: 'ok', degraded: 'warn', down: 'bad' };
const TICK: Record<string, string> = { ok: C.ok, degraded: C.warn, down: C.bad };

export default async function HealthPage() {
  const logs = await getHealthLogs();
  const latest = logs[0];
  const total = logs.length;
  const okRuns = logs.filter((l) => l.overall_status === 'ok').length;
  const uptime = total > 0 ? Math.round((okRuns / total) * 1000) / 10 : null;
  const brevoBlocked = !!latest?.brevo_ip_blocked;
  const timeline = [...logs].reverse();

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Health"
        title="Pipeline health"
        lede={
          latest
            ? `Last 24h · ${total} runs${uptime !== null ? ` · ${uptime}% all-green` : ''} · last run ${nzDate(latest.created_at)}`
            : 'Last 24 hours of health-check runs.'
        }
        actions={latest ? <Pill tone={STATUS_TONE[latest.overall_status] ?? 'warn'}>{latest.overall_status}</Pill> : undefined}
      />

      {brevoBlocked && (
        <Card tone="cream" style={{ borderColor: '#E5B7AB', background: '#FBEAE5', marginBottom: 16 }}>
          <strong style={{ color: '#7A2E1C' }}>Brevo IP blocked.</strong>{' '}
          <span style={{ color: '#7A2E1C', fontFamily: BODY }}>
            The sending IP is not on Brevo&apos;s authorised-IP list, so email alerts are NOT going out. Add this
            server&apos;s egress IP at Brevo → Senders &amp; IPs → Authorised IPs.
          </span>
        </Card>
      )}

      {!latest ? (
        <Empty>
          No health runs in the last 24 hours. The health-check cron writes to{' '}
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>health_check_logs</code> — once it runs, services show here.
        </Empty>
      ) : (
        <>
          <SectionTitle style={{ marginTop: 8 }}>Services now</SectionTitle>
          <Grid min={220}>
            {(latest.checks ?? []).map((c) => (
              <Card
                key={c.name}
                style={{ borderLeft: `4px solid ${c.status === 'ok' ? C.ok : C.bad}`, padding: '14px 16px' }}
              >
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.ink }}>{c.name}</div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: c.status === 'ok' ? C.ok : C.bad,
                    marginTop: 6,
                  }}
                >
                  {c.status === 'ok' ? 'OK' : 'FAIL'} · {c.response_time_ms}ms
                </div>
                {c.error_message && (
                  <div style={{ fontFamily: BODY, fontSize: 12, color: C.bad, marginTop: 8, lineHeight: 1.4, wordBreak: 'break-word' }}>
                    {c.error_message}
                  </div>
                )}
              </Card>
            ))}
          </Grid>

          <SectionTitle>Last 24h</SectionTitle>
          <Card style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {timeline.map((l) => (
                <span
                  key={l.id}
                  title={`${nzDate(l.created_at)} — ${l.overall_status}${l.failures ? ` (${l.failures} fail)` : ''}`}
                  style={{ width: 10, height: 20, borderRadius: 2, background: TICK[l.overall_status] ?? C.muted }}
                />
              ))}
            </div>
          </Card>

          <SectionTitle>Recent runs</SectionTitle>
          <Table head={['When', 'Status', 'Fails', 'Brevo IP', 'Webhook', 'Email', 'Duration']}>
            {logs.slice(0, 30).map((l) => (
              <tr key={l.id}>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.body }}>{nzDate(l.created_at)}</td>
                <td style={td}>
                  <Pill tone={STATUS_TONE[l.overall_status] ?? 'warn'}>{l.overall_status}</Pill>
                </td>
                <td style={{ ...td, fontFamily: MONO }}>{l.failures || '—'}</td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: l.brevo_ip_blocked ? C.bad : C.body }}>
                  {l.brevo_ip_blocked ? 'BLOCKED' : 'ok'}
                </td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5 }}>
                  {l.alerted ? (l.webhook_delivered ? 'sent' : '—') : 'n/a'}
                </td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5 }}>
                  {l.alerted ? (l.email_delivered ? 'sent' : '—') : 'n/a'}
                </td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5 }}>{l.duration_ms ?? '—'}ms</td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </>
  );
}
