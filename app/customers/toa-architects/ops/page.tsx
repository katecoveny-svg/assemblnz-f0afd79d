import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { PersonalOpener } from '@/components/ops/toa/PersonalOpener';
import { ArcHeroPanel } from '@/components/ops/toa/ArcHeroPanel';
import { SaveTimeMoney } from '@/components/ops/toa/SaveTimeMoney';
import { LiveArcChat } from '@/components/ops/toa/LiveArcChat';
import { ToaWalkthrough } from '@/components/ops/toa/walk/ToaWalkthrough';
import { MondayStrip } from '@/components/ops/toa/MondayStrip';
import { CapabilityGrid } from '@/components/ops/toa/CapabilityGrid';
import { IntegrationsOrbit } from '@/components/ops/toa/IntegrationsOrbit';
import { Flagship16A } from '@/components/ops/toa/Flagship16A';
import { SourcesPanel } from '@/components/ops/toa/SourcesPanel';
import { OsScrollReveal } from '@/components/ops/shared/OsMotion';
import {
  toa16A,
  toaClientUpdates,
  toaConsents,
  toaConsultants,
  toaFeeProposal,
  toaMondayQueue,
  toaOrbitTools,
  toaProducerStatements,
  toaSiteVisit,
} from '@/lib/customers/toa-architects/demo-data';

/**
 * TOA ARCHITECTS × ARC — Nick Dalton's workspace (the surface his magic link
 * lands on). Built for a 90-second read (DIRECTION-LOCKED-2026-07-01):
 *
 *   1. personal opener — the 16A Hubert Henderson hook
 *   2. luminous hero + save time / money
 *   3. ARC chat — live, streaming, front-and-centre (Nick plays here first)
 *   4. drawings, coming to life — the drawing rises into Kate's 16A model
 *   5. this-week / OS story / Monday queue / what ARC does (real outputs)
 *   6. where the answers come from — Tier A/B/C sources + trust legend
 *   7. quiet footer — Mana Receipt, draft-mode, built by assembl · Kate Hudson
 *
 * TOA is a target, not a partner. The ribbon and hero carry the concept
 * framing; nothing claims affiliation. All data is fictional bar the real 16A
 * facts (draft RC + April pre-checks). Draft-only, always.
 */
export default function ToaArchitectsOpsHome() {
  const config = getBrandConfig('toa-architects');
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-8">
      <DemoRibbon />

      {/* 1 — the personal note, then the product hero */}
      <OsScrollReveal>
        <PersonalOpener />
      </OsScrollReveal>
      <OsScrollReveal delay={0.06}>
        <ArcHeroPanel waiting={toaMondayQueue.length} />
      </OsScrollReveal>

      {/* 2 — save time + money */}
      <OsScrollReveal delay={0.04}>
        <SaveTimeMoney />
      </OsScrollReveal>

      {/* 3 — the main event: ARC is live. Ask it anything — it streams a real,
          sourced draft that knows 16A; nothing sends. */}
      <OsScrollReveal>
        <section className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--brand-muted)]">
              ask arc — live
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-[color:var(--brand-ink)]">
              The practice, drafted overnight.
              <br />
              Ask about any of it.
            </h2>
            <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-[color:var(--brand-muted)]">
              ARC reads the Building Code, the unitary plan and Te Aranga, and answers with its
              sources. It drafts the memo, the chase, the RFI list — you approve before anything
              leaves the studio. This is the real agent, not a script.
            </p>
          </div>
          <LiveArcChat />
        </section>
      </OsScrollReveal>

      {/* 4 — the walk-through (the wow): walk 16A while ARC hovers over it */}
      <OsScrollReveal>
        <div className="flex flex-col gap-3">
          <ToaWalkthrough />
          <a
            href="/customers/toa-architects/ops/walk"
            className="self-start rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition hover:opacity-90 hover:-translate-y-0.5"
            style={{ backgroundColor: '#bfa37a', color: '#161516' }}
          >
            open the full-screen walk-through →
          </a>
        </div>
      </OsScrollReveal>

      {/* 5 — this week on 16A · the OS story · the weekend queue · the six jobs */}
      <OsScrollReveal>
        <Flagship16A />
      </OsScrollReveal>
      <OsScrollReveal delay={0.05}>
        <IntegrationsOrbit tools={toaOrbitTools} />
      </OsScrollReveal>
      <OsScrollReveal>
        <MondayStrip queue={toaMondayQueue} />
      </OsScrollReveal>
      <OsScrollReveal>
        <CapabilityGrid
          consents={toaConsents}
          update={toaClientUpdates[0]}
          updatePhotos={[...toa16A.images.renders, toa16A.images.massing]}
          consultants={toaConsultants}
          proposal={toaFeeProposal}
          statements={toaProducerStatements}
          visit={toaSiteVisit}
        />
      </OsScrollReveal>

      {/* 6 — where the answers come from */}
      <OsScrollReveal>
        <SourcesPanel />
      </OsScrollReveal>

      {/* 7 — quiet footer: Mana Receipt, draft-mode, provenance */}
      <footer className="mt-2 flex flex-col gap-2 border-t border-black/10 pt-6 text-[12px] leading-relaxed text-[color:var(--brand-muted)]">
        <p style={{ color: 'var(--brand-ink)' }}>
          <span className="font-semibold" style={{ color: '#8a744f' }}>Mana Receipt.</span>{' '}
          Every ARC draft leaves a plain record — what it did, what it read, what it left for you.
          Nothing is hidden, nothing is automatic. Draft-mode is enforced: nothing sends, lodges,
          or files without your yes.
        </p>
        <p>
          what a TOA × assembl operating system could look like · 16A facts from the draft RC +
          April pre-checks · week-by-week activity and figures are demo · Te Aranga audit held for
          review with mana whenua
        </p>
        <p>
          built by <span style={{ color: '#8a744f' }}>assembl</span> · Kate Hudson ·{' '}
          <a href="mailto:assembl@assembl.co.nz" className="underline decoration-[#bfa37a] underline-offset-2">
            assembl@assembl.co.nz
          </a>
        </p>
      </footer>
    </div>
  );
}
