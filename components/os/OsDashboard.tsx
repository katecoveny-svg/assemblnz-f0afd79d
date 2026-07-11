import Link from 'next/link';
import { GenomeOrb } from './GenomeOrb';
import styles from './os.module.css';

export type OsTile = { label: string; value: string; hint?: string };
export type OsAction = { text: string; impact: 'high' | 'medium'; href: string };
export type OsQuietLink = { label: string; href: string };

export type OsDashboardProps = {
  greeting: string;
  greetingSub: string;
  askHref: string;
  tiles: OsTile[];
  actions: OsAction[];
  orbInitial: string;
  orbSurfaces: string[];
  genomeHref: string;
  assistantLede: string;
  assistantCta: string;
  assistantHref: string;
  insightName: string;
  insightDelta: string;
  /** 0–100 sparkline points, left to right. */
  insightPoints: number[];
  quietLinks: OsQuietLink[];
};

/**
 * The assembl operating system — one screen, pearl direction.
 * Greeting → today's summary → one column of priority actions beside the
 * Business Genome orb → assistant + insight. One primary action; everything
 * else stays quiet.
 */
export function OsDashboard(p: OsDashboardProps) {
  // A sparkline needs two points; pad a flat line rather than divide by zero.
  const points = p.insightPoints.length >= 2 ? p.insightPoints : [50, 50];
  const sparkPath = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * 300;
      const y = 44 - (v / 100) * 40;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className={styles.frame}>
      {/* ── greeting ────────────────────────────────────────────────── */}
      <header className={`${styles.greetingRow} ${styles.cardEmerge}`}>
        <div>
          <h1 className={styles.greeting}>{p.greeting}</h1>
          <p className={styles.greetingSub}>{p.greetingSub}</p>
        </div>
        <Link href={p.askHref} className={styles.askButton}>
          <span aria-hidden className={styles.askSpark}>
            ✦
          </span>
          ask assembl
        </Link>
      </header>

      {/* ── today's summary ─────────────────────────────────────────── */}
      <section className={`${styles.card} ${styles.cardEmerge}`} style={{ animationDelay: '0.08s' }}>
        <p className={styles.cardLabel}>today&apos;s summary</p>
        <div className={styles.summaryGrid}>
          {p.tiles.map((t) => (
            <div key={t.label} className={styles.tile}>
              <p className={styles.tileLabel}>{t.label}</p>
              <p className={styles.tileValue}>{t.value}</p>
              {t.hint ? <p className={styles.tileHint}>{t.hint}</p> : null}
            </div>
          ))}
        </div>
      </section>

      {/* ── actions + genome ────────────────────────────────────────── */}
      <div className={styles.body}>
        <section className={`${styles.card} ${styles.cardEmerge}`} style={{ animationDelay: '0.16s' }}>
          <p className={styles.cardLabel}>priority actions</p>
          {p.actions.map((a) => (
            <Link key={a.text} href={a.href} className={styles.action}>
              <span>
                <p className={styles.actionText}>{a.text}</p>
                <p
                  className={`${styles.actionImpact} ${a.impact === 'high' ? styles.actionImpactHigh : ''}`}
                >
                  {a.impact} impact
                </p>
              </span>
              <span aria-hidden className={styles.actionArrow}>
                →
              </span>
            </Link>
          ))}
        </section>

        <section
          className={`${styles.card} ${styles.cardEmerge}`}
          style={{ animationDelay: '0.24s', display: 'grid', placeItems: 'center' }}
        >
          <p className={styles.cardLabel} style={{ justifySelf: 'start' }}>
            business genome
          </p>
          <Link href={p.genomeHref} aria-label="Open the Business Genome" style={{ display: 'block' }}>
            <GenomeOrb initial={p.orbInitial} surfaces={p.orbSurfaces} size={330} />
          </Link>
        </section>
      </div>

      {/* ── assistant + insight ─────────────────────────────────────── */}
      <div className={styles.body}>
        <section className={`${styles.card} ${styles.cardEmerge}`} style={{ animationDelay: '0.3s' }}>
          <p className={styles.cardLabel}>assistant</p>
          <p className={styles.assistantLede}>{p.assistantLede}</p>
          <Link href={p.assistantHref} className={styles.assistantCta}>
            {p.assistantCta}
          </Link>
        </section>

        <section className={`${styles.card} ${styles.cardEmerge}`} style={{ animationDelay: '0.36s' }}>
          <p className={styles.cardLabel}>insight</p>
          <div className={styles.insightRow}>
            <p className={styles.insightName}>{p.insightName}</p>
            <p className={styles.insightDelta}>{p.insightDelta}</p>
          </div>
          <svg viewBox="0 0 300 48" className={styles.spark} aria-hidden>
            <path d={sparkPath} className={styles.sparkPath} />
          </svg>
        </section>
      </div>

      {/* ── everything else, quietly ────────────────────────────────── */}
      <nav aria-label="All areas" className={`${styles.quietNav} ${styles.cardEmerge}`} style={{ animationDelay: '0.42s' }}>
        {p.quietLinks.map((l) => (
          <Link key={`${l.label}-${l.href}`} href={l.href} className={styles.quietLink}>
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
