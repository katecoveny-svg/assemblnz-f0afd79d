'use client';

import { useState } from 'react';
import { DRAFTS, INVOICE_INV3031, PRICING } from '@/lib/tenants/happy-tails/data';

type Tab = 'sms' | 'email' | 'xero';

/**
 * Channel-aware draft surface. The same content renders in the right voice per
 * channel: SMS = Mathis (casual, "Thanks Mathis 😀"), Email = Liana (warm formal,
 * "Warmly, Liana × Happy Tails"), Xero = formal invoice. Never mixed (locked hard rule).
 * Every draft is human-approved before it goes out — Keeper never sends.
 */
export function DraftSurface() {
  const [tab, setTab] = useState<Tab>('email');

  return (
    <div>
      <div className="toggle" role="tablist" aria-label="Draft channel">
        <button type="button" role="tab" aria-selected={tab === 'sms'} className={tab === 'sms' ? 'on' : undefined} onClick={() => setTab('sms')}>💬 SMS · Mathis</button>
        <button type="button" role="tab" aria-selected={tab === 'email'} className={tab === 'email' ? 'on' : undefined} onClick={() => setTab('email')}>✉ Email · Liana</button>
        <button type="button" role="tab" aria-selected={tab === 'xero'} className={tab === 'xero' ? 'on' : undefined} onClick={() => setTab('xero')}>▤ Xero · formal</button>
      </div>

      <div className="draftbox">
        <div className="dhd">
          <span className="voicelbl">
            {tab === 'sms' && 'SMS channel · Mathis’s voice · casual, brief, single 😀'}
            {tab === 'email' && 'Email channel · Liana’s voice · warm, formal, no emoji in body'}
            {tab === 'xero' && 'Xero channel · formal invoice · GST-inclusive, 7-day terms'}
          </span>
        </div>

        <div className="draftbody">
          {tab === 'sms' && (
            <>
              <div className="bubble">{DRAFTS.sms.nextDayPickup}</div>
              <p className="note" style={{ marginTop: 12 }}>
                Pre-pickup checklist rides along: <b>fed · toileted · collar + tag</b>. Mathis taps approve, sends from his own phone.
              </p>
            </>
          )}

          {tab === 'email' && (
            <>
              <div className="subj">Subject: {DRAFTS.email.welcomePackSubject}</div>
              {DRAFTS.email.welcomePackBody.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <p className="sign">{DRAFTS.email.welcomePackBody.length > 0 ? 'Warmly,' : ''}<br />Liana × Happy Tails</p>
            </>
          )}

          {tab === 'xero' && (
            <table className="invtable" style={{ marginTop: 4 }}>
              <thead>
                <tr><th>Service</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Amount</th></tr>
              </thead>
              <tbody>
                {INVOICE_INV3031.lines.map((l, i) => (
                  <tr key={i}>
                    <td><span className="svc">{l.service}</span><br /><span style={{ color: 'var(--mute)' }}>{l.note}</span></td>
                    <td className="r">{l.qty ?? '—'}</td>
                    <td className="r">{l.rate ? `$${l.rate.toFixed(2)}` : '—'}</td>
                    <td className="r">${l.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="totrow"><td colSpan={3}>Total (GST inclusive) · {PRICING.terms}</td><td className="r">NZ${INVOICE_INV3031.total.toFixed(2)}</td></tr>
              </tbody>
            </table>
          )}
        </div>

        <div className="dactions">
          <span className="note">✎ editable · Keeper drafts, human approves</span>
          <button type="button" className="btn g" style={{ marginLeft: 'auto' }}>Regenerate</button>
          <button type="button" className={`btn ${tab === 'xero' ? 'x' : 'p'}`}>{tab === 'xero' ? 'Approve draft in Xero' : 'Approve + send'}</button>
        </div>
      </div>
    </div>
  );
}
