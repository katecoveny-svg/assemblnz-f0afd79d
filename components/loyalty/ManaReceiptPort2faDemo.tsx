'use client';

/**
 * Mana Receipt DEMO visual — wait_type=port_2fa.
 * Assembl brand only. status=DEMO always. Auth path stays clear.
 */

import type { CSSProperties } from 'react';
import {
  ASSEMBL_CANON,
  MANA_RECEIPT_DEMO_DISCLAIMER,
  MANA_RECEIPT_DEMO_SPINE,
  PORT_2FA_MANA_RECEIPT_DEMO,
  formatSampleCredit,
  type ManaReceiptDemoV0,
} from '@/lib/loyalty/mana-receipt-demo';
import './mana-receipt-port-2fa.css';

const THEME = {
  '--mrd-plum': ASSEMBL_CANON.plum,
  '--mrd-mulberry': ASSEMBL_CANON.mulberry,
  '--mrd-heather': ASSEMBL_CANON.heather,
  '--mrd-chalk': ASSEMBL_CANON.chalk,
  '--mrd-paper': ASSEMBL_CANON.paper,
} as CSSProperties;

function PhoneReceipt({ receipt }: { receipt: ManaReceiptDemoV0 }) {
  const stamp = formatSampleCredit(receipt.earn.sample_stamp_nzd);

  return (
    <div className="mrd-phone" aria-label="Phone preview of Mana Receipt DEMO">
      <div className="mrd-phone-bezel" aria-hidden="true">
        <i className="mrd-island" />
        <span className="mrd-status">
          <em>9:41</em>
          <b />
        </span>
      </div>

      <div className="mrd-screen">
        <header className="mrd-appbar">
          <strong>assembl</strong>
          <span>mana receipt</span>
        </header>

        <span className="mrd-phone-demo">status · DEMO</span>

        <div className="mrd-phone-body">
          <p className="mrd-phone-kicker">
            {receipt.wait_type} · {receipt.wait.window}
          </p>
          <h2>{receipt.wait.moment}</h2>

          <p className="mrd-auth-clear">
            <strong>Auth path clear.</strong> 2FA is not slowed or blocked —
            earn sits beside the wait.
          </p>

          <div className="mrd-pulse" aria-hidden="true">
            <i />
          </div>

          <article className="mrd-phone-receipt" aria-label="Mana Receipt DEMO summary">
            <header>
              <span>assembl</span>
              <strong>Mana Receipt</strong>
            </header>
            <dl>
              <div>
                <dt>status</dt>
                <dd>DEMO</dd>
              </div>
              <div>
                <dt>wait</dt>
                <dd>
                  {receipt.wait.label} · {receipt.wait.window}
                </dd>
              </div>
              <div>
                <dt>sample earn</dt>
                <dd>+{stamp} (sample)</dd>
              </div>
              <div>
                <dt>permission</dt>
                <dd>{receipt.earn.permission}</dd>
              </div>
              <div>
                <dt>named human</dt>
                <dd>
                  {receipt.named_human.name} · {receipt.named_human.role}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="mrd-homebar" aria-hidden="true" />
      </div>
    </div>
  );
}

function DetailLedger({ receipt }: { receipt: ManaReceiptDemoV0 }) {
  const rows: { label: string; value: string }[] = [
    { label: 'schema', value: receipt.schema_version },
    { label: 'status', value: receipt.status },
    { label: 'wait_type', value: receipt.wait_type },
    { label: 'receipt_id', value: receipt.receipt_id },
    { label: 'issued_at', value: receipt.issued_at },
    {
      label: 'auth_path',
      value: `${receipt.wait.auth_path} — never slows 2FA`,
    },
    { label: 'context_hash', value: receipt.context_hash },
    { label: 'rules_hash', value: receipt.rules_hash },
    {
      label: 'sample stamp',
      value: `${formatSampleCredit(receipt.earn.sample_stamp_nzd)} → ${receipt.earn.destination_label}`,
    },
    {
      label: 'permission',
      value: `opted in ${receipt.permission.opted_in ? 'yes' : 'no'} · reversible ${receipt.permission.reversible ? 'yes' : 'no'}`,
    },
    { label: 'currency owner', value: receipt.ownership.currency_owner },
    { label: 'evidence owner', value: receipt.ownership.evidence_owner },
    {
      label: 'named human',
      value: `${receipt.named_human.name} · ${receipt.named_human.role}`,
    },
  ];

  return (
    <section className="mrd-detail" aria-labelledby="mrd-detail-title">
      <div className="mrd-detail-head">
        <div>
          <h2 id="mrd-detail-title">Mana Receipt · detail</h2>
          <p>
            Evidence of the wait beside the port. Sample earn only — currency
            stays with the carrier.
          </p>
        </div>
        <span className="mrd-seal">DEMO</span>
      </div>

      <dl className="mrd-grid">
        {rows.map((row) => (
          <div className="mrd-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mrd-note-block">
        <h3>currency_note</h3>
        <p>{receipt.currency_note}</p>
      </div>
    </section>
  );
}

export function ManaReceiptPort2faDemo() {
  const receipt = PORT_2FA_MANA_RECEIPT_DEMO;

  return (
    <main className="mrd" style={THEME}>
      <div className="mrd-atmosphere" aria-hidden="true" />

      <div className="mrd-shell">
        <div className="mrd-top">
          <div className="mrd-brand">
            <strong>assembl</strong>
            <span>journeys · mana receipt</span>
          </div>
          <span className="mrd-demo-pill" role="status">
            <i aria-hidden="true" />
            status = DEMO
          </span>
        </div>

        <section className="mrd-hero" aria-labelledby="mrd-hero-title">
          <div className="mrd-copy">
            <p className="mrd-kicker">wait_type · port_2fa · first mint</p>
            <h1 id="mrd-hero-title">Mana Receipt for a port 2FA wait.</h1>
            <p className="mrd-lede">{MANA_RECEIPT_DEMO_SPINE}</p>

            <div className="mrd-boundary" aria-label="Ownership boundary">
              <p>
                <span>currency</span>
                <strong>{receipt.ownership.currency_owner}</strong>
              </p>
              <p>
                <span>evidence</span>
                <strong>{receipt.ownership.evidence_owner}</strong>
              </p>
            </div>

            <p className="mrd-disclaimer">{MANA_RECEIPT_DEMO_DISCLAIMER}</p>
          </div>

          <div className="mrd-phone-wrap">
            <PhoneReceipt receipt={receipt} />
          </div>
        </section>

        <DetailLedger receipt={receipt} />

        <p className="mrd-foot">
          Schema v0 · mock hashes · route /journeys/mana-receipt · no live
          credit claim
        </p>
      </div>
    </main>
  );
}
