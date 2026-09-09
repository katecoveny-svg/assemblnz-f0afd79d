'use client';

import Link from 'next/link';
import {
  BlueprintScene,
  CraftScroll,
  HoursBackPricing,
  ObserveAdviseAct,
  PlanPins,
  TitleBlock,
} from '@/components/agent-app';
import {
  GatewayAssembleParts,
  GatewayEntryUnderlay,
} from '@/components/gateway/GatewayEntryPackSvg';
import { GatewayPreviewChat } from '@/components/gateway/GatewayPreviewChat';
import { GATEWAY_DEMO_PINS } from '@/lib/gateway/demo-pins';
import { GATEWAY_PREVIEW } from '@/lib/gateway/preview-copy';
import '@/components/agent-app/agent-app-craft.css';

export function GatewayLanding() {
  const c = GATEWAY_PREVIEW;

  return (
    <div className="aa-root">
      <CraftScroll />

      <header className="aa-nav">
        <Link href="/agents/customs" className="aa-nav-brand">
          <strong>{c.brand}</strong>
          <span className="aa-mono">{c.productLine}</span>
        </Link>
        <p className="aa-nav-badge aa-mono">{c.previewBadge}</p>
      </header>

      <main className="aa-story">
        <section className="aa-section aa-hero" aria-label="Gateway hero">
          <div className="aa-hero-grid">
            <div className="aa-hero-copy">
              <p className="aa-eyebrow aa-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="aa-hero-support">{c.heroSupport}</p>
              <div className="aa-cta-row">
                <a className="aa-cta aa-cta-primary" href="#gateway-assemble">
                  {c.ctaAssemble}
                </a>
                <a className="aa-cta aa-cta-ghost" href="#gateway-model">
                  {c.ctaPins}
                </a>
              </div>
            </div>

            <aside className="aa-hero-sheet" aria-hidden>
              <TitleBlock
                fields={[
                  { label: 'CLIENT', value: 'sample brokerage' },
                  { label: 'SHIPMENT', value: 'Harbour import · DEMO' },
                  { label: 'AGENTS', value: 'gateway · pikau' },
                  { label: 'PACK', value: 'entry · tariff · clearance' },
                ]}
              />
              <div className="aa-hero-rule" />
              <p className="aa-mono aa-hero-sheet-note">
                clearance pack · plum accent · DEMO · not lodged
              </p>
            </aside>
          </div>
        </section>

        <BlueprintScene
          sectionId="gateway-assemble"
          titleId="gateway-assemble-title"
          eyebrow={c.assembleEyebrow}
          title={c.assembleTitle}
          support={c.assembleSupport}
          titleBlock={[
            { label: 'SHIPMENT', value: 'Harbour import · DEMO' },
            { label: 'PACK', value: 'Invoice · tariff · entry' },
            { label: 'BORDER', value: 'Clearance staged' },
            { label: 'STATUS', value: 'preview · not lodged' },
          ]}
          caption="fictional NZ brokerage · sample business · details fictional"
          ariaLabel="DEMO customs clearance pack assembling from flat-lay entry documents and tariff pins"
          gridPatternId="gateway-entry-grid"
        >
          <GatewayAssembleParts />
        </BlueprintScene>

        <section className="aa-section" aria-labelledby="gateway-model-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.modelEyebrow}</p>
            <h2 id="gateway-model-title">{c.modelTitle}</h2>
            <p>{c.modelSupport}</p>
          </div>
          <PlanPins
            id="gateway-model"
            pins={GATEWAY_DEMO_PINS}
            titleBlock={[
              { label: 'PACK', value: 'Clearance pins · DEMO' },
              { label: 'CODES', value: 'Customs Act · Tariff · Biosecurity' },
              { label: 'STATUS', value: 'staged · not lodged' },
            ]}
            underlay={<GatewayEntryUnderlay />}
            caption="import entry pack · DEMO pins · Customs Act / tariff citations"
            demoBadge={c.demoBadge}
            evidenceLabel={c.evidenceLabel}
            ariaLabel="DEMO customs clearance pack with clickable tariff and border pins"
            gridPatternId="gateway-entry-grid-pins"
            hint="Click a pin on the entry pack"
            listLabel="DEMO clearance pins"
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
          actEnabledHint="Approved — Act can run the staged broker draft."
        />

        <section className="aa-section" aria-labelledby="gateway-chat-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.chatEyebrow}</p>
            <h2 id="gateway-chat-title">{c.chatTitle}</h2>
            <p>{c.chatSupport}</p>
          </div>
          <GatewayPreviewChat />
        </section>

        <HoursBackPricing
          sectionId="gateway-pricing"
          titleId="gateway-pricing-title"
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
