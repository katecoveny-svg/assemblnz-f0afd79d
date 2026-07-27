import type { Metadata } from 'next';
import { CinematicHome } from '@/components/site/cinematic/CinematicHome';
import { HOME_FAQ } from '@/components/site/cinematic/faq';
import './cine.css';

/**
 * assembl.co.nz homepage — Kate's cinematic prototype
 * (~/assembl-3d-gallery, 2026-07-24), ported 1:1 into the app.
 * See components/site/cinematic/CinematicHome.tsx for the port notes.
 */

export const metadata: Metadata = {
  title: 'assembl — agentic customer journeys, assembled | agentic CX for Aotearoa',
  description:
    'assembl designs agentic customer journeys for New Zealand businesses: specialist AI agents that prepare every step of the customer relationship — first enquiry to tenth year — drafting for a named person to approve. Agentic CX, rewarded wait states, and a builder you can walk through.',
  keywords: [
    'agentic customer journeys',
    'agentic CX',
    'agentic customer experience',
    'AI agents New Zealand',
    'customer journey automation NZ',
    'rewarded wait state',
    'assembl',
  ],
  alternates: { canonical: '/' },
};

export default function HomePage() {
  // FAQPage structured data — the exact text the visible #faq section renders.
  // Answer engines lift Q&A pairs almost verbatim; keeping one source in
  // components/site/cinematic/faq.ts stops the two drifting apart.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <CinematicHome />
    </>
  );
}
