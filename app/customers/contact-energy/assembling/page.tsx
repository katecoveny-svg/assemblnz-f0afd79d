import type { Metadata } from 'next';
import { LedgerTable, SettingsPanel, TrendChart } from '@/components/customers/contact-energy/Ledger';
import { LEDGER, LEDGER_TOTAL, WALLET, nzd } from '@/lib/customers/contact-energy/data';
import styles from '../contact.module.css';

/**
 * The Assembling credit ledger — where the earn layer shows its receipts:
 * balance, auto-apply, every fictional transaction, and the consent controls.
 */

export const metadata: Metadata = {
  title: 'Assembling wallet — Contact Energy × Assembling (demo)',
  robots: { index: false, follow: false },
};

export default function AssemblingLedger() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <span className={styles.heroKicker}>assembling wallet · {WALLET.sinceLabel}</span>
        <h1 className={styles.heroTitle} style={{ color: 'var(--ce-gold-deep)' }}>
          the wait, banked
        </h1>
        <p className={styles.heroSub}>
          Every entry below is a loading moment that paid its way — a few seconds of a reviewed,
          relevant offer, turned into money off the power bill. Real bill credits, not points.
        </p>
      </header>

      <section className={styles.card} aria-label="Balance">
        <div className={styles.ledgerHero}>
          <div>
            <div className={styles.ledgerBalance}>{nzd(WALLET.thisMonth)}</div>
            <div className={styles.ledgerBalanceSub}>
              this month · {nzd(WALLET.lifetime)} lifetime · {LEDGER.length} recent moments totalling{' '}
              {nzd(LEDGER_TOTAL)}
            </div>
          </div>
          <div>
            <button type="button" className={styles.applyCta} aria-disabled>
              Auto-applied to next bill ✓
            </button>
            <div className={styles.applyCtaNote}>on by default — demo, not a real credit</div>
          </div>
        </div>
      </section>

      <section className={styles.card} aria-label="Weekly trend">
        <div className={styles.sectionTitle}>Eight weeks of earning</div>
        <div className={styles.sectionSub}>steady, small, automatic — it compounds</div>
        <div style={{ marginTop: 12 }}>
          <TrendChart />
        </div>
      </section>

      <section className={styles.card} aria-label="Transactions">
        <div className={styles.sectionTitle}>Every moment, receipted</div>
        <div className={styles.sectionSub}>
          fictional entries — a live deployment writes one row per watched offer, auditable end to end
        </div>
        <div style={{ marginTop: 12 }}>
          <LedgerTable />
        </div>
      </section>

      <section className={styles.card} aria-label="Settings">
        <div className={styles.sectionTitle}>Your controls</div>
        <div className={styles.sectionSub}>consent is the product — pause, prune or block in one tap</div>
        <div style={{ marginTop: 16 }}>
          <SettingsPanel />
        </div>
      </section>
    </main>
  );
}
