'use client';

import Link from 'next/link';
import { VerticalShowcase } from '@/components/verticals/VerticalShowcase';
import { VerticalAppTools } from '@/components/verticals/VerticalAppTools';
import { TransportStudy } from '@/components/agent-app/TransportStudy';
import type { CSSProperties } from 'react';
import {
  CraftScroll,
  HoursBackPricing,
  ObserveAdviseAct,
} from '@/components/agent-app';
import { ForgeBayFlags } from '@/components/forge/ForgeBayFlags';
import { ForgeLifecycle } from '@/components/forge/ForgeLifecycle';
import { ForgeMetricsStrip } from '@/components/forge/ForgeMetricsStrip';
import { ForgeOutcomes } from '@/components/forge/ForgeOutcomes';
import { ForgePreviewChat } from '@/components/forge/ForgePreviewChat';
import { DealerContentStudio } from '@/components/forge/DealerContentStudio';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';
import '@/components/agent-app/agent-app-craft.css';
import '@/components/forge/forge-automotive-craft.css';
import '@/components/agent-app/agent-editorial.css';

const AA_TOKEN_STYLE = {
  ['--aa-plum']: '#240b21',
  ['--aa-muted']: '#654a4e',
  ['--aa-rose']: '#916a70',
  ['--aa-chalk']: '#f5f1f2',
  ['--aa-paper']: '#fffdfb',
  ['--aa-ink']: '#240b21',
  ['--aa-ink-soft']: 'rgba(36, 11, 33, 0.68)',
  ['--aa-line']: 'rgba(36, 11, 33, 0.12)',
  ['--aa-line-strong']: 'rgba(36, 11, 33, 0.28)',
  ['--aa-grid']: 'transparent',
} as CSSProperties;

/**
 * Forge PREVIEW — Impel-class automotive operating system craft.
 * Connected journey (research → sale → service → loyalty), not bay-only.
 * No BlueprintScene / PlanPins / architecture floor plate.
 * Honest CTA to live Arataki chat. Homepage `/` untouched.
 */
export function ForgeLanding() {
  const c = FORGE_PREVIEW;

  return (
    <div
      className="frg-root aa-root agent-edition agent-edition-forge"
      data-craft="automotive-os"
      style={AA_TOKEN_STYLE}
    >
      <CraftScroll
        rootSelector=".frg-root"
        revealSelector=".frg-story > section:not(.frg-hero), .frg-footer"
      />

      <header className="frg-nav">
        <Link href="/agents/forge" className="frg-nav-brand">
          <strong>{c.brand}</strong>
          <span className="frg-mono">{c.productLine}</span>
        </Link>
        <p className="frg-nav-badge frg-mono">{c.previewBadge}</p>
      </header>

      <main className="frg-story">
        <section className="frg-section frg-hero" aria-label="Forge hero">
          <div className="frg-hero-stage">
            <div className="frg-hero-copy">
              <p className="frg-brand-signal">{c.brand}</p>
              <p className="frg-eyebrow frg-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="frg-hero-support">{c.heroSupport}</p>
              <div className="frg-cta-row">
                <Link className="frg-cta frg-cta-primary" href={c.aratakiHref}>
                  {c.ctaChat}
                </Link>
                <a className="frg-cta frg-cta-ghost" href="#forge-lifecycle">
                  {c.ctaLifecycle}
                </a>
              </div>
              <a className="dealer-studio-link" href="#forge-content">Open dealership content studio ↗</a>
            </div>

            <TransportStudy agent="forge" />

            <aside className="frg-hero-visual" aria-label="DEMO dealership journey preview">
              <div className="frg-hero-lot">
                <p className="frg-mono frg-hero-lot-label">DEMO journey rail</p>
                <ol className="frg-hero-stages">
                  <li data-on="true">
                    <span className="frg-mono">01</span> Lead
                  </li>
                  <li data-on="true">
                    <span className="frg-mono">02</span> Sale
                  </li>
                  <li data-on="true">
                    <span className="frg-mono">03</span> Service
                  </li>
                  <li>
                    <span className="frg-mono">04</span> Loyalty
                  </li>
                </ol>
                <p className="frg-hero-stamp frg-mono">sample · DEMO · not a live rooftop</p>
              </div>

              <div className="frg-hero-panel">
                <p className="frg-mono">{c.aratakiPanelEyebrow}</p>
                <h2>{c.aratakiPanelTitle}</h2>
                <p>{c.aratakiNote}</p>
                <Link className="frg-cta frg-cta-primary" href={c.aratakiHref}>
                  Open Arataki
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <VerticalShowcase slug="forge" />

        <DealerContentStudio />

        <section className="frg-section frg-section-metrics" aria-labelledby="forge-metrics-title">
          <div className="frg-section-head">
            <p className="frg-eyebrow frg-mono">{c.metricsEyebrow}</p>
            <h2 id="forge-metrics-title">{c.metricsTitle}</h2>
            <p>{c.metricsSupport}</p>
          </div>
          <ForgeMetricsStrip />
        </section>

        <section className="frg-section" aria-labelledby="forge-who-title">
          <div className="frg-section-head">
            <p className="frg-eyebrow frg-mono">{c.whoForEyebrow}</p>
            <h2 id="forge-who-title">{c.whoForTitle}</h2>
            <p>{c.whoForSupport}</p>
          </div>
          <div className="frg-who">
            {c.whoForPoints.map((point) => (
              <article key={point.title} className="frg-who-card">
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="frg-section" aria-labelledby="forge-pillars-title">
          <div className="frg-section-head">
            <p className="frg-eyebrow frg-mono">{c.pillarsEyebrow}</p>
            <h2 id="forge-pillars-title">{c.pillarsTitle}</h2>
            <p>{c.pillarsSupport}</p>
          </div>
          <ForgeOutcomes />
        </section>

        <section className="frg-section" aria-labelledby="forge-life-title">
          <div className="frg-section-head">
            <p className="frg-eyebrow frg-mono">{c.lifecycleEyebrow}</p>
            <h2 id="forge-life-title">{c.lifecycleTitle}</h2>
            <p>{c.lifecycleSupport}</p>
          </div>
          <ForgeLifecycle />
        </section>

        <section className="frg-section" aria-labelledby="forge-bay-title">
          <div className="frg-section-head">
            <p className="frg-eyebrow frg-mono">{c.bayEyebrow}</p>
            <h2 id="forge-bay-title">{c.bayTitle}</h2>
            <p>{c.baySupport}</p>
          </div>
          <ForgeBayFlags />
        </section>

        <ObserveAdviseAct
          eyebrow={c.narrativeEyebrow}
          title={c.narrativeTitle}
          steps={c.chapters}
          demoBadge={c.demoBadge}
          observeStatus="Observing dealership journey · draft not ready"
          approveLabel="Approve draft"
          actLabel="Act"
          actDisabledHint="Act stays locked until you approve the draft."
          actEnabledHint="Approved — Act can run the staged dealership draft."
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

      <footer className="frg-footer">
        <p>{c.footerNote}</p>
        <Link href="/">{c.footerWordmark}</Link>
      </footer>
      <VerticalAppTools slug="forge" />
    </div>
  );
}
