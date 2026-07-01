import type { ReactNode } from 'react';
import styles from './mana-receipts.module.css';
import type { ManaReceipt } from './receipt-data';

/**
 * A visual mock of a Mana Receipt — the signed audit record assembl writes for
 * every run. Pure presentational; data comes from receipt-data.ts so the mock
 * and the downloadable JSON stay in lockstep.
 */
export function ReceiptMock({ receipt }: { receipt: ManaReceipt }) {
  const sealed = receipt.status === 'sealed';

  return (
    <article className={styles.receipt} aria-label={`Mana Receipt ${receipt.id}`}>
      <div className={styles.receiptTop} aria-hidden />

      <header className={styles.receiptHead}>
        <div>
          <p className={styles.receiptKicker}>Mana Receipt · {receipt.id}</p>
          <h3 className={styles.receiptTitle}>{receipt.agent}</h3>
        </div>
        <span className={styles.receiptSeal}>
          {sealed ? '● sealed' : '◌ draft'}
        </span>
      </header>

      <div className={styles.receiptBody}>
        <Row label="Agent ran">{receipt.agent}</Row>
        <Row label="Bundle">{receipt.bundle}</Row>
        <Row label="Review tier">{receipt.reviewTierLabel}</Row>
        <Row label="What it read">{receipt.read}</Row>
        <Row label="What it cited">
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {receipt.cited.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Row>
        <Row label="What was checked">
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {receipt.checked.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Row>
        <Row label="Needs a human">{receipt.needsHuman}</Row>
        <Row label="Model called">
          {receipt.provider}
          <br />
          <span className="mono">{receipt.providerCalledAt}</span>
          <br />
          <span className="mono">{receipt.requestShape}</span>
        </Row>
        <Row label="Project ref">
          <span className="mono">{receipt.projectRef}</span>
        </Row>

        {receipt.ippFlag ? (
          <div className={styles.receiptFlag}>
            <strong>IPP 3A flag</strong>
            {receipt.ippFlag}
          </div>
        ) : null}
      </div>

      <footer className={styles.receiptFoot}>
        <span className={styles.receiptFootMeta}>
          SHA-256
          <br />
          <span style={{ wordBreak: 'break-all' }}>{receipt.sha256}</span>
        </span>
        <span
          className={`${styles.receiptCheck} ${sealed ? '' : styles.receiptCheckPending}`}
        >
          {sealed ? '✓ tamper-evident' : '◌ awaiting human'}
        </span>
      </footer>
    </article>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.receiptRow}>
      <span className={styles.receiptLabel}>{label}</span>
      <div className={styles.receiptValue}>{children}</div>
    </div>
  );
}
