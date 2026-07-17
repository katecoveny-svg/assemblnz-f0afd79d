import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOwner, getDraft } from '@/lib/pilot/store';
import { modelLabel } from '@/lib/pilot/models';
import { MyAgentChat } from './MyAgentChat';
import { SharePublicPage } from './SharePublicPage';

// Owner-scoped read — RLS means a foreign id resolves as absent.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My agents · assembl',
  robots: { index: false },
};

const INK = '#313c42';
const MUTED = '#68766f';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

export default async function MyAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await getOwner();

  if (!owner) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#fff',
          color: INK,
          fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
        }}
      >
        <main style={{ margin: '0 auto', maxWidth: 640, padding: '90px clamp(20px, 5vw, 40px)' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 400,
              letterSpacing: '-0.03em',
            }}
          >
            My agents
          </h1>
          <p style={{ margin: '16px 0 0', color: MUTED, fontSize: 16, lineHeight: 1.6 }}>
            Sign in to see the agents you built with Pilot.
          </p>
          <Link
            href={`/login?redirectTo=${encodeURIComponent(`/agents/mine/${id}`)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginTop: 26,
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
        </main>
      </div>
    );
  }

  const draft = await getDraft(id);
  if (!draft) notFound();

  const ready = Boolean(draft.pack?.systemPrompt?.trim());
  const tests = (draft.pack?.testCases ?? []).slice(0, 6).map((t) => ({ title: t.title, prompt: t.prompt }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: INK,
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      <main style={{ margin: '0 auto', maxWidth: 860, padding: '48px clamp(20px, 5vw, 40px) 90px' }}>
        <Link href="/agents/mine" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>
          ← My agents
        </Link>
        <div style={{ marginTop: 22, paddingBottom: 26, borderBottom: `1px solid ${HAIRLINE}` }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(34px, 5vw, 54px)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {draft.name || 'Untitled agent'}
          </h1>
          {draft.description ? (
            <p style={{ margin: '14px 0 0', maxWidth: 620, color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
              {draft.description}
            </p>
          ) : null}
          <p style={{ margin: '12px 0 0', color: MUTED, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {modelLabel(draft.modelPreference)} · every reply is a draft for you to check
          </p>
          {ready ? <SharePublicPage agentId={draft.id} /> : null}
        </div>

        {ready ? (
          <MyAgentChat id={draft.id} name={draft.name || 'Your agent'} tests={tests} />
        ) : (
          <div
            style={{
              marginTop: 30,
              padding: 'clamp(24px, 4vw, 40px)',
              borderRadius: 20,
              border: `1px solid ${HAIRLINE}`,
              background: '#fbfaf6',
            }}
          >
            <p style={{ margin: 0, color: INK, fontSize: 16 }}>This agent has no drafted pack yet.</p>
            <Link
              href="/pilot"
              style={{
                display: 'inline-flex',
                marginTop: 18,
                padding: '13px 22px',
                borderRadius: 999,
                background: INK,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Finish it in Pilot
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
