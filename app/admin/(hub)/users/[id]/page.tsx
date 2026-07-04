import Link from 'next/link';
import { rows } from '@/lib/admin/data';
import { BODY, C, Card, Empty, Grid, MONO, PageHeader, Pill, SectionTitle, StatCard, Table, td, nzDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [profileRows, roleRows, installRows, sessionRows] = await Promise.all([
    rows<any>('profiles', (q) => q.or(`user_id.eq.${id},id.eq.${id}`).limit(1)),
    rows<any>('user_roles', (q) => q.eq('user_id', id)),
    rows<any>('agent_installs', (q) => q.eq('user_id', id).order('installed_at', { ascending: false })),
    rows<any>('agent_chat_sessions', (q) => q.eq('user_id', id).order('updated_at', { ascending: false }).limit(40)),
  ]);

  const profile = profileRows[0];
  const role = roleRows[0]?.role ?? 'free';

  return (
    <>
      <Link href="/admin/users" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', color: C.muted, textDecoration: 'none' }}>
        ← USERS
      </Link>
      <div style={{ height: 10 }} />
      <PageHeader
        eyebrow="Operator hub · User"
        title={profile?.name ?? profile?.email ?? 'User'}
        lede={
          <span style={{ fontFamily: MONO, fontSize: 13 }}>{profile?.email ?? id}</span>
        }
        actions={<Pill tone="gold">{role}</Pill>}
      />

      <Grid min={200}>
        <StatCard label="Agents installed" value={installRows.length} />
        <StatCard label="Chat sessions" value={sessionRows.length} />
        <StatCard label="Joined" value={<span style={{ fontSize: 18 }}>{nzDate(profile?.created_at, false)}</span>} />
      </Grid>

      <SectionTitle>Installed agents</SectionTitle>
      {installRows.length === 0 ? (
        <Empty>No agents installed yet.</Empty>
      ) : (
        <Table head={['Agent', 'Plan', 'Installed']}>
          {installRows.map((r: any) => (
            <tr key={r.id}>
              <td style={{ ...td, fontFamily: BODY, fontWeight: 700 }}>{r.agent_slug ?? r.slug ?? '—'}</td>
              <td style={{ ...td, fontFamily: MONO, fontSize: 12.5 }}>{r.plan ?? '—'}</td>
              <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.body }}>{nzDate(r.installed_at)}</td>
            </tr>
          ))}
        </Table>
      )}

      <SectionTitle>Recent chats</SectionTitle>
      {sessionRows.length === 0 ? (
        <Empty>No chat sessions.</Empty>
      ) : (
        <Card style={{ padding: 0 }}>
          {sessionRows.map((s: any, i: number) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 18px',
                borderTop: i === 0 ? 'none' : `1px solid ${C.hairline}`,
              }}
            >
              <span style={{ fontFamily: BODY, color: C.ink }}>
                {s.title || s.agent_slug || 'Untitled session'}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                {nzDate(s.updated_at ?? s.created_at)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
