import Link from 'next/link';
import { SAMPLE_VERTICALS } from '@/lib/living-site/verticals';
import styles from './sample-site-wall.module.css';

/**
 * The visible demo — eight live sample businesses as mini website previews.
 * Each thumbnail is a pure-CSS render of that vertical's real landing page
 * (its palette, its business name, its services) and links straight to it.
 */
export function SampleSiteWall() {
  return (
    <div className={styles.wall}>
      {SAMPLE_VERTICALS.map((v) => (
        <Link key={v.slug} href={`/living-site/${v.slug}`} className={styles.card}>
          {/* browser chrome */}
          <span className={styles.chrome} aria-hidden>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.address}>{v.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.nz</span>
          </span>
          {/* mini hero */}
          <span
            className={styles.mini}
            style={{ background: v.palette.bg, color: v.palette.ink }}
            aria-hidden
          >
            <span className={styles.miniName} style={{ color: v.palette.ink }}>
              {v.businessName}
            </span>
            <span className={styles.miniTag} style={{ color: v.palette.muted }}>
              {v.tagline}
            </span>
            <span className={styles.miniRows}>
              {v.fallbackFacts
                .filter((f) => f.section === 'services')
                .slice(0, 3)
                .map((f) => (
                  <span key={f.id} className={styles.miniRow} style={{ background: v.palette.card }}>
                    <span className={styles.miniRowLabel}>{f.label}</span>
                    <span style={{ color: v.palette.accent, fontWeight: 700 }}>
                      {f.value.split('·')[0].trim()}
                    </span>
                  </span>
                ))}
            </span>
            <span className={styles.miniCta} style={{ background: v.palette.ink }} />
          </span>
          <span className={styles.caption}>
            <span className={styles.captionIndustry} style={{ color: v.palette.accent }}>
              {v.industryLabel}
            </span>
            <span className={styles.captionOpen}>open the live site →</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
