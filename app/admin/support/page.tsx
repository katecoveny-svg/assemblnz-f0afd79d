import { getSupportMessages } from '@/lib/admin/data';
import { BODY, C, Empty, MONO, PageHeader, Pill, Table, td, nzDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const { rows, source } = await getSupportMessages();

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Support"
        title="Support"
        lede="Messages coming in from across the site. Read, then reply straight from here."
      />

      {rows.length === 0 ? (
        <Empty>
          No messages yet. Incoming notes land in{' '}
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>lead_inquiries</code> (and tool captures in{' '}
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>hapai_leads</code>).
        </Empty>
      ) : (
        <>
          <p style={{ fontFamily: BODY, color: C.muted, fontSize: 13, margin: '0 0 12px' }}>
            {rows.length} from <code style={{ fontFamily: MONO, fontSize: 12 }}>{source}</code>
          </p>
          <Table head={['When', 'From', 'Message', 'Source', 'Reply']}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.body, whiteSpace: 'nowrap' }}>
                  {nzDate(r.created_at)}
                </td>
                <td style={td}>
                  <div style={{ fontFamily: BODY, fontWeight: 700, color: C.ink }}>{r.name ?? '—'}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>{r.email ?? '—'}</div>
                </td>
                <td style={{ ...td, fontFamily: BODY, fontSize: 13.5, color: C.body, maxWidth: 360 }}>
                  {r.message ?? <span style={{ color: C.muted }}>—</span>}
                  {r.status && (
                    <div style={{ marginTop: 6 }}>
                      <Pill>{r.status}</Pill>
                    </div>
                  )}
                </td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12, color: C.body }}>{r.source ?? '—'}</td>
                <td style={td}>
                  {r.email ? (
                    <a
                      href={`mailto:${r.email}?subject=${encodeURIComponent('Re: your message to assembl')}`}
                      style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: C.gold, textDecoration: 'none' }}
                    >
                      Reply →
                    </a>
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
