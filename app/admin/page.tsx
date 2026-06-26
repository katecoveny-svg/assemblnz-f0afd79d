import Link from 'next/link';
import { getTodayMetrics, nzd } from '@/lib/admin/data';
import { C, Card, Eyebrow, Grid, PageHeader, Pill, SectionTitle, StatCard, BODY, MONO } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'bad'> = {
  ok: 'ok',
  degraded: 'warn',
  down: 'bad',
};

function num(n: number | null): string {
  return n === null ? '—' : n.toLocaleString('en-NZ');
}

export default async function TodayPage() {
  const m = await getTodayMetrics();

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Today"
        title="Today"
        lede="The marketplace at a glance — the last 24 hours, what needs you, and whether the pipes are flowing."
      />

      <Grid min={210}>
        <StatCard label="Signups · 24h" value={num(m.signups24h)} href="/admin/users" hint="New accounts" />
        <StatCard label="Installs · 24h" value={num(m.installs24h)} href="/admin/agents" hint="Agents added by users" />
        <StatCard
          label="MRR · est."
          value={nzd(m.mrrEstimate)}
          href="/admin/billing"
          hint="Flat $15/agent install"
        />
        <StatCard
          label="Open support"
          value={num(m.openSupport)}
          href="/admin/support"
          tone={m.openSupport && m.openSupport > 0 ? 'warn' : undefined}
          hint="New messages · 24h"
        />
        <StatCard
          label="Pilot queue"
          value={m.pilotQueue === null ? '0' : num(m.pilotQueue)}
          href="/admin/pilot"
          tone={m.pilotQueue && m.pilotQueue > 0 ? 'warn' : undefined}
          hint="User-built agents to review"
        />
        <StatCard
          label="System health"
          value={m.health.status === 'unknown' ? '—' : m.health.status.toUpperCase()}
          href="/admin/health"
          tone={STATUS_TONE[m.health.status]}
          hint={m.health.lastRun ? 'Last run noted' : 'No recent run'}
        />
      </Grid>

      <SectionTitle>System health</SectionTitle>
      {m.health.brevoBlocked && (
        <Card
          tone="cream"
          style={{ borderColor: '#E5B7AB', background: '#FBEAE5', marginBottom: 14 }}
        >
          <strong style={{ color: '#7A2E1C' }}>Brevo IP blocked.</strong>{' '}
          <span style={{ color: '#7A2E1C', fontFamily: BODY }}>
            The sending IP is off Brevo&apos;s authorised list, so email alerts are not going out. Fix it on the
            Health page.
          </span>
        </Card>
      )}
      <Card>
        {m.health.services.length === 0 ? (
          <p style={{ fontFamily: BODY, color: C.body, margin: 0 }}>
            No health run in the last 24 hours. The health-check cron writes to{' '}
            <code style={{ fontFamily: MONO, fontSize: 12.5 }}>health_check_logs</code> — see the{' '}
            <Link href="/admin/health" style={{ color: C.gold }}>
              Health
            </Link>{' '}
            page.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {m.health.services.map((s) => (
              <Pill key={s.name} tone={s.status === 'ok' ? 'ok' : 'bad'}>
                {s.name} · {s.status === 'ok' ? 'ok' : 'fail'}
              </Pill>
            ))}
          </div>
        )}
      </Card>

      <SectionTitle>Jump in</SectionTitle>
      <Grid min={200}>
        {[
          { href: '/admin/users', label: 'Users', note: 'Tier + level, drill in' },
          { href: '/admin/agents', label: 'Agents', note: 'Catalogue + status' },
          { href: '/admin/pilot', label: 'Pilot', note: 'Review user agents' },
          { href: '/admin/billing', label: 'Billing', note: 'Subs, MRR, churn' },
          { href: '/admin/support', label: 'Support', note: 'Triage + reply' },
          { href: '/admin/receipts', label: 'Receipts', note: 'Mana Receipts ledger' },
        ].map((q) => (
          <Link key={q.href} href={q.href} style={{ textDecoration: 'none' }}>
            <Card style={{ padding: '16px 18px' }}>
              <Eyebrow>{q.note}</Eyebrow>
              <div
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 24,
                  fontWeight: 600,
                  color: C.ink,
                  marginTop: 6,
                }}
              >
                {q.label}
              </div>
            </Card>
          </Link>
        ))}
      </Grid>
    </>
  );
}
