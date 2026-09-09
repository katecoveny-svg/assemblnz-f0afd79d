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
import { ForgeAssembleParts, ForgeFloorUnderlay } from '@/components/forge/ForgePlanSvg';
import { ForgePreviewChat } from '@/components/forge/ForgePreviewChat';
import { FORGE_DEMO_FLAGS } from '@/lib/forge/demo-flags';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';
import '@/components/agent-app/agent-app-craft.css';

/**
 * Forge PREVIEW landing — paper craft kit lineage from Arc #1166 (leave-live).
 * Does not use #1167 plum-field craft. Homepage `/` untouched.
 */
export function ForgeLanding() {
  const c = FORGE_PREVIEW;

  return (
    <div className="aa-root" data-craft={AGENT_APP_CRAFT.craftAttr}>
      <CraftScroll />

      <header className="aa-nav">
        <Link href="/agents/forge" className="aa-nav-brand">
          <strong>{c.brand}</strong>
          <span className="aa-mono">{c.productLine}</span>
        </Link>
        <p className="aa-nav-badge aa-mono">{c.previewBadge}</p>
      </header>

      <main className="aa-story">
        <section className="aa-section aa-hero" aria-label="Forge hero">
          <div className="aa-hero-grid">
            <div className="aa-hero-copy">
              <p className="aa-eyebrow aa-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="aa-hero-support">{c.heroSupport}</p>
              <div className="aa-cta-row">
                <a className="aa-cta aa-cta-primary" href="#forge-assemble">
                  {c.ctaAssemble}
                </a>
                <a className="aa-cta aa-cta-ghost" href="#forge-model">
                  {c.ctaPins}
                </a>
              </div>
            </div>

            <aside className="aa-hero-sheet" aria-hidden>
              <TitleBlock
                fields={[
                  { label: 'CLIENT', value: 'sample dealership' },
                  { label: 'SITE', value: 'Harbour workshop' },
                  { label: 'AGENT', value: 'forge · preview' },
                  { label: 'SHEET', value: 'floor plate · paper' },
                ]}
              />
              <div className="aa-hero-rule" />
              <p className="aa-mono aa-hero-sheet-note">
                concept · demo data · plum accent · DEMO
              </p>
            </aside>
          </div>
        </section>

        <BlueprintScene
          sectionId="forge-assemble"
          titleId="forge-assemble-title"
          eyebrow={c.assembleEyebrow}
          title={c.assembleTitle}
          support={c.assembleSupport}
          titleBlock={[
            { label: 'PROJECT', value: 'Harbour workshop · DEMO' },
            { label: 'DRAWING', value: 'Floor plate · A1' },
            { label: 'SCALE', value: '1:200' },
            { label: 'REV', value: 'P0 · preview' },
          ]}
          caption="fictional NZ dealership · sample business · details fictional"
          ariaLabel="DEMO dealership floor plate assembling from flat-lay service parts"
          gridPatternId="forge-eng-grid"
        >
          <ForgeAssembleParts />
        </BlueprintScene>

        <section className="aa-section" aria-labelledby="forge-model-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.modelEyebrow}</p>
            <h2 id="forge-model-title">{c.modelTitle}</h2>
            <p>{c.modelSupport}</p>
          </div>
          <PlanPins
            id="forge-model"
            pins={FORGE_DEMO_FLAGS}
            titleBlock={[
              { label: 'SHEET', value: 'Flags overlay · DEMO' },
              { label: 'CODES', value: 'NZTA WoF/CoF · CCCFA' },
              { label: 'STATUS', value: 'staged · not lodged' },
            ]}
            underlay={<ForgeFloorUnderlay />}
            caption="dealership floor plate · DEMO flags · NZTA / CCCFA citations"
            demoBadge={c.demoBadge}
            evidenceLabel={c.evidenceLabel}
            ariaLabel="DEMO dealership floor plate with clickable NZTA and CCCFA pins"
            gridPatternId="forge-eng-grid-pins"
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
          actEnabledHint="Approved — Act can run the staged workshop draft."
        />

        <section className="aa-section" aria-labelledby="forge-chat-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.chatEyebrow}</p>
            <h2 id="forge-chat-title">{c.chatTitle}</h2>
            <p>{c.chatSupport}</p>
          </div>
          <ForgePreviewChat />
        </section>

        <HoursBackPricing
          sectionId="forge-pricing"
          titleId="forge-pricing-title"
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
