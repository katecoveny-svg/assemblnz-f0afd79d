'use client';

import Link from 'next/link';
import { CineFooter } from './CineFooter';

/**
 * The creative subpages — /about, /pilots, /field-notes — one shared shell in
 * the cinematic system (Kate's design language; copy written to her register
 * under her "be creative" licence, flagged for her word-check).
 *
 * The shared watch frame owns the artwork, preserving each page's copy.
 */

export type SubpageSpec = {
  kicker: string;
  h1a: string;
  h1b: string; // accent line
  lede: string;
  panels: Array<{ n: string; h: string; p: string }>;
  cta: { label: string; href: string };
  scene: 'about' | 'pilots' | 'notes';
};

export function CinematicSubpage({ spec }: { spec: SubpageSpec }) {

  return (
    <div className="cine" style={{ cursor: 'auto' }}>
      <div className="content">
        <nav className="nav">
          <Link className="wordmark" href="/">assembl</Link>
          <div className="nav-links">
            <Link href="/agents">agents</Link>
            <Link href="/pricing">pricing</Link>
            <Link href="/assembling">the agentic journey</Link>
          </div>
          <Link className="nav-cta" href="/">← home</Link>
        </nav>

        <header className="page-header">
          <div className="kicker">{spec.kicker}</div>
          <h1>{spec.h1a}<br /><span className="accent">{spec.h1b}</span></h1>
          <p className="lede" style={{ marginTop: 16 }}>{spec.lede}</p>
        </header>

        <div className="page-body">
          <div className="sub-panels">
            {spec.panels.map((pn) => (
              <div className="part-card" key={pn.n}>
                <div className="pnum">{pn.n}</div><h4>{pn.h}</h4><p>{pn.p}</p>
              </div>
            ))}
          </div>
          <div className="sub-cta">
            <Link className="btn btn-solid" href={spec.cta.href}>{spec.cta.label}</Link>
            <Link className="btn btn-glass" href="/ai-ready">begin — our agents read your site first</Link>
          </div>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
