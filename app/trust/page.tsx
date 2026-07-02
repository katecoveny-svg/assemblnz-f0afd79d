import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { Constellation, MicroLabel } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import { MottoStrip } from '@/components/v2/V2Chrome';
import { SecurityPackForm } from '@/components/trust/SecurityPackForm';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'trust — assembl',
  description:
    'mana receipts, the knowledge tier model, and the privacy act 2020 (including ipp 3a) — assembl trust in plain english. aligned, not certified: we tell you what we are and what we are not.',
  alternates: { canonical: '/trust' },
};

/**
 * /trust — the canonical trust page (v2 site, DIRECTION-LOCKED direction).
 *
 * Honest by construction, reusing the copy posture from /mana-receipts
 * (which stays live as the deep-dive): Mana Receipts explained, the knowledge
 * Tier A/B/C model, and Privacy Act 2020 IPP 3A ALIGNMENT — never a claim of
 * SOC 2 / ISO / HIPAA certification. /trust/soc2 keeps the honest posture
 * detail.
 */

const TIERS = [
  {
    tier: 'a',
    name: 'primary sources',
    copy: 'NZ legislation, gazette notices and official government guidance, ingested on a schedule. When an answer turns on the law, agents cite current NZ legislation with the retrieval date on the citation.',
  },
  {
    tier: 'b',
    name: 'knowledge base',
    copy: 'Sector guidance and assembl-maintained playbooks — versioned, sourced, and shown as citations so you can see where a draft came from.',
  },
  {
    tier: 'c',
    name: 'workspace data',
    copy: 'What you bring to your own workspace, plus clearly-labelled demo data in pilots. Always marked so it can never be mistaken for a primary source.',
  },
];

const HONEST_LIST: Array<{ is: boolean; copy: string }> = [
  { is: true, copy: 'aligned with the Privacy Act 2020, including IPP 3A (in force 1 May 2026).' },
  { is: true, copy: 'every output is a draft a named person reviews before it ships.' },
  { is: true, copy: 'data hosted in Sydney (AWS ap-southeast-2, Supabase) — an NZ option is the goal; until then, Sydney is the honest answer.' },
  { is: false, copy: 'not SOC 2 certified. We will pursue SOC 2 Type II when the enterprise pipeline justifies it — posture at /trust/soc2.' },
  { is: false, copy: 'not ISO 27001 certified. Same reasoning, same honesty.' },
  { is: false, copy: 'not HIPAA certified — HIPAA is a US framework; we run under the NZ Health Information Privacy Code.' },
];

export default function TrustPage() {
  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: typography.body.lineHeight,
    color: palette.bodyGrey,
  };

  return (
    <div className={styles.page}>
      {/* ── hero ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
          <HeroArt />
        </div>
        <div className={styles.section} style={{ position: 'relative', paddingBottom: 40 }}>
          <div className={styles.inner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden style={{ color: palette.canary, fontSize: 12, lineHeight: 1 }}>
                •
              </span>
              <MicroLabel>trust · in plain english</MicroLabel>
            </div>
            <h1 className={styles.h1} style={{ marginTop: 18, maxWidth: 640 }}>
              proof, not promises
              <span aria-hidden style={{ color: palette.canary }}>
                .
              </span>
            </h1>
            <p style={{ ...body, marginTop: 18, maxWidth: 460 }}>
              What we can show today. What we are not yet. Nothing in between.
            </p>
          </div>
        </div>
      </section>

      {/* ── mana receipts ────────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 24 }}>
        <div className={`${styles.inner} rise`}>
          <MicroLabel as="h2">mana receipts</MicroLabel>
          <h3 className={styles.h2} style={{ marginTop: 14, maxWidth: 560 }}>
            the receipt is the proof. every run gets one.
          </h3>
          <p style={{ ...body, marginTop: 16, maxWidth: 620 }}>
            A Mana Receipt is the legible record of one thing an agent did: the sources it used,
            the assumptions it made, who reviewed it, and a hash that seals the trail. It is the
            document your board, auditor, client or insurer can actually read.
          </p>
          <div style={{ display: 'flex', gap: 22, marginTop: 22, flexWrap: 'wrap' }}>
            <Link href="/mana-receipts" className={styles.navCta}>
              read the honest trust page
              <span aria-hidden style={{ color: palette.canary, fontSize: 15, lineHeight: 1 }}>
                •
              </span>
            </Link>
            <Link
              href="/mana-receipts/sample"
              className={styles.navLink}
              style={{ alignSelf: 'center', borderBottom: `1px solid ${palette.hairline}` }}
            >
              download a sample receipt
            </Link>
          </div>
        </div>
      </section>

      {/* ── knowledge tiers ──────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 12 }}>
        <div className={`${styles.inner} rise`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <MicroLabel as="h2">where answers come from</MicroLabel>
            <Constellation size={44} />
          </div>
          <div className={styles.cardGrid} style={{ marginTop: 22 }}>
            {TIERS.map((t) => (
              <div
                key={t.tier}
                style={{
                  padding: '24px 24px',
                  borderRadius: 16,
                  border: `1px solid ${palette.hairline}`,
                  background: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span
                    style={{
                      fontFamily: typography.display.fontFamily,
                      fontWeight: typography.display.fontWeight,
                      fontSize: 30,
                      color: palette.goldSoft,
                    }}
                  >
                    {t.tier}
                  </span>
                  <span
                    style={{
                      fontFamily: typography.display.fontFamily,
                      fontWeight: typography.display.fontWeight,
                      fontSize: 22,
                      textTransform: 'lowercase',
                      color: palette.ink,
                    }}
                  >
                    {t.name}
                  </span>
                </div>
                <p style={{ ...body, fontSize: 13.5, marginTop: 12, marginBottom: 0 }}>{t.copy}</p>
              </div>
            ))}
          </div>
          <p style={{ ...body, fontSize: 13, marginTop: 18, maxWidth: 620 }}>
            Citations in agent replies carry their tier, so a statute and a playbook never look
            like the same kind of evidence. Where retrieval is not wired for an agent yet, it says
            so — it never invents a source.
          </p>
        </div>
      </section>

      {/* ── privacy act + the honest list ────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 12 }}>
        <div className={`${styles.inner} rise`}>
          <MicroLabel as="h2">privacy act 2020 · ipp 3a</MicroLabel>
          <p style={{ ...body, marginTop: 16, maxWidth: 620 }}>
            IPP 3A came into force on 1 May 2026: when personal information is collected
            indirectly, people must still know. assembl is designed to align with it — agents are
            disclosed as agents, indirect collection is flagged, and the receipt records the
            trail. Alignment is a design posture we can show, not a certificate we hold.
          </p>
          <ul
            style={{
              listStyle: 'none',
              margin: '22px 0 0',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxWidth: 680,
            }}
          >
            {HONEST_LIST.map((item) => (
              <li
                key={item.copy}
                style={{
                  ...body,
                  fontSize: 13.5,
                  display: 'flex',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: `1px solid ${palette.hairline}`,
                  background: item.is ? '#FFFFFF' : palette.paperDeep,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    color: item.is ? palette.canary : palette.silverDeep,
                    fontSize: 11,
                    lineHeight: '21px',
                  }}
                >
                  •
                </span>
                {item.copy}
              </li>
            ))}
          </ul>
          <p style={{ ...body, fontSize: 13, marginTop: 18 }}>
            The detailed posture, sub-processors and change log live on{' '}
            <Link href="/trust/soc2" style={{ color: palette.ink }}>
              /trust/soc2
            </Link>{' '}
            and{' '}
            <Link href="/mana-receipts" style={{ color: palette.ink }}>
              /mana-receipts
            </Link>
            . Te Tiriti statement:{' '}
            <Link href="/te-tiriti" style={{ color: palette.ink }}>
              /te-tiriti
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── request the security pack ────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 12 }}>
        <div className={`${styles.inner} rise`} style={{ maxWidth: 720 }}>
          <MicroLabel as="h2">request the security pack</MicroLabel>
          <p style={{ ...body, marginTop: 14, maxWidth: 560 }}>
            The audit pack — architecture, data flows, sub-processors and the current posture —
            for teams doing due diligence.
          </p>
          <div style={{ marginTop: 20 }}>
            <SecurityPackForm />
          </div>
        </div>
      </section>

      <MottoStrip />
    </div>
  );
}
