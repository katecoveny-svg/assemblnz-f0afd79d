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
          Build one agent.<br />Give it one clear job.
        </h1>
        <p style={{ margin: '16px 0 0', maxWidth: 560, color: MUTED, fontSize: 16, lineHeight: 1.6 }}>
          {prefill
            ? 'You are remixing a shared trial. Change the job, voice or visual signature, then create your own version.'
            : 'Name the job, choose how the agent should behave and create a shareable trial. It prepares drafts; it never sends or changes anything.'}
        </p>

        <div style={{ marginTop: 44, paddingTop: 36, borderTop: `1px solid ${HAIRLINE}` }}>
          <AgentComposer prefill={prefill} />
        </div>
      </main>
    </div>
  );
}
