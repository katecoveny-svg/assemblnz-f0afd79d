import Link from 'next/link';
import { searchReceipts } from '@/lib/admin/v2-data';
import { BODY, C, Empty, LinkPill, MONO, PageHeader, Pill, Table, td, nzDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

/**
 * /admin/receipts — searchable Mana Receipts audit log.
 *
 * Free-text search covers agent, domain and issuer; the agent chips narrow to
 * one agent. "Export CSV" streams the current view (same q/agent filters) from
 * /admin/receipts/export — an ensureAdmin()-gated route handler.
 */

const HITL_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'neutral'> = {
  final: 'ok',
  reviewed: 'ok',
  pending_review: 'warn',
  rejected: 'bad',
};

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string; q?: string }>;
}) {
  const { agent, q } = await searchParams;
  const { rows, available } = await searchReceipts({ agent, q });

  const agents = Array.from(new Set(rows.map((r) => r.agent).filter(Boolean))) as string[];
  const exportQs = new URLSearchParams();
  if (q) exportQs.set('q', q);
  if (agent) exportQs.set('agent', agent);
  const exportHref = `/admin/receipts/export${exportQs.size ? `?${exportQs}` : ''}`;

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Receipts"
        title="mana receipts"
        lede="The evidence ledger — a sealed record of how each piece of work was made. Search it, narrow by agent, export the view as CSV."
        actions={available ? <LinkPill href={exportHref}>Export CSV ↓</LinkPill> : undefined}
      />

      {!available ? (
        <Empty>
          The <code style={{ fontFamily: MONO, fontSize: 12.5 }}>mana_receipts</code> ledger isn&apos;t live in this
          environment yet. Once agents start sealing work, every receipt — its citations, the four pou, and the human
          review status — lands here.
        </Empty>
      ) : (
        <>
          <form method="get" action="/admin/receipts" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {agent && <input type="hidden" name="agent" value={agent} />}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search agent, domain or issuer…"
              style={{
                flex: '1 1 280px',
                maxWidth: 420,
                padding: '9px 14px',
                fontFamily: BODY,
                fontSize: 14,
                color: C.ink,
                background: C.paper,
                border: `1px solid ${C.hairline}`,
                borderRadius: 999,
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 13.5,
                color: C.ink,
                background: C.gold,
                border: 'none',
                borderRadius: 999,
                padding: '9px 18px',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
            {(q || agent) && (
              <Link
                href="/admin/receipts"
                style={{ alignSelf: 'center', fontFamily: MONO, fontSize: 12, color: C.body, textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                clear
              </Link>
            )}
          </form>

          {agents.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              <Link href={q ? `/admin/receipts?q=${encodeURIComponent(q)}` : '/admin/receipts'} style={chip(!agent)}>
                All
              </Link>
              {agents.map((a) => {
                const qs = new URLSearchParams();
                qs.set('agent', a);
                if (q) qs.set('q', q);
                return (
                  <Link key={a} href={`/admin/receipts?${qs}`} style={chip(agent === a)}>
                    {a}
                  </Link>
                );
              })}
            </div>
          )}

          {rows.length === 0 ? (
            <Empty>
              No receipts{agent ? ` for ${agent}` : ''}
              {q ? ` matching “${q}”` : ''} yet.
            </Empty>
          ) : (
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
          )}
        </>
      )}
    </>
  );
}

function chip(active: boolean) {
  return {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: active ? C.ink : C.body,
    background: active ? C.gold : C.cream,
    border: `1px solid ${active ? C.gold : C.hairline}`,
    borderRadius: 999,
    padding: '6px 13px',
    textDecoration: 'none',
  } as const;
}
