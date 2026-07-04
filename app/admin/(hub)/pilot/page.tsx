import { getPilotDrafts } from '@/lib/admin/data';
import { signOffPilotAgent } from './actions';
import { BODY, C, Card, Empty, MONO, PageHeader, Pill, Table, td, nzDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'neutral'> = {
  approved: 'ok',
  pending: 'warn',
  submitted: 'warn',
  review: 'warn',
  rejected: 'bad',
};

function SignOff({ table, id }: { table: string; id: string }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <form action={signOffPilotAgent}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="approved" />
        <button
          type="submit"
          style={{
            fontFamily: BODY, fontWeight: 700, fontSize: 12.5, color: C.ink,
            background: C.gold, border: 'none', borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
          }}
        >
          Sign off
        </button>
      </form>
      <form action={signOffPilotAgent}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="rejected" />
        <button
          type="submit"
          style={{
            fontFamily: BODY, fontWeight: 700, fontSize: 12.5, color: C.body,
            background: C.paper, border: `1.5px solid ${C.hairline}`, borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
          }}
        >
          Reject
        </button>
      </form>
    </div>
  );
}

export default async function PilotPage() {
  const { rows, table } = await getPilotDrafts();
  const pending = rows.filter((r) => ['pending', 'submitted', 'review'].includes((r.status ?? '').toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Pilot"
        title="Pilot"
        lede="Agents people built themselves. Review each one and sign it off — the Mana Receipt step before it can go live."
      />

      {table === null ? (
        <Empty>
          No Pilot submissions table is live in this environment yet. When users start building agents in Pilot, their
          drafts land here for review and Mana Receipt sign-off.
        </Empty>
      ) : rows.length === 0 ? (
        <Empty>Nothing in the queue. User-built agents will appear here when they&apos;re submitted for review.</Empty>
      ) : (
        <>
          <Card tone="cream" style={{ marginBottom: 18, padding: '14px 18px' }}>
            <span style={{ fontFamily: BODY, color: C.body, fontSize: 14 }}>
              <strong style={{ color: C.ink }}>{pending.length}</strong> awaiting review ·{' '}
              <strong style={{ color: C.ink }}>{rows.length}</strong> total
            </span>
          </Card>
          <Table head={['Agent', 'Built by', 'Status', 'Submitted', 'Sign-off']}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ ...td, fontFamily: BODY, fontWeight: 700 }}>{r.name ?? '—'}</td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.body }}>{r.owner ?? '—'}</td>
                <td style={td}>
                  <Pill tone={STATUS_TONE[(r.status ?? '').toLowerCase()] ?? 'neutral'}>{r.status ?? 'unknown'}</Pill>
                </td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.body }}>{nzDate(r.created_at)}</td>
                <td style={td}>
                  {['pending', 'submitted', 'review'].includes((r.status ?? '').toLowerCase()) ? (
                    <SignOff table={table} id={r.id} />
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </>
  );
}
