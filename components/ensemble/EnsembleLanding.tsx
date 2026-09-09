'use client';

import Link from 'next/link';
import {
  AGENT_APP_CRAFT,
  BlueprintScene,
  CraftScroll,
  HoursBackPricing,
  ObserveAdviseAct,
  PlanPins,
  TitleBlock,
} from '@/components/agent-app';
import { EnsembleAssembleParts, EnsembleFloorUnderlay } from '@/components/ensemble/EnsemblePlanSvg';
import { EnsemblePreviewChat } from '@/components/ensemble/EnsemblePreviewChat';
import { ENSEMBLE_DEMO_PINS } from '@/lib/ensemble/demo-pins';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';
import '@/components/agent-app/agent-app-craft.css';

export function EnsembleLanding() {
  const c = ENSEMBLE_PREVIEW;

  return (
    <div className="aa-root" data-craft={AGENT_APP_CRAFT.craftAttr}>
      <CraftScroll />

      <header className="aa-nav">
        <Link href="/agents/ensemble" className="aa-nav-brand">
          <strong>{c.brand}</strong>
          <span className="aa-mono">{c.productLine}</span>
        </Link>
        <p className="aa-nav-badge aa-mono">{c.previewBadge}</p>
      </header>

      <main className="aa-story">
        <section className="aa-section aa-hero" aria-label="Ensemble hero">
          <div className="aa-hero-grid">
            <div className="aa-hero-copy">
              <p className="aa-eyebrow aa-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="aa-hero-support">{c.heroSupport}</p>
              <div className="aa-cta-row">
                <a className="aa-cta aa-cta-primary" href="#ensemble-assemble">
                  {c.ctaAssemble}
                </a>
                <a className="aa-cta aa-cta-ghost" href="#ensemble-model">
                  {c.ctaPins}
                </a>
              </div>
            </div>

            <aside className="aa-hero-sheet" aria-hidden>
              <TitleBlock
                fields={[
                  { label: 'CLIENT', value: 'sample studio' },
                  { label: 'SITE', value: 'Harbour campaign floor' },
                  { label: 'AGENT', value: 'ensemble · preview' },
                  { label: 'SHEET', value: 'floor plate · paper' },
                ]}
              />
              <div className="aa-hero-rule" />
              <p className="aa-mono aa-hero-sheet-note">
                Ensemble · creative agent-app preview · concept · demo data · assembl
              </p>
            </aside>
          </div>
        </section>

        <BlueprintScene
          sectionId="ensemble-assemble"
          titleId="ensemble-assemble-title"
          eyebrow={c.assembleEyebrow}
          title={c.assembleTitle}
          support={c.assembleSupport}
          titleBlock={[
            { label: 'PROJECT', value: 'Harbour campaign · DEMO' },
            { label: 'DRAWING', value: 'Studio floor · A1' },
            { label: 'SCALE', value: '1:200' },
            { label: 'REV', value: 'P0 · preview' },
          ]}
          caption="fictional NZ creative studio · sample business · details fictional"
          ariaLabel="DEMO studio floor plate assembling from flat-lay campaign formes"
          gridPatternId="ensemble-eng-grid"
        >
          <EnsembleAssembleParts />
        </BlueprintScene>

        <section className="aa-section" aria-labelledby="ensemble-model-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.modelEyebrow}</p>
            <h2 id="ensemble-model-title">{c.modelTitle}</h2>
            <p>{c.modelSupport}</p>
          </div>
          <PlanPins
            id="ensemble-model"
            pins={ENSEMBLE_DEMO_PINS}
            titleBlock={[
              { label: 'SHEET', value: 'Claims overlay · DEMO' },
              { label: 'CODES', value: 'ASA · FTA 1986' },
              { label: 'STATUS', value: 'staged · not published' },
            ]}
            underlay={<EnsembleFloorUnderlay />}
            caption="studio floor plate · DEMO pins · ASA / Fair Trading citations"
            demoBadge={c.demoBadge}
            evidenceLabel={c.evidenceLabel}
            ariaLabel="DEMO studio floor plate with clickable ASA and Fair Trading pins"
            gridPatternId="ensemble-eng-grid-pins"
          />
        </section>

        <ObserveAdviseAct
          eyebrow={c.narrativeEyebrow}
          title={c.narrativeTitle}
          steps={c.chapters}
          demoBadge={c.demoBadge}
          approveLabel="Approve draft"
          actLabel="Act"
          actDisabledHint="Act stays locked until you approve the draft."
          actEnabledHint="Approved — Act can run the staged campaign draft."
        />

        <section className="aa-section" aria-labelledby="ensemble-chat-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.chatEyebrow}</p>
            <h2 id="ensemble-chat-title">{c.chatTitle}</h2>
            <p>{c.chatSupport}</p>
          </div>
          <EnsemblePreviewChat />
        </section>

        <HoursBackPricing
          sectionId="ensemble-pricing"
          titleId="ensemble-pricing-title"
          eyebrow={c.pricingEyebrow}
          title={c.pricingTitle}
          support={c.pricingSupport}
          tiers={c.tiers}
          hoursBack={c.hoursBack}
          hoursBackNote={c.hoursBackNote}
          meterLabel="Hours-back meter · DEMO"
        />
      </main>

      <footer className="aa-footer">
        <p>{c.footerNote}</p>
        <Link href="/">{c.footerWordmark}</Link>
      </footer>
    </div>
  );
}
