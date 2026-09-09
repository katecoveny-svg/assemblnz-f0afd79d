'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { HomeGuidePhone } from '@/components/site/HomeGuidePhone';
import {
  ASSEMBLY_BEATS,
  CLOSE,
  FOOTER,
  HEADER_TAG,
  HERO,
  LIVE_WAIT,
  LOST_TIME,
  NAV,
  PROOF,
} from './copy';
import { AtmosphereLayer } from './AtmosphereLayer';
import { CinematicMediaSlot } from './CinematicMediaSlot';
import { CraftScroll } from './CraftScroll';
import { CINEMATIC_MEDIA } from './media';
import type { PointerRef, ProgressRef } from './types';
import '@/app/active-journey-home.css';
import './cinematic-journey.css';

const AssemblyScrollCanvas = dynamic(
  () => import('./AssemblyScrollCanvas').then((m) => m.AssemblyScrollCanvas),
  { ssr: false },
);

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

/**
 * Cinematic 3D homepage preview — Assembl-only product story.
 * No named-client / independent-concept panels on home (Kate hard lock).
 * Live agent chat phone restored (HomeGuidePhone → /api/home/agent).
 * PREVIEW ONLY — do not merge to production until Kate signs off.
 */
export function CinematicJourneyHome() {
  const progress = useRef(0) as ProgressRef;
  const pointer = useRef({ x: 0, y: 0 }) as PointerRef;
  const [scenarioId, setScenarioId] = useState<(typeof LIVE_WAIT.scenarios)[number]['id']>('quote');
  const [choice, setChoice] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      // Bias progress toward the assembly chapter (first ~70% of page height).
      progress.current = Math.max(0, Math.min(1, window.scrollY / (max * 0.72)));
    };
    const onPointer = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scenario = LIVE_WAIT.scenarios.find((s) => s.id === scenarioId) ?? LIVE_WAIT.scenarios[0];

  return (
    <div className="cj">
      <CraftScroll />
      <AssemblyScrollCanvas progress={progress} pointer={pointer} />
      <AtmosphereLayer progress={progress} />
      <div className="cj-veil" aria-hidden="true" />

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
          <div className="cj-hero-copy">
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
          <div className="cj-hero-stage" aria-hidden="true">
            <CinematicMediaSlot slot={CINEMATIC_MEDIA.hero} mode="inline" className="cj-hero-media" />
          </div>
        </section>

        <section className="cj-assemble" id="assemble" aria-labelledby="cj-assemble-title">
          <div className="cj-assemble-head">
            <p className="cj-kicker">how a journey assembles</p>
            <h2 id="cj-assemble-title">Five parts lock into one coherent next step.</h2>
          </div>

          <div className="cj-assemble-media" data-cj-parallax="assemble">
            <CinematicMediaSlot slot={CINEMATIC_MEDIA.assemble} mode="inline" />
          </div>

          <div className="cj-beats">
            {ASSEMBLY_BEATS.map((beat, index) => (
              <article className="cj-beat" key={beat.id} id={`beat-${beat.id}`}>
                <div>
                  <p className="cj-beat-n">
                    {beat.n} · {beat.label}
                  </p>
                  <h3>{beat.title}</h3>
                  <p>{beat.body}</p>
                </div>
                {/* Mid still anchors the centre beat until video 9a8c5c81 lands. */}
                {index === 2 ? (
                  <CinematicMediaSlot
                    slot={CINEMATIC_MEDIA.mid}
                    mode="inline"
                    className="cj-beat-media"
                  />
                ) : (
                  <div className="cj-beat-marker" aria-hidden="true">
                    {beat.label}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="cj-lost" aria-labelledby="cj-lost-title">
          <p className="cj-kicker">{LOST_TIME.kicker}</p>
          <h2 id="cj-lost-title">{LOST_TIME.title}</h2>
          <p>{LOST_TIME.body}</p>
          <div className="cj-timeline" aria-label="A passive wait becoming an active customer journey">
            <div className="cj-timeline-row cj-timeline-before">
              {LOST_TIME.before.map((item, index) => (
                <span key={item}>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  {item}
                </span>
              ))}
            </div>
            <div className="cj-timeline-cut">
              <i aria-hidden="true" />
              assembl
              <i aria-hidden="true" />
            </div>
            <div className="cj-timeline-row cj-timeline-after">
              {LOST_TIME.after.map((item, index) => (
                <span key={item}>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <p className="cj-lost-closer">{LOST_TIME.closer}</p>
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
          {/*
            Live agent chat (HomeGuidePhone → POST /api/home/agent).
            data-lenis-prevent keeps CraftScroll/Lenis off nested scroll + input focus.
            id=live-agent matches HomeGuidePhone agent-handoff scroll target.
          */}
          <div
            className="cj-live-phone"
            id="live-agent"
            data-lenis-prevent
            style={PHONE_THEME}
          >
            <HomeGuidePhone />
          </div>
        </section>

        <section className="cj-proof" id="proof" aria-labelledby="cj-proof-title">
          <div className="cj-proof-copy">
            <p className="cj-kicker">{PROOF.kicker}</p>
            <h2 id="cj-proof-title">{PROOF.title}</h2>
            <p>{PROOF.body}</p>
          </div>
          <div className="cj-proof-fold">
            <div className="cj-proof-face">
              <span>{PROOF.customerSees.label}</span>
              <h3>{PROOF.customerSees.title}</h3>
              <ul>
                {PROOF.customerSees.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="cj-proof-spine">
              {PROOF.fold}
              <span aria-hidden="true">→</span>
            </div>
            <div className="cj-proof-face">
              <span>{PROOF.businessMeasures.label}</span>
              <h3>{PROOF.businessMeasures.title}</h3>
              <div className="cj-measures">
                {PROOF.businessMeasures.items.map((item) => (
                  <b key={item}>{item}</b>
                ))}
              </div>
              <small>{PROOF.businessMeasures.note}</small>
            </div>
          </div>
        </section>

        <section className="cj-close" aria-labelledby="cj-close-title">
          <p className="cj-kicker">{CLOSE.kicker}</p>
          <h2 id="cj-close-title">{CLOSE.title}</h2>
          <p>{CLOSE.body}</p>
          <a className="cj-btn" href={CLOSE.cta.href}>
            {CLOSE.cta.label}
            <span>↗</span>
          </a>
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
            link.href.startsWith('mailto:') || link.href.startsWith('/admin') ? (
              <a key={link.href} href={link.href} rel={link.href.startsWith('/admin') ? 'nofollow' : undefined}>
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
