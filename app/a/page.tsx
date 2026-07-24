import type { Metadata } from 'next';
import { resolveCommunityAgent } from '@/lib/agents/community';
import { AgentComposer, type ComposerPrefill } from '@/components/community/AgentComposer';

// searchParams (?remix=) + a service-client read make this per-request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Build one clear agent · assembl',
  description:
    'Give an agent one clear job, choose how it should behave and create a shareable public trial. Everything it prepares stays a draft.',
};

const INK = '#252d31';
const MUTED = '#666d6f';
const HAIRLINE = '#d7d8d3';

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ remix?: string }>;
}) {
  const { remix } = await searchParams;
  let prefill: ComposerPrefill | null = null;
  if (remix) {
    // DB slugs and stateless `l~…` links both remix.
    const source = await resolveCommunityAgent(remix);
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
        background: '#f3f2ed',
        color: INK,
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      <main style={{ margin: '0 auto', maxWidth: 1380, padding: 'clamp(64px, 9vw, 132px) clamp(20px, 5vw, 64px) 120px' }}>
        <p style={{ margin: '0 0 28px', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>
          Agent builder · public trial · drafts only
        </p>
        <h1
          style={{
            margin: 0,
            maxWidth: 1100,
            fontFamily: 'var(--font-body), Inter, Arial, sans-serif',
            fontSize: 'clamp(54px, 8vw, 112px)',
            fontWeight: 600,
            lineHeight: 0.92,
            letterSpacing: '-0.045em',
            textTransform: 'uppercase',
          }}
        >
          Build one agent.<br />Give it one clear job.
        </h1>
        <p style={{ margin: '32px 0 0 auto', maxWidth: 560, color: MUTED, fontSize: 17, lineHeight: 1.7 }}>
          {prefill
            ? 'You are remixing a shared trial. Change the job, voice or visual signature, then create your own version.'
            : 'Name the job, choose how the agent should behave and create a shareable trial. It prepares drafts; it never sends or changes anything.'}
        </p>

        <div style={{ marginTop: 64, paddingTop: 40, borderTop: `1px solid ${HAIRLINE}` }}>
          <AgentComposer prefill={prefill} />
        </div>
      </main>
    </div>
  );
}
