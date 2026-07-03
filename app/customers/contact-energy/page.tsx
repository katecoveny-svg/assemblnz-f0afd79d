import Link from 'next/link';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { UsageChart } from '@/components/customers/contact-energy/UsageChart';
import { WaitStateDemos } from '@/components/customers/contact-energy/WaitStateDemo';
import {
  SWITCH_AGENT_GREETING,
  SWITCH_AGENT_NAME,
  SWITCH_TRY_ME,
} from '@/lib/customers/contact-energy/agent';
import {
  BILL_PREVIEW,
  CONTACT_BRAND,
  DEMO_PERSONA,
  SWITCH_TILES,
  nzd,
} from '@/lib/customers/contact-energy/data';
import styles from './contact.module.css';

/**
 * The demo dashboard: Contact's app with the Assembling earn layer embedded.
 * Contact red primary, assembl gold on every money moment. Concept only.
 */

export default function ContactEnergyDemo() {
  return (
    <>
      <main className={styles.main}>
        {/* Hero */}
        <header className={styles.hero}>
          <span className={styles.heroKicker}>
            {DEMO_PERSONA.plan} · {DEMO_PERSONA.suburb} · {DEMO_PERSONA.accountLabel}
          </span>
          <h1 className={styles.heroTitle}>kia ora {DEMO_PERSONA.name}, this month</h1>
          <p className={styles.heroSub}>
            Power&rsquo;s tracking $12 under June. Assembling has quietly taken {nzd(4.23)} off your
            next bill — earned in the moments the app was already loading.
          </p>
        </header>

        {/* Usage + bill preview */}
        <div className={styles.grid2} id="usage">
          <section className={styles.card} aria-label="Usage">
            <div className={styles.sectionTitle}>Your year of power</div>
            <div className={styles.sectionSub}>
              {DEMO_PERSONA.planBlurb.toLowerCase()} — the grey slice is what Good Nights gave you free
            </div>
            <UsageChart />
          </section>

          <section className={styles.card} id="bill" aria-label="Bill preview">
            <div className={styles.sectionTitle}>Next bill</div>
            <div className={styles.sectionSub}>{BILL_PREVIEW.period} · due {BILL_PREVIEW.dueDate}</div>
            <div style={{ marginTop: 12 }}>
              <div className={styles.billRow}>
                <span className={styles.billLabel}>Electricity used</span>
                <span className={styles.billValue}>{nzd(BILL_PREVIEW.usageDollars)}</span>
              </div>
              <div className={styles.billRow}>
                <span className={styles.billLabel}>Daily charges</span>
                <span className={styles.billValue}>{nzd(BILL_PREVIEW.dailyCharges)}</span>
              </div>
              <div className={styles.billRow}>
                <span className={styles.billLabel}>Discounts</span>
                <span className={styles.billValue}>−{nzd(Math.abs(BILL_PREVIEW.discounts))}</span>
              </div>
              <div className={styles.billRow}>
                <span className={styles.billLabel}>
                  Assembling credits <span className={styles.goldDot} style={{ display: 'inline-block' }} aria-hidden />
                </span>
                <span className={`${styles.billValue} ${styles.billCredit}`}>
                  −{nzd(Math.abs(BILL_PREVIEW.assemblingCredits))}
                </span>
              </div>
              <div className={styles.billTotal}>
                <span>To pay</span>
                <span>{nzd(BILL_PREVIEW.total)}</span>
              </div>
              <p className={styles.billFine}>{BILL_PREVIEW.forecastNote}</p>
            </div>
          </section>
        </div>

        {/* Switch tiles */}
        <section aria-label="What Switch has done" id="plans">
          <div className={styles.sectionTitle}>Switch has been busy</div>
          <div className={styles.sectionSub}>
            your power assistant works between bills — here&rsquo;s what it did this week
          </div>
          <div className={styles.grid3} style={{ marginTop: 14 }}>
            {SWITCH_TILES.map((t) => (
              <article key={t.key} className={`${styles.tile} ${'isAttention' in t && t.isAttention ? styles.tileGold : ''}`}>
                <span className={styles.tileKicker}>{t.title}</span>
                <span className={styles.tileHeadline}>{t.headline}</span>
                <span className={styles.tileDetail}>{t.detail}</span>
                <span className={styles.tileStamp}>{t.stamp}</span>
              </article>
            ))}
          </div>
        </section>

        {/* Wait-state demos — the money shot */}
        <section aria-label="Wait-state demos">
          <div className={styles.sectionTitle}>The wait, working</div>
          <div className={styles.sectionSub}>
            every loading moment in the app can carry one reviewed, relevant offer — and the customer
            keeps the money as a bill credit. Press one:
          </div>
          <div style={{ marginTop: 14 }}>
            <WaitStateDemos />
          </div>
        </section>

        {/* Support strip */}
        <section aria-label="Support" id="support">
          <div className={styles.supportStrip}>
            {['Pay bill', 'Moving house', 'Compare plans', 'Add property', 'Change plan', 'Contact us'].map(
              (s) => (
                <span key={s} className={styles.supportChip}>
                  {s}
                </span>
              ),
            )}
          </div>
        </section>
      </main>

      {/* Switch chat right rail */}
      <aside className={styles.chatRail} aria-label="Switch chat">
        <div className={styles.chatRailHead}>
          <span className={styles.chatRailTitle}>
            <b>Switch</b> — your power assistant
          </span>
          <span className={styles.chatRailSub}>
            watches your usage, spots better plans, applies credits automatically
          </span>
        </div>
        <PilotAgentChat
          apiPath="/api/customers/contact-energy/chat"
          agentName={SWITCH_AGENT_NAME}
          greeting={SWITCH_AGENT_GREETING}
          tryMe={SWITCH_TRY_ME}
          accent={CONTACT_BRAND.red}
          draftNote="Tier-2 slice: the earn layer for Contact's existing customer experience — never their operating system. Concept demo; fictional account, no live Contact systems, no real credits."
        />
        <div className={styles.chatTrustFoot}>
          <span className={styles.chatTrustBadge}>trust score A</span>
          Contact Energy tariff feed · last synced 12 min ago (demo)
        </div>
        <div className={styles.chatTrustFoot} style={{ background: 'transparent', paddingTop: 0 }}>
          <Link href="/customers/contact-energy/assembling" className={styles.inlineLink}>
            Open the Assembling credit ledger →
          </Link>
        </div>
      </aside>
    </>
  );
}
