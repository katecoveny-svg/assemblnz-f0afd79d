'use client';

import Link from 'next/link';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';
import { ArcCraftScroll } from '@/components/arc/ArcCraftScroll';
import { ArcAssembleStage } from '@/components/arc/ArcAssembleStage';
import { ArcModelDemo } from '@/components/arc/ArcModelDemo';
import { ArcPreviewChat } from '@/components/arc/ArcPreviewChat';
import './arc-landing.css';

export function ArcLanding() {
  const c = ARC_PREVIEW;

  return (
    <div className="arc-root">
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
          <div className="arc-hero-grid">
            <div className="arc-hero-copy">
              <p className="arc-eyebrow arc-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="arc-hero-support">{c.heroSupport}</p>
              <div className="arc-cta-row">
                <a className="arc-cta arc-cta-primary" href="#arc-assemble">
                  {c.ctaAssemble}
                </a>
                <a className="arc-cta arc-cta-ghost" href="#arc-model">
                  {c.ctaPins}
                </a>
              </div>
            </div>

            <aside className="arc-hero-sheet" aria-hidden>
              <div className="arc-title-block arc-mono">
                <div className="arc-title-block-row">
                  <span>CLIENT</span>
                  <strong>sample practice</strong>
                </div>
                <div className="arc-title-block-row">
                  <span>JOB</span>
                  <strong>Harbour terrace</strong>
                </div>
                <div className="arc-title-block-row">
                  <span>AGENT</span>
                  <strong>arc · preview</strong>
                </div>
                <div className="arc-title-block-row">
                  <span>SHEET</span>
                  <strong>cover · paper</strong>
                </div>
              </div>
              <div className="arc-hero-rule" />
              <p className="arc-mono arc-hero-sheet-note">
                engineering sheet · plum accent · DEMO
              </p>
            </aside>
          </div>
        </section>

        <ArcAssembleStage />

        <section className="arc-section" aria-labelledby="arc-model-title">
          <div className="arc-section-head">
            <p className="arc-eyebrow arc-mono">{c.modelEyebrow}</p>
            <h2 id="arc-model-title">{c.modelTitle}</h2>
            <p>{c.modelSupport}</p>
          </div>
          <ArcModelDemo />
        </section>

        <section className="arc-section" aria-labelledby="arc-narrative-title">
          <div className="arc-section-head">
            <p className="arc-eyebrow arc-mono">{c.narrativeEyebrow}</p>
            <h2 id="arc-narrative-title">{c.narrativeTitle}</h2>
          </div>
          <div className="arc-chapters">
            {c.chapters.map((ch) => (
              <article key={ch.id} className="arc-chapter">
                <p className="arc-eyebrow arc-mono">
                  {ch.label} · {ch.title}
                </p>
                <h3>{ch.title}</h3>
                <p>{ch.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="arc-section" aria-labelledby="arc-chat-title">
          <div className="arc-section-head">
            <p className="arc-eyebrow arc-mono">{c.chatEyebrow}</p>
            <h2 id="arc-chat-title">{c.chatTitle}</h2>
            <p>{c.chatSupport}</p>
          </div>
          <ArcPreviewChat />
        </section>

        <section className="arc-section" aria-labelledby="arc-pricing-title" id="arc-pricing">
          <div className="arc-section-head">
            <p className="arc-eyebrow arc-mono">{c.pricingEyebrow}</p>
            <h2 id="arc-pricing-title">{c.pricingTitle}</h2>
            <p>{c.pricingSupport}</p>
          </div>
          <div className="arc-pricing-grid">
            {c.tiers.map((tier) => (
              <article key={tier.name} className="arc-tier">
                <h3>{tier.name}</h3>
                <p className="arc-tier-price">{tier.price}</p>
                <p>{tier.detail}</p>
                <p className="arc-tier-credits arc-mono">{tier.credits}</p>
              </article>
            ))}
          </div>
          <div className="arc-hours">
            <strong>{c.hoursBack}</strong>
            <span>{c.hoursBackNote}</span>
          </div>
        </section>
      </main>

      <footer className="arc-footer">
        <p>{c.footerNote}</p>
        <Link href="/">{c.footerWordmark}</Link>
      </footer>
    </div>
  );
}
