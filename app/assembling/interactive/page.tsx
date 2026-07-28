import type { Metadata } from 'next';
import '../birdie.css';
import { InteractivePlayground } from '@/components/dash/InteractivePlayground';

/**
 * /dash/interactive — the engagement playground from the design handoff
 * ("Dash - Interactive.dc.html"): a scratch-to-reveal reward card and the
 * "Coin Dash" coin-catching mini-game. Sits inside the /assembling Birdie chrome.
 * The interactive logic lives in components/dash/InteractivePlayground.tsx.
 *
 * Palette locked: white + canary #BFA37A + charcoal #3a3832.
 */

export const metadata: Metadata = {
  title: 'Assembling interactive demo · assembl',
  description:
    'A playable demo of the Assembling engagement surfaces — scratch to see what you earned, or play Coin Dash and catch coins while you wait. A taste of the reward layer, not the product itself.',
  alternates: { canonical: '/assembling/interactive' },
  openGraph: {
    title: 'Assembling interactive demo · assembl',
    description:
      'A playable demo of the Assembling engagement surfaces — scratch-to-reveal rewards and the Coin Dash mini-game.',
    type: 'website',
    siteName: 'assembling. by assembl',
    url: '/assembling/interactive',
    locale: 'en_NZ',
    images: [
      {
        url: '/images/dash/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Assembling interactive demo · assembl',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assembling interactive demo · assembl',
    description: 'A playable demo of the Assembling engagement surfaces.',
    images: ['/images/dash/og-image.png'],
  },
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
            color: '#8A6A2E',
          }}
        >
          Assembling · interactive demo
        </div>
        <h1
          style={{
            textAlign: 'center',
            margin: '0 0 14px',
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: '-.03em',
            color: '#3a3832',
          }}
        >
          Make the wait fun.
        </h1>
        <p
          style={{
            textAlign: 'center',
            margin: '0 auto 44px',
            maxWidth: 520,
            fontSize: 16,
            lineHeight: 1.6,
            color: '#56544b',
          }}
        >
          A playground, not the product — a taste of the engagement surfaces Assembling can show in the
          wait. The real reward layer drops into your app in one line.
        </p>

        <InteractivePlayground />
      </div>
    </div>
  );
}
