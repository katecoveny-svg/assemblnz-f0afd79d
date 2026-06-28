import Link from 'next/link';
import {
  PUBLIC_MARKETPLACE_AGENTS,
  CATEGORY_LABELS,
  agentPriceLabel,
} from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import styles from './home.module.css';

export const metadata = {
  title: 'assembl — less admin, more mahi',
  description: 'Specialist Aotearoa agents, assembled into one calm surface.',
};

/**
 * Homepage — locked canon (2026-06-23).
 *
 * Port of "assembl - Marketplace Hero.dc.html": the golden-spheres Three.js
 * scene (public/assembl-orb-scene.html) iframe-embedded as the full-bleed hero
 * background, a floating glass-pill nav, the lower-left editorial type block
 * ("Less admin. / More mahi." in Cormorant Garamond), and — below the hero —
 * the marketplace grid showing the live /agents roster as gold-orb cards.
 *
 * Server component: the grid is static markup (hover is pure CSS), so the
 * agent registry is read server-side and only public fields render — the
 * locked prompts never reach the browser. Each card links to /agents/[slug].
 *
 * Ships its own nav, so the global SiteHeader is suppressed on `/` (see
 * site-header.tsx). Styles live in home.module.css.
 */

// Gold orb shades, cycled per card for the subtle variation the .dc.html shows.
const ORB_GOLDS: [string, string][] = [
  ['#FFD42A', '#E0A800'],
  ['#FFE066', '#F2C200'],
  ['#FFCB1F', '#D89A00'],
  ['#FFD96B', '#E0A800'],
  ['#FFE680', '#E0A800'],
  ['#FFDD55', '#D89A00'],
  ['#FFCF3A', '#E0A800'],
];

export default function HomePage() {
  const agents = PUBLIC_MARKETPLACE_AGENTS;

  return (
    <>
      <section className={styles.hero}>
        {/* full-bleed 3D sphere cluster — Kate's three.js scene, served as a
            static document and iframe-embedded so its WebGL module runs isolated. */}
        <div className={styles.scene} aria-hidden>
          <iframe src="/assembl-orb-scene.html" title="assembl — golden spheres" scrolling="no" />
        </div>

        {/* nav */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="assembl — home">
            <svg width="52" height="52" viewBox="0 0 40 40" aria-hidden="true">
              <defs>
                <linearGradient id="wv1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#FFE680" />
                  <stop offset=".45" stopColor="#FFD42A" />
                  <stop offset="1" stopColor="#E0A800" />
                </linearGradient>
                <linearGradient id="wv2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#FFD42A" />
                  <stop offset="1" stopColor="#C79B1F" />
                </linearGradient>
                <linearGradient id="wv3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#56544B" />
                  <stop offset="1" stopColor="#2E2C28" />
                </linearGradient>
                <linearGradient id="wv4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFF1C2" />
                  <stop offset="1" stopColor="#FFD42A" />
                </linearGradient>
              </defs>
              <g fill="none" strokeWidth="4.8" strokeLinecap="round">
                <path d="M8 14 H32" stroke="url(#wv1)" />
                <path d="M8 26 H32" stroke="url(#wv2)" />
                <path d="M14 8 V32" stroke="url(#wv3)" />
                <path d="M26 8 V32" stroke="url(#wv4)" />
              </g>
              <g fill="none" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" opacity=".7">
                <path d="M8 12.7 H32" />
                <path d="M8 24.7 H32" />
                <path d="M12.7 8 V32" />
                <path d="M24.7 8 V32" />
              </g>
            </svg>
            <span className={styles.brandWord}>assembl</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/agents">Agents</Link>
            <Link href="/agents/pricing">Pricing</Link>
            <Link href="/trust">Trust</Link>
            <Link href="/about">About</Link>
            <Link href="/login">Sign in</Link>
          </div>
          <Link className={styles.navCta} href="/agents">
            Browse agents
          </Link>
        </nav>

        {/* hero copy */}
        <div className={styles.body}>
          <div className={styles.type}>
            <h1 className={styles.h1}>
              Less admin.
              <br />
              <em>More mahi.</em>
            </h1>
            <p className={styles.sub}>Specialist Aotearoa agents, assembled into one calm surface.</p>
            <Link className={styles.btn} href="/agents">
              Browse agents →
            </Link>
          </div>
          <div className={styles.caption}>001 — Agents, assembled</div>
        </div>
      </section>

      {/* ── Marketplace grid — the live /agents roster as gold-orb cards ─────── */}
      <section className={styles.market}>
        <div className={styles.marketInner}>
          <div className={styles.marketHead}>
            <div>
              <div className={styles.marketEyebrow}>002 — The marketplace</div>
              <h2 className={styles.marketTitle}>
                Agents <em>tuned</em> for New Zealand work.
              </h2>
            </div>
            <div className={styles.marketFilters}>
              <Link href="/agents" className={styles.filterActive}>
                All
              </Link>
              <Link href="/agents" className={styles.filter}>
                Family
              </Link>
              <Link href="/agents" className={styles.filter}>
                Business
              </Link>
              <Link href="/agents" className={styles.filter}>
                Trades
              </Link>
              <Link href="/agents" className={styles.filter}>
                Health
              </Link>
            </div>
          </div>

          <div className={styles.grid}>
            {agents.map((a, i) => {
              // Lead with the flagship (9am Brief, first in the roster) as the
              // one dark featured tile — the .dc.html's featured-card slot.
              const featured = i === 0;
              const [tone, deep] = ORB_GOLDS[i % ORB_GOLDS.length];
              const price = agentPriceLabel(a);
              return (
                <Link
                  key={a.slug}
                  href={`/agents/${a.slug}`}
                  className={`${styles.card} ${featured ? styles.cardDark : styles.cardLight}`}
                  aria-label={`${a.name} — ${a.description}`}
                >
                  {featured && <span className={styles.cardGlow} aria-hidden />}
                  <div className={styles.cardTop}>
                    <span
                      className={styles.orb}
                      style={{
                        background: `radial-gradient(circle at 33% 26%, #FFFDF7 0%, ${tone} 52%, ${deep} 100%)`,
                      }}
                      aria-hidden
                    >
                      <span className={styles.orbSpec} aria-hidden />
                      <AgentIcon name={a.icon} className={styles.orbIcon} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className={styles.cardName}>{a.name}</div>
                      <div className={styles.cardTag}>{CATEGORY_LABELS[a.category]}</div>
                    </div>
                  </div>
                  <p className={styles.cardBlurb}>{a.description}</p>
                  <div className={styles.cardFoot}>
                    <span className={styles.cardPrice}>{price}</span>
                    <span className={styles.installPill}>
                      {featured ? `Meet ${a.name}` : 'Install'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
