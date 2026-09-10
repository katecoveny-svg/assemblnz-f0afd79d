'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  CraftScroll,
  HoursBackPricing,
  ObserveAdviseAct,
} from '@/components/agent-app';
import { ForgeBayFlags } from '@/components/forge/ForgeBayFlags';
import { ForgePreviewChat } from '@/components/forge/ForgePreviewChat';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';
import '@/components/agent-app/agent-app-craft.css';
import '@/components/forge/forge-automotive-craft.css';

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
 * Forge PREVIEW — automotive service-bay craft one-pager.
 * No BlueprintScene / PlanPins / architecture floor plate.
 * Honest CTA to live Arataki chat. Homepage `/` untouched.
 */
export function ForgeLanding() {
  const c = FORGE_PREVIEW;

  return (
    <div
      className="frg-root aa-root"
      data-craft="automotive-bay"
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
          <div className="frg-hero-grid">
            <div className="frg-hero-copy">
              <p className="frg-eyebrow frg-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="frg-hero-support">{c.heroSupport}</p>
              <div className="frg-cta-row">
                <Link className="frg-cta frg-cta-primary" href={c.aratakiHref}>
                  {c.ctaChat}
                </Link>
                <a className="frg-cta frg-cta-ghost" href="#forge-bay">
                  {c.ctaBay}
                </a>
              </div>
            </div>

            <aside className="frg-hero-panel">
              <p className="frg-mono">Live path</p>
              <h2>Arataki runs the dealership desk</h2>
              <p>{c.aratakiNote}</p>
              <Link className="frg-cta frg-cta-primary" href={c.aratakiHref}>
                Open Arataki
              </Link>
            </aside>
          </div>
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
          observeStatus="Observing service bay · draft not ready"
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

      <footer className="frg-footer">
        <p>{c.footerNote}</p>
        <Link href="/">{c.footerWordmark}</Link>
      </footer>
    </div>
  );
}
