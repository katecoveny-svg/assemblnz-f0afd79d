import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../mana-receipts.module.css';
import { ReceiptMock } from '../ReceiptMock';
import { ReceiptActions } from './ReceiptActions';
import { SAMPLE_RECEIPTS } from '../receipt-data';

export const metadata: Metadata = {
  title: 'A sample Mana Receipt | assembl',
  description:
    'Three sample Mana Receipts — one Practice, one Assembler, one Counsel — so you can see the shape of the signed audit record assembl writes for every run. Download one as JSON or PDF.',
  alternates: { canonical: '/mana-receipts/sample' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'A sample Mana Receipt',
    description: 'The shape of the signed audit record assembl writes for every run.',
    url: 'https://www.assembl.co.nz/mana-receipts/sample',
    type: 'article',
  },
};

export default function SampleReceiptPage() {
  return (
    <main className={styles.root}>
      <div className={styles.heroDash} aria-hidden />
      <section className={styles.hero} style={{ paddingBottom: 56 }}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Trust · Sample Mana Receipts</p>
          <h1 className={styles.h1}>
            This is the shape
            <em>of the proof.</em>
          </h1>
          <p className={styles.sub}>
            Three sample receipts — one from a family agent, one from a business agent, and one from
            the governance layer. These are illustrative, not live runs. Download one to see the
            exact record structure a real run would write.
          </p>
          <Link href="/mana-receipts" className={styles.pill}>
            ← Back to Mana Receipts
          </Link>
        </div>
      </section>

      {SAMPLE_RECEIPTS.map((receipt) => (
        <section key={receipt.id} className={styles.section}>
          <div className={styles.wrap}>
            <p className={styles.receiptCaption}>
              {receipt.bundle} · {receipt.reviewTierLabel}
            </p>
            <ReceiptMock receipt={receipt} />
            <ReceiptActions receipt={receipt} />
          </div>
        </section>
      ))}

      <div className={styles.footerEyebrow}>
        <span>
          Illustrative samples · The project ref matches every live receipt · Built in Aotearoa
        </span>
      </div>
    </main>
  );
}
