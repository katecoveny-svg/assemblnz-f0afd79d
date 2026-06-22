import type { Metadata } from 'next';
import '../birdie.css';
import { InteractivePlayground } from '@/components/dash/InteractivePlayground';

/**
 * /dash/interactive — the engagement playground from the design handoff
 * ("Dash - Interactive.dc.html"): a scratch-to-reveal reward card and the
 * "Dash Dash" coin-catching mini-game. Sits inside the /dash Birdie chrome.
 * The interactive logic lives in components/dash/InteractivePlayground.tsx.
 *
 * Palette locked: white + canary #FFD42A + charcoal #3a3832.
 */

export const metadata: Metadata = {
  title: 'dash. — make the wait fun',
  description:
    'Scratch to see what you earned, or play Dash Dash and catch coins while you wait. The engagement surfaces behind the Dash reward layer.',
  alternates: { canonical: '/dash/interactive' },
};

export default function DashInteractivePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(120% 80% at 50% 0,#FFF7EC,#F4F1E9)', padding: '56px 24px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', color: '#3a3832' }}>
        <div
          className="bd-mono"
          style={{
            textAlign: 'center',
            marginBottom: 8,
            fontSize: 12,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: '#c79b1f',
          }}
        >
          Dash · interactive
        </div>
        <h1
          style={{
            textAlign: 'center',
            margin: '0 0 44px',
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: '-.03em',
            color: '#3a3832',
          }}
        >
          Make the wait fun.
        </h1>

        <InteractivePlayground />
      </div>
    </div>
  );
}
