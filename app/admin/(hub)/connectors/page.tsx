import {
  accountOwner,
  listAllConnectedAccounts,
  listConnectedAccounts,
  pipedreamConfig,
  PIPEDREAM_ACTION_MAP,
  type ConnectedAccount,
} from '@/lib/connectors/pipedream';
import { PILOT_CONNECTIONS } from '@/lib/connectors/pilots';
import { BODY, C, Card, Empty, MONO, PageHeader, Pill, SectionTitle, Table, td } from '@/components/admin/ui';
import { MintForm, RowActions, type AppOption } from './ConnectUi';

export const dynamic = 'force-dynamic';

/**
 * /admin/connectors — pilot customer connections.
 *
 * The operator face of Pipedream Connect (PR 5 of the connector arc):
 * mint a hosted Connect link, see what each pilot has connected, revoke.
 * Replaces the raw /api/admin/connect-link JSON as the day-to-day surface.
 * Every mint and revoke writes a mana receipt (issuer `action-path`); the
 * link itself never touches a log line or a receipt.
 */

const ENV_VARS = [
  'PIPEDREAM_CLIENT_ID',
  'PIPEDREAM_CLIENT_SECRET',
  'PIPEDREAM_PROJECT_ID',
  'PIPEDREAM_PROJECT_ENVIRONMENT',
];

const APP_LABELS: Record<string, string> = {
  google_sheets: 'Google Sheets',
  hubspot: 'HubSpot',
};

function appLabel(slug: string): string {
  return APP_LABELS[slug] ?? slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

type Row = {
  externalUserId: string;
  label: string | null;
  accounts: ConnectedAccount[];
  lastConnected: string | null;
};

function lastConnectedOf(accounts: ConnectedAccount[]): string | null {
  const stamps = accounts
    .flatMap((a) => [a.created_at, a.updated_at])
    .filter((s): s is string => !!s)
    .sort();
  return stamps.at(-1) ?? null;
}

function nzDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadRows(): Promise<Row[]> {
  // Known pilots first (exact per-id queries), then anything else Pipedream
  // reports under the project that we didn't already cover.
  const pilotAccounts = await Promise.all(
    PILOT_CONNECTIONS.map((p) => listConnectedAccounts(p.externalUserId).catch(() => [] as ConnectedAccount[])),
  );
  const rows: Row[] = PILOT_CONNECTIONS.map((p, i) => ({
    externalUserId: p.externalUserId,
    label: p.label,
    accounts: pilotAccounts[i],
    lastConnected: lastConnectedOf(pilotAccounts[i]),
  }));

  const known = new Set(rows.map((r) => r.externalUserId));
  const all = await listAllConnectedAccounts().catch(() => [] as ConnectedAccount[]);
  const extras = new Map<string, ConnectedAccount[]>();
  for (const account of all) {
    const owner = accountOwner(account);
    if (!owner || known.has(owner)) continue;
    extras.set(owner, [...(extras.get(owner) ?? []), account]);
  }
  for (const [externalUserId, accounts] of extras) {
    rows.push({ externalUserId, label: null, accounts, lastConnected: lastConnectedOf(accounts) });
  }
  return rows;
}

export default async function ConnectorsPage() {
  const cfg = pipedreamConfig();

  const apps: AppOption[] = [
    ...new Set(Object.values(PIPEDREAM_ACTION_MAP).flatMap((byApp) => Object.keys(byApp))),
  ].map((slug) => ({ slug, label: appLabel(slug) }));

  const rows = cfg ? await loadRows() : [];

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Connectors"
        title="pilot connections"
        lede="Pilot customer connections. Send a Connect link, they authorise on Pipedream's hosted page, you never see credentials."
        actions={
          cfg ? (
            <>
              <Pill tone="gold" style={{ textTransform: 'none' }}>{cfg.projectId}</Pill>
              <Pill tone={cfg.environment === 'production' ? 'ok' : 'warn'}>{cfg.environment}</Pill>
            </>
          ) : (
            <Pill tone="bad">not configured</Pill>
          )
        }
      />

      {!cfg ? (
        <Card tone="cream" style={{ maxWidth: 640 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.bad, marginBottom: 10 }}>
            not configured
          </div>
          <p style={{ fontFamily: BODY, fontSize: 14.5, color: C.body, margin: '0 0 14px' }}>
            Pipedream Connect isn&apos;t configured in this environment, so this page does nothing — honestly. Set
            these in Vercel (all marked sensitive), redeploy, and it comes alive:
          </p>
          <ul style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink, margin: 0, paddingLeft: 20, lineHeight: 2 }}>
            {ENV_VARS.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p style={{ fontFamily: BODY, fontSize: 13, color: C.muted, margin: '14px 0 0' }}>
            Full walkthrough: docs/PIPEDREAM-CONNECT-SETUP.md
          </p>
        </Card>
      ) : (
        <>
          <SectionTitle style={{ marginTop: 0 }}>send a new connect link</SectionTitle>
          <Card style={{ marginBottom: 8 }}>
            <MintForm apps={apps} />
          </Card>

          <SectionTitle>connections</SectionTitle>
          {rows.length === 0 ? (
            <Empty>
              No pilot connections yet. Mint a link above and send it to your first pilot customer — the walkthrough
              lives in <code style={{ fontFamily: MONO, fontSize: 12.5 }}>docs/PIPEDREAM-CONNECT-SETUP.md</code> (section 3).
            </Empty>
          ) : (
            <Table head={['External user id', 'Connected apps', 'Last connected', 'Actions']}>
              {rows.map((row) => (
                <tr key={row.externalUserId}>
                  <td style={td}>
                    <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink }}>{row.externalUserId}</div>
                    {row.label && (
                      <div style={{ fontFamily: BODY, fontSize: 12, color: C.muted, marginTop: 3 }}>{row.label}</div>
                    )}
                  </td>
                  <td style={td}>
                    {row.accounts.length === 0 ? (
                      <span style={{ fontFamily: BODY, fontSize: 13, color: C.muted }}>nothing yet — send a link</span>
                    ) : (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {row.accounts.map((a) => (
                          <Pill key={a.id} tone={a.healthy === false ? 'bad' : 'ok'} style={{ textTransform: 'none' }}>
                            {appLabel(a.app?.name_slug ?? a.app?.name ?? 'unknown')}
                          </Pill>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 12, whiteSpace: 'nowrap' }}>
                    {nzDateTime(row.lastConnected)}
                  </td>
                  <td style={td}>
                    <RowActions externalUserId={row.externalUserId} hasAccounts={row.accounts.length > 0} />
                  </td>
                </tr>
              ))}
            </Table>
          )}

          <p style={{ fontFamily: BODY, fontSize: 12.5, color: C.muted, marginTop: 18, maxWidth: 640 }}>
            Every mint and revoke writes a mana receipt (issuer <code style={{ fontFamily: MONO, fontSize: 12 }}>action-path</code>).
            Email drafts queue on /admin/approvals — nothing sends until you approve, and dispatch stays off until
            ACTION_DISPATCH_ENABLED is deliberately switched on.
          </p>
        </>
      )}
    </>
  );
}
