'use client';

import Link from 'next/link';
import {
  AGENT_APP_CRAFT,
  HoursBackPricing,
  ObserveAdviseAct,
  TitleBlock,
} from '@/components/agent-app';
import { ArcAssembleStage } from '@/components/arc/ArcAssembleStage';
import { ArcCraftScroll } from '@/components/arc/ArcCraftScroll';
import { ArcModelDemo } from '@/components/arc/ArcModelDemo';
import { ArcPreviewChat } from '@/components/arc/ArcPreviewChat';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';
import '@/components/agent-app/agent-app-craft.css';

export function ArcLanding() {
  const c = ARC_PREVIEW;

  return (
    <div className="aa-root" data-craft={AGENT_APP_CRAFT.craftAttr}>
      <ArcCraftScroll />

      <header className="aa-nav">
        <Link href="/agents/arc" className="aa-nav-brand">
          <strong>{c.brand}</strong>
          <span className="aa-mono">{c.productLine}</span>
        </Link>
        <p className="aa-nav-badge aa-mono">{c.previewBadge}</p>
      </header>

      <main className="aa-story">
        <section className="aa-section aa-hero" aria-label="Arc hero">
          <div className="aa-hero-grid">
            <div className="aa-hero-copy">
              <p className="aa-eyebrow aa-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="aa-hero-support">{c.heroSupport}</p>
              <div className="aa-cta-row">
                <a className="aa-cta aa-cta-primary" href="#arc-assemble">
                  {c.ctaAssemble}
                </a>
                <a className="aa-cta aa-cta-ghost" href="#arc-model">
                  {c.ctaPins}
                </a>
              </div>
            </div>

            <aside className="aa-hero-sheet" aria-hidden>
              <TitleBlock
                fields={[
                  { label: 'CLIENT', value: 'sample practice' },
                  { label: 'JOB', value: 'Harbour terrace' },
                  { label: 'AGENT', value: 'arc · preview' },
                  { label: 'SHEET', value: 'cover · paper' },
                ]}
              />
              <div className="aa-hero-rule" />
              <p className="aa-mono aa-hero-sheet-note">
                engineering sheet · plum accent · DEMO
              </p>
            </aside>
          </div>
        </section>

        <ArcAssembleStage />

        <section className="aa-section" aria-labelledby="arc-model-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.modelEyebrow}</p>
            <h2 id="arc-model-title">{c.modelTitle}</h2>
            <p>{c.modelSupport}</p>
          </div>
          <ArcModelDemo />
        </section>

        <ObserveAdviseAct
          eyebrow={c.narrativeEyebrow}
          title={c.narrativeTitle}
          steps={c.chapters}
          demoBadge={c.demoBadge}
        />

        <section className="aa-section" aria-labelledby="arc-chat-title">
          <div className="aa-section-head">
            <p className="aa-eyebrow aa-mono">{c.chatEyebrow}</p>
            <h2 id="arc-chat-title">{c.chatTitle}</h2>
            <p>{c.chatSupport}</p>
          </div>
          <ArcPreviewChat />
        </section>

        <HoursBackPricing
          sectionId="arc-pricing"
          titleId="arc-pricing-title"
          eyebrow={c.pricingEyebrow}
          title={c.pricingTitle}
          support={c.pricingSupport}
          tiers={c.tiers}
          hoursBack={c.hoursBack}
          hoursBackNote={c.hoursBackNote}
        />
      </main>

      <footer className="aa-footer">
        <p>{c.footerNote}</p>
        <Link href="/">{c.footerWordmark}</Link>
      </footer>
    </div>
  );
}
