'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AtwCraftScroll } from './AtwCraftScroll';
import { AerialAssembly } from './AerialAssembly';
import { DoIntentInput } from './DoIntentInput';
import {
  REVIEW,
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

/** The public homepage and its explicitly marked review route. */
export function AssemblTheWorkHome({ preview = false }: { preview?: boolean }) {
  return (
    <div className="atw" data-preview={preview}>
      <AtwCraftScroll />

      {preview && <div className="atw-preview-ribbon" role="status">
        <strong>PREVIEW</strong>
        <span>homepage review route</span>
        <Link href="/">view live homepage →</Link>
      </div>}

      <header className="atw-nav">
        <Link className="atw-wordmark" href="/" aria-label="assembl home">
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
            <p className="atw-hero-brand">{HERO.brand}</p>
            <h1 id="atw-hero-title">{HERO.headline}</h1>
            <p className="atw-hero-sub">{HERO.subhead}</p>
            <p className="atw-hero-body">{HERO.body}</p>
            <p className="atw-hero-explanation">{HERO.explanation}</p>
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

      <section className="atw-section atw-do-input" id="do-input" aria-labelledby="atw-do-title">
        <p className="atw-kicker">{DO_INPUT.kicker}</p>
        <h2 id="atw-do-title">{DO_INPUT.title}</h2>
        <DoIntentInput />
      </section>

      <section className="atw-section atw-signals" aria-labelledby="atw-signals-title">
        <p className="atw-kicker">{SIGNALS.kicker}</p>
        <h2 id="atw-signals-title">{SIGNALS.title}</h2>
        <p className="atw-body">{SIGNALS.body}</p>
        <div className="atw-flow">
          {SIGNALS.flow.map((step) => (
            <div
              key={step.id}
              className="atw-flow-step"
              data-center={step.id === 'output' ? 'true' : 'false'}
            >
              <strong>{step.label}</strong>
              <p>{step.examples}</p>
              <p className="atw-source-note">{step.note}</p>
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
              id={product.id}
              className="atw-product"
              data-hero={'hero' in product && product.hero ? 'true' : 'false'}
            >
              <p className="atw-product-verb">{product.verb}</p>
              <h3>{product.name}</h3>
              <p>{product.body}</p>
              <Link className="atw-link" href={product.href}>
                {product.explore}
              </Link>
              <p className="atw-product-note">{product.note}</p>
            </article>
          ))}
        </div>
      </section>



      <section className="atw-section atw-journeys" id="use-cases" aria-labelledby="atw-journeys-title">
        <p className="atw-kicker">{JOURNEYS.kicker}</p>
        <h2 id="atw-journeys-title">{JOURNEYS.title}</h2>
        <p className="atw-body">{JOURNEYS.body}</p>
        <p className="atw-body atw-journey-value">{JOURNEYS.value}</p>
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
        <div className="atw-studio-inner">
          <p className="atw-kicker">{STUDIO.kicker}</p>
          <h2 id="atw-studio-title">{STUDIO.title}</h2>
          <p className="atw-body">{STUDIO.body}</p>
          <ul className="atw-studio-chips">
            {STUDIO.chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
          <Link className="atw-btn" href={STUDIO.cta.href}>
            {STUDIO.cta.label}
          </Link>
        </div>
        <div className="atw-studio-gallery">
          <figure>
            <Image src="/generated/creative-agency/anchors/prism-skincare.png" alt="Generated skincare campaign concept: glass bottle on a stone plinth" width={1024} height={1024} sizes="(max-width: 700px) 90vw, 35vw" />
            <figcaption><span>Generated concept</span>Product imagery &amp; advertising</figcaption>
          </figure>
          <figure>
            <video controls preload="none" playsInline poster="/cinematic-home/hf-2e5e76fe.png" aria-label="Generated mechanical assembly film study">
              <source src="/cinematic-home/hf-9a8c5c81.mp4" type="video/mp4" />
              <a href="/cinematic-home/hf-9a8c5c81.mp4">View the assembly film study</a>
            </video>
            <figcaption><span>Generated motion study</span>Assembly, film &amp; visual concepts</figcaption>
          </figure>
        </div>
      </section>

      <section className="atw-section atw-loop" id="how-it-works" aria-labelledby="atw-loop-title">
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
        <p className="atw-kicker">{REVIEW.kicker}</p>
        <h2 id="atw-compare-title">{REVIEW.title}</h2>
        <div className="atw-compare-grid">
          {REVIEW.columns.map((col) => (
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
      </section>

      <footer className="atw-footer">
        <p>{FOOTER.line}</p>
        <p>{FOOTER.note}</p>
        <Link href="/legal/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
