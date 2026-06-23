import Link from 'next/link';
import styles from './home.module.css';

export const metadata = {
  title: 'assembl — less admin, more mahi',
  description: 'Specialist Aotearoa agents, assembled into one calm surface.',
};

/**
 * Homepage — locked canon (2026-06-23).
 *
 * Direct port of canon-2026-06-23/b04dff1e-assemblherostandalone.html: the
 * golden-spheres Three.js scene (public/assembl-orb-scene.html) iframe-embedded
 * as the full-bleed background, a floating glass-pill nav, and the lower-left
 * editorial type block ("Less admin. / More mahi." in Cormorant Garamond).
 *
 * Ships its own nav, so the global SiteHeader is suppressed on `/` (see
 * isHomeHero in components/site/site-header.tsx). Styles live in home.module.css.
 */
export default function HomePage() {
  return (
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
          <Link href="/pricing">Pricing</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/about">About</Link>
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
  );
}
