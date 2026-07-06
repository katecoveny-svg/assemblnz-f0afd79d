import { buildDashboardRows } from '@/lib/admin/agents-dashboard';
import { PageHeader, Grid, StatCard, BODY, C } from '@/components/admin/ui';
import { AgentsDashboardTable } from './AgentsDashboardTable';

export const dynamic = 'force-dynamic';

/**
 * /admin/agents — the single-pane agent dashboard.
 *
 * One row per agent in the fleet: bundle, honest derived status, prompt
 * provenance, Tier A knowledge anchors, live surfaces, last sync. Roster truth
 * is the code registry; wiring facts come live from Supabase
 * (lib/admin/agents-dashboard.ts). Click a row (or Test) for the drilldown
 * with the prompt, sync controls, audit log and a real test chat.
 */
export default async function AgentsDashboardPage() {
  const { rows } = await buildDashboardRows();

  const total = rows.length;
  const live = rows.filter((r) => r.status === 'live').length;
  const chatOnly = rows.filter((r) => r.status === 'chat_only').length;
  const stub = rows.filter((r) => r.status === 'stub').length;
  const missingPrompt = rows.filter((r) => r.promptSource === 'missing').length;
  const needsWiring = total - live;

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Agents"
        title="the fleet, one pane"
        lede="Every agent, its bundle, its wiring and where it lives — with a real test chat one click away. Status is derived, not declared: live means chat plus a linked Tier A source."
      />

      <Grid min={170}>
        <StatCard label="Total agents" value={total} />
        <StatCard label="Live" value={live} tone="ok" />
        <StatCard label="Chat only" value={chatOnly} tone="warn" />
        <StatCard label="Stub / static" value={stub} tone="bad" />
        <StatCard label="Missing prompt" value={missingPrompt} tone={missingPrompt ? 'bad' : 'ok'} />
      </Grid>

      <p style={{ fontFamily: BODY, color: C.body, fontSize: 15, margin: '16px 0 22px' }}>
        <strong style={{ color: C.ink }}>
          {live} of {total} agents are live with grounded citations.
        </strong>{' '}
        {needsWiring} need prompts or knowledge wiring — {chatOnly} chat without a linked Tier A source,{' '}
        {stub} render but don&apos;t chat, and {missingPrompt}{' '}aren&apos;t started.
      </p>

      <AgentsDashboardTable rows={rows} />
    </>
  );
}
