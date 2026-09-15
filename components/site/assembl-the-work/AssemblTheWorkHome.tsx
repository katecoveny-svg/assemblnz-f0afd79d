'use client';

import Link from 'next/link';
import { AtwCraftScroll } from './AtwCraftScroll';
import { AerialAssembly } from './AerialAssembly';
import { DoIntentInput } from './DoIntentInput';
import {
  COMPARE,
  DO_INPUT,
  FOOTER,
  HERO,
  JOURNEYS,
  LOOP,
  NAV,
  PRODUCTS,
  SIGNALS,
  START,
  STUDIO,
} from './copy';
import './assembl-the-work.css';

/**
 * PREVIEW — commercial architecture homepage.
 * "assembl the work · find it · DO it · show it"
 * Served at /preview/home only. LIVE `/` stays on CinematicJourneyHome.
 */
export function AssemblTheWorkHome() {
  return (
    <div className="atw">
      <AtwCraftScroll />

      <div className="atw-preview-ribbon" role="status">
        <strong>PREVIEW</strong>
        <span>not live · Kate must approve before merge</span>
        <Link href="/">view live homepage →</Link>
      </div>

      <header className="atw-nav">
        <Link className="atw-wordmark" href="/preview/home" aria-label="assembl home preview">
          assembl<span>·</span>
        </Link>
        <nav className="atw-nav-links" aria-label="Primary">
          {NAV.products.map((item) => (
            <Link key={item.label} href={item.href} data-emphasis={item.emphasis ? 'true' : 'false'}>
              {item.label}
            </Link>
          ))}
          {NAV.links.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="atw-nav-cta" href={NAV.cta.href}>
            {NAV.cta.label}
          </Link>
        </nav>
      </header>

      <section className="atw-hero" aria-labelledby="atw-hero-title">
        <div className="atw-hero-atmosphere" aria-hidden="true" />
        <div className="atw-hero-grid">
          <div className="atw-hero-copy">
            <p className="atw-hero-brand">
              {HERO.brand}
              <span>·</span>
            </p>
            <h1 id="atw-hero-title">{HERO.headline}</h1>
            <p className="atw-hero-sub">{HERO.subhead}</p>
            <p className="atw-hero-body">{HERO.body}</p>
            <div className="atw-hero-actions">
              <Link className="atw-btn" href={HERO.ctaPrimary.href}>
                {HERO.ctaPrimary.label}
              </Link>
              <a className="atw-link" href={HERO.ctaSecondary.href}>
                {HERO.ctaSecondary.label}
              </a>
            </div>
            <div className="atw-hero-meta">
              <p className="atw-hero-products">{HERO.productLine}</p>
              <p className="atw-hero-loop">{HERO.loopLine}</p>
            </div>
          </div>
          <AerialAssembly />
        </div>
      </section>

      <section className="atw-section atw-signals" aria-labelledby="atw-signals-title">
        <p className="atw-kicker">{SIGNALS.kicker}</p>
        <h2 id="atw-signals-title">{SIGNALS.title}</h2>
        <p className="atw-lede">{SIGNALS.lede}</p>
        <p className="atw-body">{SIGNALS.body}</p>
        <div className="atw-flow">
          {SIGNALS.flow.map((step) => (
            <div
              key={step.id}
              className="atw-flow-step"
              data-center={step.id === 'assembl' ? 'true' : 'false'}
            >
              <strong>{step.label}</strong>
              <p>{step.examples}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="atw-section atw-products" id="products" aria-labelledby="atw-products-title">
        <p className="atw-kicker">{PRODUCTS.kicker}</p>
        <h2 id="atw-products-title">{PRODUCTS.title}</h2>
        <p className="atw-lede">{PRODUCTS.lede}</p>
        <div className="atw-product-grid">
          {PRODUCTS.items.map((product) => (
            <article
              key={product.id}
              className="atw-product"
              data-hero={'hero' in product && product.hero ? 'true' : 'false'}
            >
              <p className="atw-product-verb">{product.verb}</p>
              <h3>{product.name}</h3>
              <p>{product.body}</p>
              <Link className="atw-link" href={product.href}>
                {product.explore}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="atw-section atw-do-input" id="do-input" aria-labelledby="atw-do-title">
        <p className="atw-kicker">{DO_INPUT.kicker}</p>
        <h2 id="atw-do-title">{DO_INPUT.title}</h2>
        <DoIntentInput />
      </section>

      <section className="atw-section atw-journeys" id="how-it-works" aria-labelledby="atw-journeys-title">
        <p className="atw-kicker">{JOURNEYS.kicker}</p>
        <h2 id="atw-journeys-title">{JOURNEYS.title}</h2>
        <p className="atw-body">{JOURNEYS.body}</p>
        <div className="atw-journey-points">
          {JOURNEYS.points.map((point) => (
            <div key={point.label} className="atw-journey-point">
              <strong>{point.label}</strong>
              <p>{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="atw-studio" aria-labelledby="atw-studio-title">
        <div className="atw-studio-field" aria-hidden="true" />
        <div className="atw-studio-grid">
          <div className="atw-studio-copy">
            <p className="atw-kicker">{STUDIO.kicker}</p>
            <h2 id="atw-studio-title">{STUDIO.title}</h2>
            <p className="atw-body">{STUDIO.body}</p>
            <ul className="atw-studio-chips">
              {STUDIO.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
            <Link className="atw-btn atw-btn-studio" href={STUDIO.cta.href}>
              {STUDIO.cta.label}
            </Link>
          </div>

          <aside className="atw-studio-desk" aria-label="Studio proof desk DEMO">
            <div className="atw-desk-register">
              <span>Studio · DEMO</span>
              <span>register</span>
            </div>
            <div className="atw-desk-backing" aria-hidden="true" />
            <div className="atw-desk-still">
              <p className="atw-desk-sheet-label">direction board</p>
              <ul className="atw-desk-stages">
                <li>
                  <span>01</span>
                  <strong>demonstrator</strong>
                </li>
                <li>
                  <span>02</span>
                  <strong>pitch folio</strong>
                </li>
                <li>
                  <span>03</span>
                  <strong>campaign still</strong>
                </li>
                <li>
                  <span>04</span>
                  <strong>film · 3D</strong>
                </li>
              </ul>
            </div>
            <div className="atw-desk-copy">
              <p className="atw-desk-copy-status">elite creative · Ensemble kinship</p>
              <p>Show the work like it matters.</p>
              <span>crop · critique · ship</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="atw-section atw-loop" aria-labelledby="atw-loop-title">
        <p className="atw-kicker">{LOOP.kicker}</p>
        <h2 id="atw-loop-title">{LOOP.title}</h2>
        <div className="atw-loop-track">
          {LOOP.steps.map((step) => (
            <div key={step.id} className="atw-loop-step">
              <strong>{step.label}</strong>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="atw-section atw-compare" aria-labelledby="atw-compare-title">
        <p className="atw-kicker">{COMPARE.kicker}</p>
        <h2 id="atw-compare-title">{COMPARE.title}</h2>
        <div className="atw-compare-grid">
          {COMPARE.columns.map((col) => (
            <div
              key={col.id}
              className="atw-compare-col"
              data-highlight={'highlight' in col && col.highlight ? 'true' : 'false'}
            >
              <h3>{col.name}</h3>
              <ul>
                {col.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="atw-section atw-start" aria-labelledby="atw-start-title">
        <p className="atw-kicker">{START.kicker}</p>
        <h2 id="atw-start-title">{START.title}</h2>
        <p className="atw-body">{START.body}</p>
        <div className="atw-start-actions">
          <Link className="atw-btn" href={START.primary.href}>
            {START.primary.label}
          </Link>
          <a className="atw-link" href={START.secondary.href}>
            {START.secondary.label}
          </a>
        </div>
        <p className="atw-start-note">{START.note}</p>
      </section>

      <footer className="atw-footer">
        <p>{FOOTER.line}</p>
        <p className="atw-live-note">{FOOTER.liveNote}</p>
      </footer>
    </div>
  );
}
