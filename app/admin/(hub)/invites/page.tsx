import Link from 'next/link';
import type { CSSProperties } from 'react';
import { TENANTS } from '@/lib/customers/tenants';
import { listInvites, type DemoInvite } from '@/lib/demo-invites/server';
import { createInviteAction, reinstateInviteAction, revokeInviteAction } from './actions';
import { CopyLinkButton } from './CopyLinkButton';
import {
  BODY,
  C,
  CanaryButton,
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
  nzDate,
  td,
} from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

/**
 * /admin/invites — demo magic links.
 *
 * One signed link per prospect: /for/[demo]-[recipient]-[token]. The link
 * skips the shared basic-auth gate and lands the recipient in THEIR pilot,
 * greeted by name. Every open is counted; any link revokes instantly.
 * Recipient names live only in demo_invites — never on a public surface.
 */

const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://assembl.co.nz').replace(/\/+$/, '');

const inviteUrl = (slug: string) => `${SITE_ORIGIN}/for/${slug}`;

const input: CSSProperties = {
  padding: '8px 11px',
  fontFamily: BODY,
  fontSize: 13.5,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  boxSizing: 'border-box',
  width: '100%',
};

const smallMono: CSSProperties = { fontFamily: MONO, fontSize: 10.5, color: C.muted };

const ghostButton: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.04em',
  color: C.bad,
  background: 'transparent',
  border: `1px solid ${C.bad}55`,
  borderRadius: 999,
  padding: '4px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export default async function InvitesPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; created?: string; error?: string }>;
}) {
  const { demo: demoFilter, created, error } = await searchParams;

  let invites: DemoInvite[] = [];
  let tableAvailable = true;
  try {
    invites = await listInvites();
  } catch {
    tableAvailable = false;
  }

  const visible = demoFilter ? invites.filter((i) => i.demo === demoFilter) : invites;
  const createdInvite = created ? invites.find((i) => i.slug === created) : undefined;

  const activeCount = invites.filter((i) => !i.revoked_at).length;
  const openedCount = invites.filter((i) => i.open_count > 0).length;

  const demoName = (slug: string) => TENANTS.find((t) => t.slug === slug)?.displayName ?? slug;

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Invites"
        title="demo magic links"
        lede="One signed link per prospect — it skips the shared demo password and lands them in their own branded pilot, greeted by name. Opens are tracked; any link revokes instantly."
      />

      <Grid min={200}>
        <StatCard label="Invites" value={tableAvailable ? invites.length : '—'} hint="demo_invites" />
        <StatCard label="Active" value={tableAvailable ? activeCount : '—'} />
        <StatCard label="Opened" value={tableAvailable ? openedCount : '—'} hint="at least once" />
      </Grid>

      {error && (
        <Card tone="cream" style={{ padding: '14px 20px', marginTop: 14 }}>
          <span style={{ fontFamily: BODY, fontSize: 13.5, color: C.bad }}>
            {error === 'missing-fields'
              ? 'Recipient name and company are both required.'
              : error === 'unknown-demo'
                ? 'Pick one of the registered pilot demos.'
                : 'Could not create that invite — check DEMO_INVITE_SECRET is set and try again.'}
          </span>
        </Card>
      )}

      {createdInvite && (
        <Card style={{ padding: '16px 20px', marginTop: 14, border: `1.5px solid ${C.canary}` }}>
          <Eyebrow style={{ marginBottom: 6 }}>New link minted</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: C.ink, wordBreak: 'break-all' }}>
              {inviteUrl(createdInvite.slug)}
            </span>
            <CopyLinkButton url={inviteUrl(createdInvite.slug)} />
          </div>
          <p style={{ fontFamily: BODY, fontSize: 12.5, color: C.muted, margin: '8px 0 0' }}>
            {createdInvite.recipient_name} · {createdInvite.recipient_company} →{' '}
            {demoName(createdInvite.demo)} demo. Send it to exactly one person — the link is the key.
          </p>
        </Card>
      )}

      <SectionTitle>New invite</SectionTitle>
      <Card style={{ padding: '18px 20px' }}>
        <form
          action={createInviteAction}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            alignItems: 'end',
          }}
        >
          <label>
            <Eyebrow style={{ marginBottom: 5 }}>Demo</Eyebrow>
            <select name="demo" defaultValue="happy-tails" style={input}>
              {TENANTS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Eyebrow style={{ marginBottom: 5 }}>Recipient name</Eyebrow>
            <input name="recipient_name" required placeholder="Liana" style={input} />
          </label>
          <label>
            <Eyebrow style={{ marginBottom: 5 }}>Company</Eyebrow>
            <input name="recipient_company" required placeholder="Happy Tails" style={input} />
          </label>
          <label>
            <Eyebrow style={{ marginBottom: 5 }}>Email (optional)</Eyebrow>
            <input name="recipient_email" type="email" placeholder="liana@…" style={input} />
          </label>
          <label>
            <Eyebrow style={{ marginBottom: 5 }}>Greeting</Eyebrow>
            <select name="greeting_mode" defaultValue="name" style={input}>
              <option value="name">by name — “kia ora Liana”</option>
              <option value="company">by company — “welcome, Happy Tails”</option>
            </select>
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <Eyebrow style={{ marginBottom: 5 }}>Private note (your eyes only)</Eyebrow>
            <input name="notes" placeholder="friend — family pilot intro" style={input} />
          </label>
          <div>
            <CanaryButton>mint link</CanaryButton>
          </div>
        </form>
      </Card>

      <SectionTitle>All invites</SectionTitle>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <FilterPill href="/admin/invites" active={!demoFilter}>
          all
        </FilterPill>
        {TENANTS.map((t) => (
          <FilterPill
            key={t.slug}
            href={`/admin/invites?demo=${t.slug}`}
            active={demoFilter === t.slug}
          >
            {t.displayName}
          </FilterPill>
        ))}
      </div>

      {!tableAvailable ? (
        <Empty>
          demo_invites isn&apos;t live in this environment yet — run migration
          20260702210000_demo_invites.
        </Empty>
      ) : visible.length === 0 ? (
        <Empty>No invites{demoFilter ? ` for ${demoName(demoFilter)}` : ''} yet — mint one above.</Empty>
      ) : (
        <Table
          head={[
            'Recipient',
            'Company',
            'Demo',
            'Created',
            'Opened',
            'Last viewed',
            'Opens',
            'Status',
            '',
          ]}
        >
          {visible.map((i) => {
            const revoked = Boolean(i.revoked_at);
            return (
              <tr key={i.id} style={revoked ? { opacity: 0.55 } : undefined}>
                <td style={td}>
                  <div style={{ fontWeight: 700 }}>{i.recipient_name}</div>
                  <div style={{ ...smallMono, wordBreak: 'break-all' }}>/for/{i.slug}</div>
                  {i.notes && (
                    <div style={{ fontFamily: BODY, fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                      {i.notes}
                    </div>
                  )}
                </td>
                <td style={td}>{i.recipient_company}</td>
                <td style={td}>
                  <Pill tone="canary">{demoName(i.demo)}</Pill>
                </td>
                <td style={{ ...td, ...smallMono }}>{nzDate(i.created_at, false)}</td>
                <td style={td}>
                  <Pill tone={i.open_count > 0 ? 'ok' : 'neutral'}>
                    {i.open_count > 0 ? 'opened' : 'not yet'}
                  </Pill>
                </td>
                <td style={{ ...td, ...smallMono }}>
                  {i.last_opened_at ? nzDate(i.last_opened_at) : '—'}
                </td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5 }}>{i.open_count}</td>
                <td style={td}>
                  <Pill tone={revoked ? 'warn' : 'ok'}>{revoked ? 'revoked' : 'active'}</Pill>
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {!revoked && <CopyLinkButton url={inviteUrl(i.slug)} label="copy" />}
                    <form action={revoked ? reinstateInviteAction : revokeInviteAction}>
                      <input type="hidden" name="slug" value={i.slug} />
                      <button
                        type="submit"
                        style={
                          revoked
                            ? { ...ghostButton, color: C.ok, border: `1px solid ${C.ok}55` }
                            : ghostButton
                        }
                      >
                        {revoked ? 'reinstate' : 'revoke'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.05em',
        color: active ? C.paper : C.body,
        background: active ? C.ink : C.paper,
        border: `1px solid ${active ? C.ink : C.hairline}`,
        borderRadius: 999,
        padding: '5px 13px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Link>
  );
}
