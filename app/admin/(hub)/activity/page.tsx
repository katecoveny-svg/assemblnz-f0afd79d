import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getAgentActivity } from '@/lib/admin/agent-activity';
import { hubToken } from '@/lib/demo-invites/gate';
import {
  BODY,
  C,
  Card,
  Empty,
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
 * /admin/activity — the operator command centre.
 *
 * One screen for "what is every agent doing, and where are all the demos":
 *   · headline totals (live agents, chats logged, actions waiting)
 *   · a launchpad into every pilot workspace + the no-password hub link
 *   · every agent with its recent chat/action activity and last-seen
 *   · a live feed of the most recent receipts (chats + actions)
 *
 * All of it reads the mana_receipts ledger + the tenant/invite registries,
 * so it's the single place the scattered "logs" finally come together.
 */

const DEMO_HOST = 'https://demo.assembl.co.nz';

function issuerLabel(issuer: string | null): string {
  if (issuer === 'action-path') return 'action';
  if (issuer === 'marketplace-chat') return 'chat';
  return issuer ?? '—';
}

const dim: CSSProperties = { color: C.muted, fontSize: 11, fontFamily: MONO };

export default async function ActivityPage() {
  const [data, token] = await Promise.all([getAgentActivity(), hubToken()]);
  const hubLink = token ? `${DEMO_HOST}/demo-pass/${token}` : null;
  const active = data.agents.filter((a) => a.recentChats + a.recentActions > 0);

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Activity"
        title="agent activity"
        lede="Every agent, everything they've done lately, and one-click into every demo. The scattered logs, in one place."
        actions={<Pill tone="ok">{data.agentsLive} live</Pill>}
      />

      <Grid min={170}>
        <StatCard label="Agents live" value={data.agentsLive} tone="ok" />
        <StatCard label="In the roster" value={data.agentsTotal} />
        <StatCard
          label="Receipts logged"
          value={data.totalReceipts ?? '—'}
          tone={data.available ? undefined : 'warn'}
        />
        <StatCard label="Actions waiting" value={data.pendingActions} tone={data.pendingActions ? 'warn' : 'ok'} />
        <StatCard label="Active recently" value={active.length} />
      </Grid>

      {/* ── Demos launchpad ─────────────────────────────────────────── */}
      <SectionTitle>Open a demo</SectionTitle>
      {hubLink ? (
        <Card tone="cream" style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.body, margin: 0 }}>
            <strong>No-password hub link</strong> — opens the whole demo host, every pilot, no login:
          </p>
          <a
            href={hubLink}
            style={{ ...dim, fontSize: 11.5, color: C.ink, wordBreak: 'break-all', display: 'block', marginTop: 6 }}
          >
            {hubLink}
          </a>
        </Card>
      ) : null}
      <Grid min={200}>
        {data.demos.map((d) => (
          <Card key={d.slug} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 14.5, color: C.ink }}>
                {d.displayName}
              </span>
              <Pill tone={d.status === 'pilot' ? 'ok' : 'neutral'}>{d.status}</Pill>
            </div>
            <p style={{ ...dim, marginTop: 4 }}>
              {d.activeInvites} live {d.activeInvites === 1 ? 'link' : 'links'}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <a
                href={`${DEMO_HOST}${d.opsHref}`}
                style={{ fontFamily: BODY, fontSize: 12.5, color: C.ink, textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                open workspace ↗
              </a>
              <Link
                href={`/admin/invites?demo=${d.slug}`}
                style={{ fontFamily: BODY, fontSize: 12.5, color: C.muted, textDecoration: 'none' }}
              >
                links
              </Link>
            </div>
          </Card>
        ))}
      </Grid>

      {/* ── Every agent + recent activity ───────────────────────────── */}
      <SectionTitle>
        Every agent{data.available ? ` · last ${data.window} receipts` : ''}
      </SectionTitle>
      <Table head={['Agent', 'Status', 'Bundle', 'Chats', 'Actions', 'Last active', '']}>
        {data.agents.map((a) => (
          <tr key={a.slug}>
            <td style={{ ...td, fontWeight: 700, color: C.ink }}>{a.name}</td>
            <td style={td}>
              <Pill tone={a.status === 'live' ? 'ok' : a.status === 'coming_soon' ? 'warn' : 'neutral'}>
                {a.status}
              </Pill>
            </td>
            <td style={{ ...td, ...dim }}>{a.bundle ?? '—'}</td>
            <td style={td}>{a.recentChats || '·'}</td>
            <td style={td}>{a.recentActions || '·'}</td>
            <td style={{ ...td, ...dim }}>{a.lastActiveAt ? nzDate(a.lastActiveAt) : '—'}</td>
            <td style={td}>
              <a
                href={`${DEMO_HOST}/agents/${a.slug}/studio`}
                style={{ fontFamily: BODY, fontSize: 12, color: C.muted, textDecoration: 'none' }}
              >
                studio ↗
              </a>
            </td>
          </tr>
        ))}
      </Table>

      {/* ── Recent activity feed ────────────────────────────────────── */}
      <SectionTitle>Recent activity</SectionTitle>
      {data.feed.length === 0 ? (
        <Empty>
          {data.available
            ? 'No receipts yet — activity shows here the moment an agent answers or files an action.'
            : 'The mana_receipts ledger isn’t live in this environment yet.'}
        </Empty>
      ) : (
        <Card style={{ padding: '4px 0' }}>
          {data.feed.map((f, i) => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                padding: '9px 18px',
                borderTop: i === 0 ? 'none' : `1px solid ${C.hairline}`,
              }}
            >
              <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: C.ink, minWidth: 120 }}>
                {f.agent ?? '—'}
              </span>
              <Pill tone={f.issuer === 'action-path' ? 'warn' : 'neutral'}>{issuerLabel(f.issuer)}</Pill>
              {f.stage ? <span style={dim}>{f.stage}</span> : null}
              <span style={{ ...dim, marginLeft: 'auto' }}>{nzDate(f.at)}</span>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
