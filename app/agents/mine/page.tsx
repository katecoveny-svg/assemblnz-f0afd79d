import type { Metadata } from 'next';
import Link from 'next/link';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';
import { getOwner, listDrafts, type StoredDraft } from '@/lib/pilot/store';
import { modelLabel } from '@/lib/pilot/models';

// Owner-scoped list — always fresh, never cached across sessions.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My agents · assembl',
  description: 'The agents you built with Pilot — open one and put it to work. Everything it produces stays a draft for you to check.',
  alternates: { canonical: '/agents/mine' },
  robots: { index: false },
};

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

const STATUS_LABELS: Record<StoredDraft['status'], string> = {
  draft: 'Saved',
  submitted: 'Submitted for review',
  published: 'Published',
  archived: 'Archived',
};

function Header({ sub }: { sub?: string }) {
  return (
    <header
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '56px clamp(20px, 5vw, 40px) 44px',
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      <PatternBackdrop
        className="absolute inset-0"
        mode="particles"
        colorRole="accent"
        count={120}
        connectLines
        connectDistance={130}
        glow
        opacity={0.4}
        speed={0.6}
        lazyMount={false}
      />
      <div style={{ position: 'relative', zIndex: 1, margin: '0 auto', maxWidth: 1100 }}>
        <p style={{ margin: 0, color: '#8b7447', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Pilot
        </p>
        <h1
          style={{
            margin: '12px 0 0',
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(38px, 6vw, 64px)',
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            color: INK,
          }}
        >
          My agents
        </h1>
        {sub ? (
          <p style={{ margin: '18px 0 0', maxWidth: 560, color: MUTED, fontSize: 16, lineHeight: 1.6 }}>{sub}</p>
        ) : null}
      </div>
    </header>
  );
}

export default async function MyAgentsPage() {
  const owner = await getOwner();
  const drafts = owner ? await listDrafts() : [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: INK,
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      <Header sub={owner ? undefined : 'Sign in to see the agents you built with Pilot.'} />

      <main style={{ margin: '0 auto', maxWidth: 1100, padding: '40px clamp(20px, 5vw, 40px) 90px' }}>
        {!owner ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <Link
              href={`/login?redirectTo=${encodeURIComponent('/agents/mine')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '15px 24px',
                borderRadius: 999,
                background: INK,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
            <Link
              href="/pilot"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '15px 24px',
                borderRadius: 999,
                border: `1px solid ${HAIRLINE}`,
                color: INK,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Build an agent
            </Link>
          </div>
        ) : drafts.length === 0 ? (
          <div
            style={{
              padding: 'clamp(28px, 5vw, 52px)',
              borderRadius: 24,
              border: `1px solid ${HAIRLINE}`,
              background: 'linear-gradient(135deg, #fbfaf6 0%, #ffffff 62%, #f3f5f3 100%)',
            }}
          >
            <p style={{ margin: 0, fontSize: 17, color: INK }}>No agents yet.</p>
            <p style={{ margin: '10px 0 0', maxWidth: 520, color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
              Pilot turns a real business workflow into a complete agent pack. Your first build is free.
            </p>
            <Link
              href="/pilot"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 24,
                padding: '15px 24px',
                borderRadius: 999,
                background: INK,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Build your agent <span aria-hidden style={{ color: '#c79b1f' }}>●</span>
            </Link>
          </div>
        ) : (
          <>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 18,
              }}
            >
              {drafts.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/agents/mine/${d.id}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      height: '100%',
                      padding: 24,
                      borderRadius: 20,
                      border: `1px solid ${HAIRLINE}`,
                      background: '#fff',
                      color: INK,
                      textDecoration: 'none',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        width: 52,
                        height: 52,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                        background: 'rgba(63, 115, 115, 0.1)',
                      }}
                    >
                      <AgentIcon name={d.icon} className="h-6 w-6" />
                    </span>
                    <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.25 }}>{d.name || 'Untitled agent'}</span>
                    {d.description ? (
                      <span style={{ color: MUTED, fontSize: 14, lineHeight: 1.55 }}>{d.description}</span>
                    ) : null}
                    <span style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: `1px solid ${HAIRLINE}`,
                          color: TEAL,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {STATUS_LABELS[d.status]}
                      </span>
                      <span style={{ color: MUTED, fontSize: 12 }}>{modelLabel(d.modelPreference)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 34 }}>
              <Link href="/pilot" style={{ color: TEAL, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Build another agent →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
