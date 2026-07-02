import Link from 'next/link';
import { getReceipts } from '@/lib/admin/data';
import { BODY, C, Empty, MONO, PageHeader, Pill, Table, td, nzDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const HITL_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'neutral'> = {
  final: 'ok',
  reviewed: 'ok',
  pending_review: 'warn',
  rejected: 'bad',
};

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string }>;
}) {
  const { agent } = await searchParams;
  const { rows, available } = await getReceipts(agent ? { agent } : undefined);

  const agents = Array.from(new Set(rows.map((r) => r.agent).filter(Boolean))) as string[];

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Receipts"
        title="Mana Receipts"
        lede="The evidence ledger — a sealed record of how each piece of work was made. Browse by agent and date."
      />

      {!available ? (
        <Empty>
          The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>mana_receipts</code> ledger isn&apos;t live in this
          environment yet. Once agents start sealing work, every receipt — its citations, the four pou, and the human
          review status — lands here.
        </Empty>
      ) : rows.length === 0 ? (
        <Empty>No receipts{agent ? ` for ${agent}` : ''} yet.</Empty>
      ) : (
        <>
          {agents.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              <Link
                href="/admin/receipts"
                style={chip(!agent)}
              >
                All
              </Link>
              {agents.map((a) => (
                <Link key={a} href={`/admin/receipts?agent=${encodeURIComponent(a)}`} style={chip(agent === a)}>
                  {a}
                </Link>
              ))}
            </div>
          )}
          <Table head={['Receipt', 'Agent', 'Domain', 'Issuer', 'Review', 'Sealed']}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12 }}>{r.id.slice(0, 8)}…</td>
                <td style={{ ...td, fontFamily: BODY, fontWeight: 700 }}>{r.agent ?? '—'}</td>
                <td style={{ ...td, fontFamily: BODY, fontSize: 13, color: C.body }}>{r.domain ?? '—'}</td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12, color: C.body }}>{r.issuer ?? '—'}</td>
                <td style={td}>
                  {r.hitl_status ? (
                    <Pill tone={HITL_TONE[r.hitl_status] ?? 'neutral'}>{r.hitl_status.replace('_', ' ')}</Pill>
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>—</span>
                  )}
                </td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.body }}>{nzDate(r.created_at)}</td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </>
  );
}

function chip(active: boolean) {
  return {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: active ? C.ink : C.body,
    background: active ? C.canary : C.cream,
    border: `1px solid ${active ? C.canary : C.hairline}`,
    borderRadius: 999,
    padding: '6px 13px',
    textDecoration: 'none',
  } as const;
}
