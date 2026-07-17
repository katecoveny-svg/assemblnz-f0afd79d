import type { Metadata } from 'next';
import { getSharedAgent } from '@/lib/agents/community';
import { AgentComposer, type ComposerPrefill } from '@/components/community/AgentComposer';

// searchParams (?remix=) + a service-client read make this per-request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Build an agent · assembl',
  description:
    'Name it, say what it should handle, pick its pattern. You get a page you can share — everything it writes is a draft.',
};

const INK = '#313c42';
const MUTED = '#68766f';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ remix?: string }>;
}) {
  const { remix } = await searchParams;
  let prefill: ComposerPrefill | null = null;
  if (remix) {
    const source = await getSharedAgent(remix);
    if (source) {
      prefill = {
        name: source.name,
        sentence: source.description,
        tone: source.spec?.tone ?? 'warm',
        identity: source.identity,
      };
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: INK,
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      <main style={{ margin: '0 auto', maxWidth: 960, padding: '72px clamp(20px, 5vw, 40px) 100px' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(38px, 6vw, 64px)',
            fontWeight: 400,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
          }}
        >
          Build an agent. Share it.
        </h1>
        <p style={{ margin: '16px 0 0', maxWidth: 560, color: MUTED, fontSize: 16, lineHeight: 1.6 }}>
          {prefill
            ? 'You are remixing a shared agent — change anything, then create your own.'
            : 'Name it, say what it should handle, pick its pattern. You get a page you can share — everything it writes is a draft.'}
        </p>

        <div style={{ marginTop: 44, paddingTop: 36, borderTop: `1px solid ${HAIRLINE}` }}>
          <AgentComposer prefill={prefill} />
        </div>
      </main>
    </div>
  );
}
