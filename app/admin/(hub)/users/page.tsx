import Link from 'next/link';
import { getUsers } from '@/lib/admin/data';
import { BODY, C, Empty, MONO, PageHeader, Pill, Table, td, nzDate } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const ROLES = ['all', 'admin', 'business', 'pro', 'starter', 'free'];

const ROLE_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'canary' | 'neutral'> = {
  admin: 'bad',
  business: 'canary',
  pro: 'ok',
  starter: 'warn',
  free: 'neutral',
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role = 'all' } = await searchParams;
  const users = await getUsers(role);

  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Users"
        title="Users"
        lede="Everyone with an account. Filter by tier, then click through to a profile."
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {ROLES.map((r) => {
          const active = r === role;
          return (
            <Link
              key={r}
              href={r === 'all' ? '/admin/users' : `/admin/users?role=${r}`}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: active ? C.ink : C.body,
                background: active ? C.canary : C.cream,
                border: `1px solid ${active ? C.canary : C.hairline}`,
                borderRadius: 999,
                padding: '6px 13px',
                textDecoration: 'none',
              }}
            >
              {r}
            </Link>
          );
        })}
      </div>

      {users.length === 0 ? (
        <Empty>
          No users to show{role !== 'all' ? ` in the ${role} tier` : ''}. New signups land in the{' '}
          <code style={{ fontFamily: MONO, fontSize: 12.5 }}>profiles</code> table.
        </Empty>
      ) : (
        <>
          <p style={{ fontFamily: BODY, color: C.muted, fontSize: 13, margin: '0 0 12px' }}>
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </p>
          <Table head={['User', 'Tier', 'Agents', 'Joined', '']}>
            {users.map((u) => (
              <tr key={u.user_id}>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: C.ink, fontFamily: BODY }}>{u.name ?? '—'}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>{u.email ?? u.user_id}</div>
                </td>
                <td style={td}>
                  <Pill tone={ROLE_TONE[u.role ?? 'free'] ?? 'neutral'}>{u.role}</Pill>
                </td>
                <td style={{ ...td, fontFamily: MONO }}>{u.installs}</td>
                <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.body }}>
                  {nzDate(u.created_at, false)}
                </td>
                <td style={td}>
                  <Link
                    href={`/admin/users/${u.user_id}`}
                    style={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: C.gold, textDecoration: 'none' }}
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </>
  );
}
