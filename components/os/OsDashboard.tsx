import Link from 'next/link';
import { GenomeOrb } from './GenomeOrb';
import styles from './os.module.css';

export type OsTile = { label: string; value: string; hint?: string };
export type OsAction = { text: string; impact: 'high' | 'medium'; href: string };
export type OsQuietLink = { label: string; href: string };
/** One agent on the team, with what it does and whether it's working now. */
export type OsAgent = { name: string; job: string; status: 'live' | 'watching' | 'drafting' };
/** A draft an agent has written and left waiting for a human yes. */
export type OsApproval = { who: string; summary: string; draft: string };
/** One thing that happened on the record — the activity trace. */
export type OsActivityItem = { when: string; title: string; meta?: string };

export type OsDashboardProps = {
  greeting: string;
  greetingSub: string;
  askHref: string;
  tiles: OsTile[];
  actions: OsAction[];
  orbInitial: string;
  orbSurfaces: string[];
  /** Optional liquid-glass render for the orb's centre. */
  orbImage?: string;
  genomeHref: string;
  assistantLede: string;
  assistantCta: string;
  assistantHref: string;
  insightName: string;
  insightDelta: string;
  /** 0–100 sparkline points, left to right. */
  insightPoints: number[];
  quietLinks: OsQuietLink[];
  /** The team of agents working the business. */
  agents?: OsAgent[];
  /** Drafts waiting for a yes — the approvals queue. */
  approvals?: OsApproval[];
  /** What the agents actually did — the activity trace. */
  activity?: OsActivityItem[];
  /** Section labels (approved strings, passed from the page). */
  agentsLabel?: string;
  approvalsLabel?: string;
  activityLabel?: string;
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
            <GenomeOrb initial={p.orbInitial} surfaces={p.orbSurfaces} size={330} image={p.orbImage} />
          </Link>
        </section>
      </div>

      {/* ── the agents working the business ─────────────────────────── */}
      {p.agents && p.agents.length > 0 ? (
        <section className={`${styles.card} ${styles.cardEmerge}`} style={{ animationDelay: '0.28s' }}>
          <p className={styles.cardLabel}>{p.agentsLabel ?? 'agents'}</p>
          <ul className={styles.agentGrid}>
            {p.agents.map((a) => (
              <li key={a.name} className={styles.agentItem}>
                <span className={`${styles.agentDot} ${styles[`agentDot_${a.status}`]}`} aria-hidden />
                <span className={styles.agentBody}>
                  <span className={styles.agentName}>{a.name}</span>
                  <span className={styles.agentJob}>{a.job}</span>
                </span>
                <span className={styles.agentStatus}>{a.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── waiting for your yes + activity ─────────────────────────── */}
      {(p.approvals && p.approvals.length > 0) || (p.activity && p.activity.length > 0) ? (
        <div className={styles.body}>
          {p.approvals && p.approvals.length > 0 ? (
            <section className={`${styles.card} ${styles.cardEmerge}`} style={{ animationDelay: '0.32s' }}>
              <p className={styles.cardLabel}>{p.approvalsLabel ?? 'waiting for your yes'}</p>
              <ul className={styles.approvalList}>
                {p.approvals.map((a) => (
                  <li key={a.who} className={styles.approval}>
                    <p className={styles.approvalWho}>{a.who}</p>
                    <p className={styles.approvalSummary}>{a.summary}</p>
                    <p className={styles.approvalDraft}>{a.draft}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {p.activity && p.activity.length > 0 ? (
            <section className={`${styles.card} ${styles.cardEmerge}`} style={{ animationDelay: '0.36s' }}>
              <p className={styles.cardLabel}>{p.activityLabel ?? 'activity'}</p>
              <ul className={styles.activityList}>
                {p.activity.map((it) => (
                  <li key={`${it.when}-${it.title}`} className={styles.activityItem}>
                    <span className={styles.activityWhen}>{it.when}</span>
                    <span className={styles.activityTitle}>{it.title}</span>
                    {it.meta ? <span className={styles.activityMeta}>{it.meta}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

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
