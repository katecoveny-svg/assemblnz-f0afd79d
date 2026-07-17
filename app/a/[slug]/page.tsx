import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveCommunityAgent } from '@/lib/agents/community';
import { IdentityPattern } from '@/components/community/IdentityPattern';
import { CommunityAgentChat } from '@/components/community/CommunityAgentChat';
import { DEFAULT_IDENTITY } from '@/lib/community/templates';

// Service-client read per request (DB slugs); `l~…` slugs rebuild statelessly.
export const dynamic = 'force-dynamic';

const INK = '#313c42';
const MUTED = '#68766f';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await resolveCommunityAgent(slug);
  if (!agent) return { title: 'Community agent · assembl' };
  return {
    title: `${agent.name} · assembl`,
    description: agent.description || 'A community agent made with the assembl agent builder.',
  };
}

export default async function SharedAgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await resolveCommunityAgent(slug);
  if (!agent) notFound();

  const identity = agent.identity ?? DEFAULT_IDENTITY;
  const reportHref = `mailto:assembl@assembl.co.nz?subject=${encodeURIComponent(
    `Report community agent: ${agent.shareSlug}`,
  )}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: INK,
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      {/* Full-bleed pattern signature with the name over it */}
      <header style={{ position: 'relative', height: 'clamp(260px, 38vh, 380px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <IdentityPattern identity={identity} interactive />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.92) 100%)',
          }}
        >
          <div style={{ margin: '0 auto', width: '100%', maxWidth: 860, padding: '0 clamp(20px, 5vw, 40px) 26px' }}>
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(36px, 6vw, 60px)',
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              {agent.name}
            </h1>
          </div>
        </div>
      </header>

      <main style={{ margin: '0 auto', maxWidth: 860, padding: '22px clamp(20px, 5vw, 40px) 90px' }}>
        {agent.description ? (
          <p style={{ margin: 0, maxWidth: 620, color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
            {agent.description}
          </p>
        ) : null}
        <p
          style={{
            margin: '12px 0 0',
            color: MUTED,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Community agent — built by a visitor · drafts only ·{' '}
          <a href={reportHref} style={{ color: MUTED, textDecoration: 'underline' }}>
            report
          </a>
        </p>

        <div style={{ marginTop: 28 }}>
          <CommunityAgentChat slug={agent.shareSlug} name={agent.name} />
        </div>

        <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link
            href={`/a?remix=${encodeURIComponent(agent.shareSlug)}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 24px',
              borderRadius: 999,
              background: INK,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Remix this agent
          </Link>
          <Link
            href="/a"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 24px',
              borderRadius: 999,
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: INK,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Build your own
          </Link>
        </div>
      </main>
    </div>
  );
}
