'use client';

import Link from 'next/link';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';
import { ARC_BLUEPRINT_CRAFT } from '@/lib/agent-app/blueprint-craft';
import { BlueprintField } from '@/components/agent-app/BlueprintField';
import { PinnedSteps } from '@/components/agent-app/PinnedSteps';
import { ArcCraftScroll } from '@/components/arc/ArcCraftScroll';
import { ArcModelDemo } from '@/components/arc/ArcModelDemo';
import { ArcPreviewChat } from '@/components/arc/ArcPreviewChat';
import { ArcDashboard } from '@/components/arc/ArcDashboard';
import './arc-landing.css';

export function ArcLanding() {
  const c = ARC_PREVIEW;
  const craft = ARC_BLUEPRINT_CRAFT;

  return (
    <BlueprintField className="arc-root" as="div">
      <ArcCraftScroll />

      <header className="arc-nav">
        <Link href="/agents/arc" className="arc-nav-brand">
          <strong>{c.brand}</strong>
          <span className="arc-mono">{c.productLine}</span>
        </Link>
        <p className="arc-nav-badge arc-mono">{c.previewBadge}</p>
      </header>

      <main className="arc-story">
        <section className="arc-section arc-hero" aria-label="Arc hero">
          <p className="arc-eyebrow arc-mono">{c.productLine}</p>
          <h1>{c.heroLine}</h1>
          <p className="arc-hero-support">{c.heroSupport}</p>
          <p className="arc-hero-metaphor arc-mono">{c.heroMetaphor}</p>
          <div className="arc-cta-row">
            <a className="arc-cta arc-cta-primary" href="#arc-model">
              See DEMO pins
            </a>
            <a className="arc-cta arc-cta-ghost" href="#arc-chat">
              Ask Arc
            </a>
            <a className="arc-cta arc-cta-ghost" href="#arc-dashboard">
              Open dashboard
            </a>
          </div>
        </section>

        <PinnedSteps
          eyebrow={c.narrativeEyebrow}
          title={c.narrativeTitle}
          steps={craft.steps}
          partsLabel={craft.partsLabel}
        />

        <section className="arc-section" aria-labelledby="arc-model-title">
          <div className="arc-section-head">
            <p className="arc-eyebrow arc-mono">{c.modelEyebrow}</p>
            <h2 id="arc-model-title">{c.modelTitle}</h2>
            <p>{c.modelSupport}</p>
          </div>
          <ArcModelDemo />
        </section>

        <section className="arc-section" aria-labelledby="arc-intool-title" id="arc-intool">
          <div className="arc-section-head">
            <p className="arc-eyebrow arc-mono">{c.inToolEyebrow}</p>
            <h2 id="arc-intool-title">{c.inToolTitle}</h2>
            <p>{c.inToolSupport}</p>
          </div>

          <div className="arc-intool-grid">
            <div>
              <p className="arc-eyebrow arc-mono" style={{ marginBottom: '0.85rem' }}>
                {c.chatEyebrow}
              </p>
              <h3 className="arc-intool-label">{c.chatTitle}</h3>
              <p className="arc-intool-support">{c.chatSupport}</p>
              <ArcPreviewChat compact />
            </div>
            <div>
              <p className="arc-eyebrow arc-mono" style={{ marginBottom: '0.85rem' }}>
                {c.dashboardEyebrow}
              </p>
              <h3 className="arc-intool-label">{c.dashboardTitle}</h3>
              <p className="arc-intool-support">{c.dashboardSupport}</p>
              <ArcDashboard />
            </div>
          </div>
        </section>

        <section className="arc-section" aria-labelledby="arc-pricing-title" id="arc-pricing">
          <div className="arc-section-head">
            <p className="arc-eyebrow arc-mono">{c.pricingEyebrow}</p>
            <h2 id="arc-pricing-title">{c.pricingTitle}</h2>
            <p>{c.pricingSupport}</p>
          </div>
          <div className="arc-pricing-grid">
            {c.tiers.map((tier) => (
              <article key={tier.name} className="arc-tier bp-frame">
                <h3>{tier.name}</h3>
                <p className="arc-tier-price">{tier.price}</p>
                <p>{tier.detail}</p>
                <p className="arc-tier-credits arc-mono">{tier.credits}</p>
              </article>
            ))}
          </div>
          <div className="arc-hours bp-frame-premium">
            <strong>{c.hoursBack}</strong>
            <span>{c.hoursBackNote}</span>
          </div>
        </section>
      </main>

      <footer className="arc-footer">
        <p>{c.footerNote}</p>
        <Link href="/">{c.footerWordmark}</Link>
      </footer>
    </BlueprintField>
  );
}
