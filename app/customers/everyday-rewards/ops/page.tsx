import Link from 'next/link';
import styles from './ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { getBrandConfig } from '@/lib/brand/configs';
import { EdrAppSlotMock } from '@/components/customers/everyday-rewards/AppSlotMock';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { BackendTabs } from '@/components/customers/BackendTabs';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { OsScrollReveal, OsHoverLift } from '@/components/ops/shared/OsMotion';
import {
  EDR_ACTIVITY,
  EDR_AGENT_GREETING,
  EDR_AGENT_NAME,
  EDR_KNOWLEDGE_SOURCES,
  EDR_RECEIPTS,
  EDR_TRY_ME,
  edrPromptExcerpt,
} from '@/lib/customers/everyday-rewards/agent';
import {
  SPONSORS,
  CAMPAIGNS,
  REVENUE_MTD,
  REVENUE_FORECAST_JUL,
  revenueSplit,
  RECON,
  COMPLIANCE_CHECKS,
  CDMO_BRIEF,
  nzd,
  pts,
} from '@/lib/customers/everyday-rewards/ops-data';

const OPS = '/customers/everyday-rewards/ops';

const brand = getBrandConfig('everyday-rewards');

export default function OpsOverview() {
  const split = revenueSplit(REVENUE_MTD.grossAdRevenue);
  const live = SPONSORS.filter((s) => s.status === 'live').length;
  const running = CAMPAIGNS.filter((c) => c.status === 'running').length;
  const openFlags = COMPLIANCE_CHECKS.filter(
    (c) => c.fairTrading !== 'pass' || c.asa !== 'pass' || c.ipp3aNotice !== 'shown',
  ).length;
  const deltaPct = CDMO_BRIEF.revenueVsForecast.deltaPct;

  const kpis = [
    { label: 'Gross attribution · MTD', value: nzd(split.gross), sub: `${(REVENUE_MTD.fillRate * 100).toFixed(0)}% fill · ${(REVENUE_MTD.sponsoredMoments / 1e6).toFixed(1)}M moments`, orange: false },
    { label: 'Points minted to shoppers', value: pts(split.pointsMinted), sub: `${nzd(split.toShopper)} value · 55% of gross`, orange: true },
    { label: 'Net to Everyday Rewards', value: nzd(split.toEdr), sub: 'Treasury 30% of gross', orange: false },
    { label: 'vs July forecast', value: `+${deltaPct.toFixed(1)}%`, sub: `Forecast ${nzd(REVENUE_FORECAST_JUL)}`, orange: false },
  ];

  const links = [
    { href: `${OPS}/sponsors`, title: 'Sponsors', meta: `${live} live · ${SPONSORS.length} total` },
    { href: `${OPS}/tiers`, title: 'Tiers & incentives', meta: 'Platinum · gold · silver' },
    { href: `${OPS}/campaigns`, title: 'Earn scheduling', meta: `${running} running · ${CAMPAIGNS.length} total` },
    { href: `${OPS}/reconciliation`, title: 'Reconciliation', meta: RECON.status === 'balanced' ? 'Balanced' : 'Variance' },
    { href: `${OPS}/liability`, title: 'Points liability', meta: 'Treasury · breakage · forecast' },
    { href: `${OPS}/analytics`, title: 'Segment analytics', meta: 'Aggregate cohorts · no PII' },
    { href: `${OPS}/compliance`, title: 'Compliance', meta: `${openFlags} open items` },
    { href: `${OPS}/comms`, title: 'Comms drafting', meta: 'Sponsor · shopper · blog' },
  ];

  return (
    <>
      <OpsTopbar eyebrow="Partner Operations · Assembling on Everyday Rewards" title="Overview" />
      <div className={styles.content}>
        {/* Signature slice hero — a live mock of the Everyday Rewards app
            home: mostly white like the real app, with Assembling as a NATIVE
            PARTNER SLOT beside ASB and Olive (Woolworths' real AI assistant)
            untouched in her own slot. Orange appears as small accents only
            (the r-leaf badge + the earn pulse). Companion, never a
            replacement. */}
        <OsScrollReveal>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 28,
              borderRadius: 16,
              overflow: 'hidden',
              padding: '32px 28px',
              background: '#FBFAF6',
              border: '1px solid #EAEAEA',
            }}
          >
            {/* shopper-icon wallpaper wash inside the hero panel */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage: 'url(/brand/everyday-rewards/pattern-shopper-icons.png)',
                backgroundRepeat: 'repeat',
                backgroundSize: '380px auto',
                opacity: 0.08,
              }}
            />
            <div style={{ position: 'relative', flex: '1 1 380px' }}>
              <p
                style={{
                  fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  fontWeight: 500,
                  fontSize: 'clamp(26px, 3.5vw, 42px)',
                  lineHeight: 1.1,
                  textTransform: 'lowercase',
                  color: '#22303c',
                  margin: 0,
                }}
              >
                the native partner slot, earning in the everyday wait
                <span style={{ color: '#b8964f' }}>.</span>
              </p>
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#5A5850',
                }}
              >
                the earn layer via assembling · concept · shared in confidence
              </p>
              <p
                style={{
                  margin: '18px 0 0',
                  maxWidth: 420,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: '#3E3C36',
                }}
              >
                Assembling slots into the app Everyday Rewards already has —
                a partner tile beside ASB, with Olive untouched in her own slot.
                A companion in the everyday shop, never a replacement.
              </p>
            </div>
            <div style={{ position: 'relative', flex: '0 0 auto', margin: '0 auto' }}>
              <EdrAppSlotMock />
            </div>
          </div>
        </OsScrollReveal>
        <p className={styles.lead}>
          The back-of-house console the Everyday Rewards team would use to run a
          Dash wait-moment partnership — sponsors and tiers, earn scheduling,
          sponsor-funded points reconciliation, the points-liability treasury,
          shopper-segment analytics, compliance, and comms. Everything here is a
          concept demo on mocked data; no live Everyday Rewards or points systems
          are touched, and no real points are minted.
        </p>

        <div className={`${styles.grid} ${styles.g4}`}>
          {kpis.map((k) => (
            <OsHoverLift key={k.label} accent={brand?.colours.accent}>
              <div className={styles.card}>
                <div className={styles.label}>{k.label}</div>
                <div className={`${styles.kpi} ${k.orange ? styles.orange : ''}`}>{k.value}</div>
                <div className={styles.kpiSub}>{k.sub}</div>
              </div>
            </OsHoverLift>
          ))}
        </div>

        <div className={styles.sectionTitle}>Jump in</div>
        <div className={`${styles.grid} ${styles.g4}`}>
          {links.map((l) => (
            <OsHoverLift key={l.href} accent={brand?.colours.accent}>
              <Link href={l.href} className={styles.card} style={{ textDecoration: 'none', display: 'block' }}>
                <div className={styles.cardTitle}>{l.title}</div>
                <div className={styles.kpiSub}>{l.meta}</div>
                <div className={styles.eyebrow} style={{ marginTop: 12 }}>Open →</div>
              </Link>
            </OsHoverLift>
          ))}
        </div>

        <div className={styles.sectionTitle}>Talk to the Assembling desk</div>
        <OsScrollReveal>
          <div style={{ display: 'grid', gap: 20 }}>
            <PilotAgentChat
              apiPath="/api/customers/everyday-rewards/chat"
              agentName={EDR_AGENT_NAME}
              greeting={EDR_AGENT_GREETING}
              tryMe={EDR_TRY_ME}
              accent={brand?.colours.accent ?? '#fd6400'}
              draftNote="Tier-2 slice: the earn layer only — never the programme's operating system. Concept demo; no real points are ever minted."
            />
            <BackendTabs
              brain={{
                model: MODEL_TIER_TO_ANTHROPIC.mid,
                fallbackNote: 'free-fallback ladder behind it (gemini → groq → ollama)',
                temperatureNote: 'temperature: provider default',
                promptExcerpt: edrPromptExcerpt(),
                sources: EDR_KNOWLEDGE_SOURCES,
              }}
              activity={EDR_ACTIVITY}
              receipts={EDR_RECEIPTS}
              drafts={[]}
            />
          </div>
        </OsScrollReveal>

        <div className={styles.sectionTitle}>Today, at a glance</div>
        <div className={`${styles.grid} ${styles.g2}`}>
          <div className={styles.card}>
            <div className={styles.label}>Overnight</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {CDMO_BRIEF.overnight.map((o) => (
                <li key={o} className={styles.muted} style={{ marginBottom: 6 }}>{o}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Compliance flags</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {CDMO_BRIEF.complianceFlags.map((c) => (
                <li key={c} className={styles.muted} style={{ marginBottom: 6 }}>{c}</li>
              ))}
            </ul>
            <div style={{ marginTop: 12 }}>
              <Link href={`${OPS}/compliance`} className={`${styles.btn} ${styles.btnGhost}`}>
                Review compliance →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
