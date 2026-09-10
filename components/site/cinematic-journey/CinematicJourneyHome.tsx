'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { HomeGuidePhone } from '@/components/site/HomeGuidePhone';
import {
  CLOSE,
  FOOTER,
  HEADER_TAG,
  HERO,
  INDUSTRIES,
  LIVE_WAIT,
  NAV,
  STORY,
  WAIT,
  type IndustrySourceStatus,
} from './copy';
import '@/app/active-journey-home.css';
import './cinematic-journey.css';
import './home-phone-device.css';

/** CSS vars HomeGuidePhone / .aj-phone / .hg-* styles expect. */
const PHONE_THEME = {
  '--aj-paper': '#FFFDFB',
  '--aj-chalk': '#F5F1F2',
  '--aj-ink': '#240B21',
  '--aj-plum': '#240B21',
  '--aj-plum-muted': '#654A4E',
  '--aj-rose': '#916A70',
  '--aj-plum-soft': '#654A4E',
} as CSSProperties;

function sourceBadge(status: IndustrySourceStatus) {
  return status === 'live' ? 'live source' : 'DEMO';
}

/**
 * Cinematic homepage PREVIEW — Kate declutter craft pass.
 * The shared watch model and film provide the visual system.
 * Assembl-only product story. Studio + Operator present.
 * PREVIEW ONLY — do not Ready/merge until Kate signs off.
 */
export function CinematicJourneyHome() {
  return (
    <div className="cj">
      <div className="cj-field" aria-hidden="true" />

      <header className="cj-header">
        <Link className="cj-wordmark" href="/" aria-label="assembl home">
          assembl<span>·</span>
        </Link>
        <p className="cj-header-tag">{HEADER_TAG}</p>
        <nav className="cj-header-nav" aria-label="assembl tools">
          <a className="cj-studio" href={NAV.studio.href}>
            {NAV.studio.label}
            <i aria-hidden="true">↗</i>
          </a>
          <Link href={NAV.journeys.href}>
            {NAV.journeys.label}
            <i aria-hidden="true">↗</i>
          </Link>
          <a href={NAV.discuss.href}>
            {NAV.discuss.label}
            <i aria-hidden="true">↗</i>
          </a>
          <a className="cj-operator" href={NAV.operator.href} rel="nofollow">
            {NAV.operator.label}
            <i aria-hidden="true">↗</i>
          </a>
        </nav>
      </header>

      <div className="cj-story">
        <section className="cj-hero" aria-labelledby="cj-hero-title">
          <div className="cj-hero-veil" aria-hidden="true" />
          <div className="cj-hero-copy" data-cj-parallax="hero-copy">
            <p className="cj-kicker">{HERO.kicker}</p>
            <p className="cj-hero-brand">
              {HERO.brand}
              <span>·</span>
            </p>
            <h1 id="cj-hero-title">{HERO.headline}</h1>
            <p className="cj-hero-lede">{HERO.lede}</p>
            <div className="cj-hero-actions">
              <a className="cj-btn" href={HERO.ctaPrimary.href}>
                {HERO.ctaPrimary.label}
                <span>↓</span>
              </a>
              <a className="cj-link" href={HERO.ctaSecondary.href}>
                {HERO.ctaSecondary.label}
              </a>
            </div>
            <p className="cj-hero-proof">{HERO.proofLine}</p>
          </div>
        </section>

        <section className="cj-story-block" aria-labelledby="cj-story-title">
          <p className="cj-kicker">{STORY.kicker}</p>
          <h2 id="cj-story-title">{STORY.title}</h2>
          <p>{STORY.body}</p>
        </section>

        <section className="cj-wait" id="loyalty-wait" aria-labelledby="cj-wait-title">
          <div className="cj-wait-copy">
            <p className="cj-kicker">{WAIT.kicker}</p>
            <h2 id="cj-wait-title">{WAIT.title}</h2>
            <p>{WAIT.body}</p>
            <ul className="cj-wait-points">
              {WAIT.points.map((point) => (
                <li key={point.label}>
                  <b>{point.label}</b>
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cj-wait-media" data-cj-parallax="wait-media">

          </div>
        </section>

        <section className="cj-industries" id="industries" aria-labelledby="cj-industries-title">
          <div className="cj-industries-head">
            <p className="cj-kicker">{INDUSTRIES.kicker}</p>
            <h2 id="cj-industries-title">{INDUSTRIES.title}</h2>
            <p>{INDUSTRIES.body}</p>
          </div>
          <div className="cj-industry-grid">
            {INDUSTRIES.items.map((item) => (
              <article className="cj-industry" key={item.id}>
                <div className="cj-industry-top">
                  <p className="cj-industry-name">{item.name}</p>
                  <p className="cj-industry-vertical">{item.vertical}</p>
                </div>
                <p className="cj-industry-line">{item.line}</p>
                <p className="cj-industry-metaphor">{item.metaphor}</p>
                <ul className="cj-industry-sources" aria-label={`${item.name} sources`}>
                  {item.sources.map((source) => (
                    <li key={source.label}>
                      <div className="cj-source-main">
                        <span className="cj-source-label">{source.label}</span>
                        <span className="cj-source-cite">{source.cite}</span>
                        <span className="cj-source-asof">as of {source.asOf}</span>
                      </div>
                      <em data-status={source.status}>{sourceBadge(source.status)}</em>
                    </li>
                  ))}
                </ul>
                <Link className="cj-industry-link" href={item.href}>
                  Open {item.name}
                  <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="cj-live" id="live-wait" aria-labelledby="cj-live-title">
          <div className="cj-live-copy">
            <p className="cj-kicker">{LIVE_WAIT.kicker}</p>
            <h2 id="cj-live-title">{LIVE_WAIT.title}</h2>
            <p>{LIVE_WAIT.body}</p>
            <p className="cj-permission">
              <b>permission</b>
              Only the context approved for this moment is used. Review or remove it before handoff.
            </p>
          </div>
          <div
            className="cj-live-phone"
            id="live-agent"
            data-lenis-prevent
            style={PHONE_THEME}
          >
            <HomeGuidePhone presentation="device" />
          </div>
        </section>

        <section className="cj-close" aria-labelledby="cj-close-title">
          <p className="cj-kicker">{CLOSE.kicker}</p>
          <h2 id="cj-close-title">{CLOSE.title}</h2>
          <p>{CLOSE.body}</p>
          <div className="cj-close-actions">
            <a className="cj-btn" href={CLOSE.cta.href}>
              {CLOSE.cta.label}
              <span>↗</span>
            </a>
            <Link className="cj-link" href={CLOSE.demos.href}>
              {CLOSE.demos.label}
            </Link>
          </div>
          <small>{CLOSE.tagline}</small>
        </section>
      </div>

      <footer className="cj-footer">
        <Link className="cj-wordmark" href="/">
          assembl<span>·</span>
        </Link>
        <p>{FOOTER.line}</p>
        <nav aria-label="Footer">
          {FOOTER.links.map((link) =>
            link.href.startsWith('mailto:') ||
            link.href.startsWith('/admin') ||
            link.href.startsWith('https://demo.assembl.co.nz') ? (
              <a
                key={link.href}
                href={link.href}
                rel={
                  link.href.startsWith('/admin') || link.href.startsWith('https://demo.assembl.co.nz')
                    ? 'nofollow'
                    : undefined
                }
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </footer>
    </div>
  );
}
