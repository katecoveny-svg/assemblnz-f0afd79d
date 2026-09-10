'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  CraftScroll,
  HoursBackPricing,
  ObserveAdviseAct,
} from '@/components/agent-app';
import { EnsembleBrandBoard } from '@/components/ensemble/EnsembleBrandBoard';
import { EnsembleBriefDesk } from '@/components/ensemble/EnsembleBriefDesk';
import { EnsembleClaimPins } from '@/components/ensemble/EnsembleClaimPins';
import { EnsembleCreativeDesk } from '@/components/ensemble/EnsembleCreativeDesk';
import { EnsemblePreviewChat } from '@/components/ensemble/EnsemblePreviewChat';
import {
  ENSEMBLE_PREVIEW,
  ENSEMBLE_STUDIO_LINKS,
} from '@/lib/ensemble/preview-copy';
import '@/components/agent-app/agent-app-craft.css';
import '@/components/ensemble/ensemble-creative-craft.css';

const AA_TOKEN_STYLE = {
  // Mirror agent-app tokens so ObserveAdviseAct / chat / pricing inherit.
  ['--aa-plum']: '#240b21',
  ['--aa-muted']: '#654a4e',
  ['--aa-rose']: '#916a70',
  ['--aa-chalk']: '#f5f1f2',
  ['--aa-paper']: '#fffdfb',
  ['--aa-ink']: '#240b21',
  ['--aa-ink-soft']: 'rgba(36, 11, 33, 0.68)',
  ['--aa-line']: 'rgba(36, 11, 33, 0.12)',
  ['--aa-line-strong']: 'rgba(36, 11, 33, 0.28)',
  // Neutralise inherited engineering grid on shared .aa-root class.
  ['--aa-grid']: 'transparent',
} as CSSProperties;

/**
 * Ensemble creative front door — CreativeWorkspace DNA on plum/paper craft.
 * No BlueprintScene / PlanPins / floor plates (Arc keeps that factory kit).
 * Mobile-first: claims live on the artefact, not an architecture pin sheet.
 */
export function EnsembleLanding() {
  const c = ENSEMBLE_PREVIEW;

  return (
    <div
      className="ens-root aa-root"
      data-craft="creative-desk"
      style={AA_TOKEN_STYLE}
    >
      <CraftScroll
        rootSelector=".ens-root"
        revealSelector=".ens-story > section:not(.ens-hero), .ens-footer"
      />

      <header className="ens-nav">
        <Link href="/agents/ensemble" className="ens-nav-brand">
          <strong>{c.brand}</strong>
          <span className="ens-mono">{c.productLine}</span>
        </Link>
        <p className="ens-nav-badge ens-mono">{c.previewBadge}</p>
      </header>

      <main className="ens-story">
        <section className="ens-section ens-hero" aria-label="Ensemble hero">
          <div className="ens-hero-grid">
            <div className="ens-hero-copy">
              <p className="ens-eyebrow ens-mono">{c.productLine}</p>
              <h1>{c.heroLine}</h1>
              <p className="ens-hero-support">{c.heroSupport}</p>
              <div className="ens-cta-row">
                <a className="ens-cta ens-cta-primary" href="#ensemble-assemble">
                  {c.ctaAssemble}
                </a>
                <a className="ens-cta ens-cta-ghost" href="#ensemble-claims">
                  {c.ctaClaims}
                </a>
              </div>
              <div className="ens-cta-row ens-cta-row-share" aria-label="Make and share">
                <a className="ens-cta ens-cta-share" href={c.makeHref}>
                  {c.ctaMakeSomething}
                </a>
                <a className="ens-cta ens-cta-share-ghost" href={c.shareHref}>
                  {c.ctaShareFromGen}
                </a>
              </div>
              <p className="ens-share-hint ens-mono">{c.shareHint}</p>
            </div>

            <aside className="ens-hero-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/generated/creative-agency/anchors/prism-vessel.png"
                alt="Prism DEMO vessel still from the creative desk"
              />
              <p className="ens-hero-stamp ens-mono">sample · DEMO · not live media</p>
            </aside>
          </div>
        </section>

        <section className="ens-section" aria-labelledby="ensemble-assemble-title">
          <div className="ens-section-head">
            <p className="ens-eyebrow ens-mono">{c.assembleEyebrow}</p>
            <h2 id="ensemble-assemble-title">{c.assembleTitle}</h2>
            <p>{c.assembleSupport}</p>
          </div>
          <EnsembleBriefDesk />
        </section>

        <section className="ens-section" aria-labelledby="ensemble-claims-title">
          <div className="ens-section-head">
            <p className="ens-eyebrow ens-mono">{c.claimsEyebrow}</p>
            <h2 id="ensemble-claims-title">{c.claimsTitle}</h2>
            <p>{c.claimsSupport}</p>
          </div>
          <EnsembleClaimPins />
        </section>

        <section className="ens-section" aria-labelledby="ensemble-board-title">
          <div className="ens-section-head">
            <p className="ens-eyebrow ens-mono">{c.boardEyebrow}</p>
            <h2 id="ensemble-board-title">{c.boardTitle}</h2>
            <p>{c.boardSupport}</p>
          </div>
          <EnsembleBrandBoard />
        </section>

        <section className="ens-section" aria-labelledby="ensemble-tools-title">
          <div className="ens-section-head">
            <p className="ens-eyebrow ens-mono">{c.toolsEyebrow}</p>
            <h2 id="ensemble-tools-title">{c.toolsTitle}</h2>
            <p>{c.toolsSupport}</p>
          </div>
          <div className="ens-cta-row ens-tools-share" aria-label="Studio share path">
            <a className="ens-cta ens-cta-share" href={c.makeHref}>
              {c.ctaMakeSomething}
            </a>
            <a className="ens-cta ens-cta-share-ghost" href={c.shareHref}>
              {c.ctaShareFromGen}
            </a>
          </div>
          <p className="ens-share-hint ens-mono ens-tools-share-hint">{c.shareHint}</p>
          <div className="ens-tools">
            {ENSEMBLE_STUDIO_LINKS.map((tool) => (
              <Link key={tool.href} href={tool.href} className="ens-tool">
                <strong>{tool.label}</strong>
                <span className="ens-mono">{tool.note}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="ens-section" aria-labelledby="ensemble-desk-title">
          <div className="ens-section-head">
            <p className="ens-eyebrow ens-mono">{c.workspaceEyebrow}</p>
            <h2 id="ensemble-desk-title">{c.workspaceTitle}</h2>
            <p>{c.workspaceSupport}</p>
          </div>
          <EnsembleCreativeDesk />
        </section>

        <ObserveAdviseAct
          eyebrow={c.narrativeEyebrow}
          title={c.narrativeTitle}
          steps={c.chapters}
          demoBadge={c.demoBadge}
          observeStatus="Observing brand board · draft not ready"
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

      <footer className="ens-footer">
        <p>{c.footerNote}</p>
        <Link href="/">{c.footerWordmark}</Link>
      </footer>
    </div>
  );
}
