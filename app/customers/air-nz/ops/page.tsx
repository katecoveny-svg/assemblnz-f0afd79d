import Link from 'next/link';
import styles from './ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import { AirNzAppSlotMock } from '@/components/customers/air-nz/AppSlotMock';
import { getBrandConfig } from '@/lib/brand/configs';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { BackendTabs } from '@/components/customers/BackendTabs';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { OsScrollReveal, OsHoverLift } from '@/components/ops/shared/OsMotion';
import {
  AIRNZ_ACTIVITY,
  AIRNZ_AGENT_GREETING,
  AIRNZ_AGENT_NAME,
  AIRNZ_KNOWLEDGE_SOURCES,
  AIRNZ_RECEIPTS,
  AIRNZ_TRY_ME,
  airnzPromptExcerpt,
} from '@/lib/customers/air-nz/agent';
import {
  SPONSORS,
  CAMPAIGNS,
  REVENUE_MTD,
  REVENUE_FORECAST_JUL,
  revenueSplit,
  LOYALTY_RECON,
  COMPLIANCE_CHECKS,
  CDO_BRIEF,
  nzd,
} from '@/lib/customers/air-nz/ops-data';

const OPS = '/customers/air-nz/ops';

const brand = getBrandConfig('air-nz');

export default function OpsOverview() {
  const split = revenueSplit(REVENUE_MTD.grossAdRevenue);
  const live = SPONSORS.filter((s) => s.status === 'live').length;
  const running = CAMPAIGNS.filter((c) => c.status === 'running').length;
  const openFlags = COMPLIANCE_CHECKS.filter(
    (c) => c.fairTrading !== 'pass' || c.ipp3aNotice !== 'shown',
  ).length;
  const deltaPct = CDO_BRIEF.revenueVsForecast.deltaPct;

  const kpis = [
    { label: 'Gross ad revenue · MTD', value: nzd(split.gross), sub: `${(REVENUE_MTD.fillRate * 100).toFixed(0)}% fill · ${(REVENUE_MTD.paidImpressions / 1e6).toFixed(2)}M paid`, teal: false },
    { label: 'Net to Air New Zealand', value: nzd(split.koruNet + split.airpointsLiability), sub: `Treasury 55% of gross`, teal: false },
    { label: 'Airpoints$ to members', value: nzd(split.airpointsLiability), sub: 'Credited in the wait', teal: true },
    { label: 'vs July forecast', value: `+${deltaPct.toFixed(1)}%`, sub: `Forecast ${nzd(REVENUE_FORECAST_JUL)}`, teal: false },
  ];

  const links = [
    { href: `${OPS}/sponsors`, title: 'Sponsors', meta: `${live} live · ${SPONSORS.length} total` },
    { href: `${OPS}/campaigns`, title: 'Campaigns', meta: `${running} running · ${CAMPAIGNS.length} scheduled` },
    { href: `${OPS}/revenue`, title: 'Revenue split', meta: 'Gross → treasury → net' },
    { href: `${OPS}/analytics`, title: 'Segment analytics', meta: 'Aggregate cohorts · no PII' },
    { href: `${OPS}/compliance`, title: 'Compliance', meta: `${openFlags} open items` },
    { href: `${OPS}/comms`, title: 'Comms drafting', meta: 'Partner · board · sponsor' },
    { href: `${OPS}/loyalty`, title: 'Koru reconciliation', meta: LOYALTY_RECON.status === 'balanced' ? 'Balanced' : 'Variance' },
    { href: `${OPS}/brief`, title: 'CDO daily brief', meta: "Jeremy O'Brien" },
  ];

  return (
    <>
      <OpsTopbar eyebrow="Partner Operations · Assembling on Air New Zealand" title="Overview" />
      <div className={styles.content}>
        {/* Signature slice hero — a live mock of the Air NZ app home with
            Assembling as a NATIVE SLOT beside Oscar (Air NZ's real in-app
            assistant since 2017). Companion slot, never a replacement.
            Tier-2 framing: the earn layer, never the airline's OS. */}
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
              minHeight: 380,
              padding: '32px 28px',
              background: 'linear-gradient(135deg, #06242C 0%, #0A3540 55%, #0B4A56 100%)',
            }}
          >
            <div style={{ flex: '1 1 380px' }}>
              <p
                style={{
                  fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  fontWeight: 500,
                  fontSize: 'clamp(30px, 4.5vw, 52px)',
                  lineHeight: 1.08,
                  textTransform: 'lowercase',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                every wait, earning<span style={{ color: '#b8964f' }}>.</span>
              </p>
              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: 12,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                nine wait moments · one day · the earn layer via assembling
              </p>
              <p
                style={{
                  margin: '18px 0 0',
                  maxWidth: 420,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.78)',
                }}
              >
                Assembling appears as a native slot in the app Air New Zealand
                already has — right beside Oscar, their own virtual assistant.
                A companion in the journey, never a replacement.
              </p>
            </div>
            <div style={{ flex: '0 0 auto', margin: '0 auto' }}>
              <AirNzAppSlotMock />
            </div>
          </div>
        </OsScrollReveal>
        <p className={styles.lead}>
          The back-of-house console the Air New Zealand team would use to run a
          Dash partnership — sponsors, campaigns, the revenue split, passenger
          analytics, compliance, comms, and Koru reconciliation. Everything here
          is a concept demo on mocked data; no live Air NZ or Airpoints systems
          are touched.
        </p>

        <div className={`${styles.grid} ${styles.g4}`}>
          {kpis.map((k) => (
            <OsHoverLift key={k.label} accent={brand?.colours.accent}>
              <div className={styles.card}>
                <div className={styles.label}>{k.label}</div>
                <div className={`${styles.kpi} ${k.teal ? styles.teal : ''}`}>{k.value}</div>
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
              apiPath="/api/customers/air-nz/chat"
              agentName={AIRNZ_AGENT_NAME}
              greeting={AIRNZ_AGENT_GREETING}
              tryMe={AIRNZ_TRY_ME}
              accent={brand?.colours.accent ?? '#00B0B9'}
              draftNote="Tier-2 slice: the earn layer only — never the airline's operating system. Concept demo; no live Air NZ systems, no real Airpoints Dollars."
            />
            <BackendTabs
              brain={{
                model: MODEL_TIER_TO_ANTHROPIC.mid,
                fallbackNote: 'free-fallback ladder behind it (gemini → groq → ollama)',
                temperatureNote: 'temperature: provider default',
                promptExcerpt: airnzPromptExcerpt(),
                sources: AIRNZ_KNOWLEDGE_SOURCES,
              }}
              activity={AIRNZ_ACTIVITY}
              receipts={AIRNZ_RECEIPTS}
              drafts={[]}
            />
          </div>
        </OsScrollReveal>

        <div className={styles.sectionTitle}>Today, at a glance</div>
        <div className={`${styles.grid} ${styles.g2}`}>
          <div className={styles.card}>
            <div className={styles.label}>Overnight</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {CDO_BRIEF.overnight.map((o) => (
                <li key={o} className={styles.muted} style={{ marginBottom: 6 }}>{o}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Compliance flags</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {CDO_BRIEF.complianceFlags.map((c) => (
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
