'use client';

import styles from '../mana-receipts.module.css';
import type { ManaReceipt } from '../receipt-data';

/**
 * Download affordances for a sample Mana Receipt. JSON is generated client-side
 * from the same fixture the mock renders, so what you download is exactly what
 * you see. "Print / Save as PDF" uses the browser print dialog — a real PDF,
 * no server round-trip.
 */
export function ReceiptActions({ receipt }: { receipt: ManaReceipt }) {
  function downloadJson() {
    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mana-receipt-${receipt.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.actions}>
      <button type="button" onClick={downloadJson} className={`${styles.actionBtn} ${styles.actionPrimary}`}>
        ↓ Download JSON
      </button>
      <button type="button" onClick={() => window.print()} className={styles.actionBtn}>
        ⎙ Print / Save as PDF
      </button>
    </div>
  );
}
