import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { StickyScrollNarrative } from '@/components/StickyScrollNarrative';
import {
  AgentCard,
  CinematicMoment,
  CitationChip,
  EvidencePackPreview,
  HairlineRule,
  HeroPage,
  HeroSignature,
  NumberedChapter,
  PullQuote,
  TextReveal,
  TrustStrip,
} from '@/components/site/canon';
import { KeteCard } from '@/components/site/kete-card';
import { AGENTS } from '@/lib/agents';
import { KETES } from '@/lib/kete';

// Internal design-canon reference page — never index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const narrativeStages = [
  {
    id: 'hunt',
    number: '01',
    title: 'Hunt',
    subtitle: 'Find the signal',
    body: 'Surface the permit, invoice, booking, or record that needs attention first.',
    example: 'Lead found with current proof gap and named owner.',
  },
  {
    id: 'pitch',
    number: '02',
    title: 'Pitch',
    subtitle: 'Draft the move',
    body: 'Prepare the next action with citations and source notes visible before review.',
    example: 'Draft staged, not sent.',
  },
  {
    id: 'ledger',
    number: '03',
    title: 'Ledger',
    subtitle: 'Seal the proof',
    body: 'Close the work with a review trail, citations, and an evidence pack.',
    example: 'Mana seal pending named human sign-off.',
  },
] as const;

export const metadata = {
  title: 'assembl site canon components',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SiteCanonPage() {
  const sampleKete = KETES[0];
  const sampleAgent = AGENTS.find((agent) => agent.kete === sampleKete.slug) ?? AGENTS[0];

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <HeroPage
        signature={<HeroSignature eyebrow="Site canon" />}
        title={
          <TextReveal
            as="span"
            text="Mahi that earns its proof."
            className="block"
          />
        }
        subtitle="A noindex preview of the canonical editorial, evidence, marketplace, and motion components now available to the site."
        actions={
          <Link href="/" className="cta-primary inline-flex h-12 items-center px-6 text-sm">
            Back to home
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        }
        media={
          <EvidencePackPreview
            title="Consent audit pack"
            reviewer="Kate Hudson"
            generatedAt="2026-05-17 07:00 NZT"
            accent={sampleKete.accent}
          />
        }
      />

      <section className="container space-y-20 py-24 lg:py-32">
        <SectionReveal as="section">
          <NumberedChapter number={1} title="Editorial proof language">
            <p>
              The core page grammar is intentionally quiet: chapter numbers, hairlines,
              pull quotes, citations, and evidence previews do the heavy lifting.
            </p>
          </NumberedChapter>
        </SectionReveal>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr]">
          <PullQuote cite="assembl canon">
            Every output should feel like it can be filed, forwarded, or footnoted.
          </PullQuote>
          <div className="space-y-5">
            <HairlineRule />
            <div className="flex flex-wrap gap-2">
              <CitationChip accent={sampleKete.accent}>Privacy Act 2020</CitationChip>
              <CitationChip accent={sampleKete.accent}>Building Act 2004</CitationChip>
              <CitationChip accent={sampleKete.accent}>Named reviewer</CitationChip>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <KeteCard kete={sampleKete} compact />
          <AgentCard agent={sampleAgent} />
        </div>
      </section>

      <CinematicMoment
        eyebrow="Motion background"
        title="The motion is ambient; the message stays still."
        accent={sampleKete.accent}
        media={
          <div
            className="h-full w-full"
            style={{
              background:
                'radial-gradient(circle at 68% 45%, rgba(43,107,87,0.20), transparent 28%), linear-gradient(135deg, rgba(212,168,83,0.16), transparent 45%)',
            }}
          />
        }
      >
        <p>
          Cinematic surfaces are available for launches and proof moments, without hiding
          first paint content or turning the homepage back into a text wall.
        </p>
      </CinematicMoment>

      <StickyScrollNarrative stages={narrativeStages} accent={sampleKete.accent} />
      <TrustStrip
        items={[
          'NZ legislation',
          'Named human review',
          'Evidence pack',
          'Privacy-first governance',
        ]}
      />
    </main>
  );
}
