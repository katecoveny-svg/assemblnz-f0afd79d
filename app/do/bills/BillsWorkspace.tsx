'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { DoProductFrame } from '@/components/do/DoProductFrame';
import { billCalendar, matchInvoices, recurringPayments, type RecurringPayment } from '@/apps/do/finance/analysis';
import { editFinancialDraft, financialReceipt, prepareFinancialDraft, reviewFinancialDraft, type FinancialAction, type FinancialDraft } from '@/apps/do/finance/actions';
import { financialCsv, FINANCIAL_CSV_EXAMPLE, FINANCIAL_CSV_LIMIT } from '@/apps/do/finance/csv';
import { DEMO_CHECKED_INVOICES, DEMO_FINANCIAL_SNAPSHOT } from '@/apps/do/finance/demo';
import { checkedInvoice, moneyText, parseCents, type CheckedInvoice, type FinancialSnapshot } from '@/apps/do/finance/model';
import styles from './bills-workspace.module.css';

function today() {
  const parts = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-');
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
}
function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function emptySnapshot(): FinancialSnapshot {
  return { mode: 'csv', asOf: today(), fetchedAt: new Date().toISOString(), accounts: [], transactions: [], complete: false, notices: ['Only records you choose to add are shown. No account is connected.'] };
}

export function BillsWorkspace() {
  const [snapshot, setSnapshot] = useState(DEMO_FINANCIAL_SNAPSHOT);
  const [invoices, setInvoices] = useState(DEMO_CHECKED_INVOICES);
  const [draft, setDraft] = useState<FinancialDraft | null>(null);
  const [reviewer, setReviewer] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef<HTMLElement>(null);
  const demo = snapshot.mode === 'demo';
  const recurring = useMemo(() => recurringPayments(snapshot), [snapshot]);
  const calendar = useMemo(() => billCalendar(invoices, snapshot.asOf), [invoices, snapshot.asOf]);
  const matches = useMemo(() => matchInvoices(invoices, snapshot), [invoices, snapshot]);
  const increases = recurring.filter(value => value.increase);
  const renewals = invoices.filter(value => value.renewalOn && value.renewalOn >= snapshot.asOf && value.renewalOn <= calendar.end);
  const overdue = invoices.filter(value => !value.paidConfirmed && value.dueOn && value.dueOn < snapshot.asOf);
  function replaceData(next: FinancialSnapshot, bills: CheckedInvoice[]) {
    setSnapshot(next); setInvoices(bills); setDraft(null); setReviewer(''); setError(''); setConsent(false);
    if (fileRef.current) fileRef.current.value = '';
  }
  async function importCsv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!consent || !file) { setError('Choose a CSV and confirm it contains NZD transactions.'); return; }
    if (file.size > FINANCIAL_CSV_LIMIT) { setError('Choose a CSV under 256 KB.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const next = financialCsv(await file.text(), today(), new Date().toISOString());
      // Validate the whole file and analysis before replacing any current work.
      recurringPayments(next);
      replaceData(next, []);
      setMessage('CSV opened locally. Previous records and drafts were cleared. Add checked invoices to establish due dates.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The CSV could not be opened. Current work was kept.'); }
    finally { setBusy(false); }
  }
  function addInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (demo || busy) return;
    const form = event.currentTarget, data = new FormData(form);
    const get = (key: string) => String(data.get(key) || '').trim();
    setError(''); setMessage('');
    try {
      if (invoices.length >= 50) throw new Error('Keep up to 50 checked bills in this session.');
      if (data.get('checked') !== 'on') throw new Error('Check these details against the actual invoice or notice first.');
      const invoice = checkedInvoice.parse({
        id: crypto.randomUUID(), payee: get('payee'), invoiceReference: get('reference'),
        amount: { amount: parseCents(get('amount')), currency: 'NZD' },
        direction: 'payable', issuedOn: get('issuedOn'), dueOn: get('dueOn') || null,
        renewalOn: get('renewalOn') || null, paidConfirmed: data.get('paid') === 'on',
        checkedAt: new Date().toISOString(), sourceLabel: get('source'), demo: false,
      });
      if (invoice.issuedOn > snapshot.asOf) throw new Error('The invoice date must be on or before the date of this view.');
      setInvoices(values => [...values, invoice]); form.reset(); setMessage('Checked bill added. You can now prepare an enquiry.');
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== 'ZodError' ? cause.message : 'Check all required details, use real dates and an amount above zero. A due date cannot precede the invoice date.');
    }
  }
  async function prepare(target: RecurringPayment | CheckedInvoice, action: FinancialAction) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      setDraft(await prepareFinancialDraft(target, action, demo));
      setReviewer(''); setMessage('Enquiry prepared. Check and edit it below.');
      requestAnimationFrame(() => draftRef.current?.focus());
    } catch { setError('The draft could not be prepared. Please try again.'); }
    finally { setBusy(false); }
  }
  async function review() {
    if (!draft || busy) return;
    setBusy(true); setError('');
    try { setDraft(await reviewFinancialDraft(draft, reviewer)); setMessage('Review recorded for this text. Nothing has been sent.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Review could not be recorded.'); }
    finally { setBusy(false); }
  }
  async function copyDraft() {
    if (!draft) return;
    try { await navigator.clipboard.writeText(draft.text); setMessage('Draft copied. Check the recipient and context before sending it yourself.'); }
    catch { setError('Copy was unavailable. Select the text to copy, or download the draft and evidence.'); }
  }

  return <DoProductFrame product="bills">
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="bills-title">
        <p className={styles.kicker}>DO BILLS · LESS ADMIN, MORE MAHI.</p>
        <h1 id="bills-title">Know what’s coming.<br />Get the next step ready.</h1>
        <p>Find recurring payments, check bill dates and prepare the questions worth asking.</p>
        <Link className={styles.textLink} href="/do/bills/compare">Compare a bill against current offers ↗</Link>
      </section>

      <section className={styles.sourcePanel} aria-labelledby="source-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}>{demo ? 'FICTIONAL HOUSEHOLD' : 'YOUR RECORDS · THIS PAGE ONLY'}</p>
            <h2 id="source-title">{demo ? 'Try the example.' : 'Your bill check.'}</h2></div>
          <span className={styles.badge}>No bank connected</span>
        </div>
        <p>{demo ? 'All names, transactions and invoices below are fictional. Explore the complete draft-and-review flow.' : 'CSV rows and checked bills stay in this open page. Download any draft you want to keep before leaving or refreshing.'}</p>
        <p className={styles.small}>View as at {dateLabel(snapshot.asOf)}. Importing a CSV or changing mode clears the current records and draft.</p>
        <div className={styles.buttons}>
          <button type="button" disabled={busy || demo} onClick={() => { replaceData(DEMO_FINANCIAL_SNAPSHOT, DEMO_CHECKED_INVOICES); setMessage('Fictional example restored.'); }}>Use example</button>
          <button type="button" disabled={busy} onClick={() => { replaceData(emptySnapshot(), []); setMessage('Started a fresh, empty bill check.'); }}>{demo ? 'Start with my own bills' : 'Clear my records'}</button>
        </div>
        <details className={styles.details}>
          <summary>Open a bank CSV locally</summary>
          <p>Use one NZD account with Date, Description (or Details/Payee) and Amount columns. Money out must be negative. Optional columns: Currency and Reference. Maximum 2,000 rows, 256 KB.</p>
          <p className={styles.small}>No upload or AI service is used for this check. CSVs do not establish due dates, coverage or whether a payment has settled. Repeated transfers can look like bills.</p>
          <form onSubmit={event => void importCsv(event)} className={styles.form}>
            <label>Transaction CSV<input ref={fileRef} type="file" accept=".csv,text/csv" disabled={busy} required /></label>
            <label className={styles.check}><input type="checkbox" checked={consent} disabled={busy} onChange={event => setConsent(event.target.checked)} /><span>This file contains NZD transactions from one account. Analyse it in this page and replace the current records.</span></label>
            <div className={styles.buttons}>
              <button disabled={busy || !consent} className={styles.primary}>{busy ? 'Working…' : 'Open CSV'}</button>
              <button type="button" disabled={busy} onClick={() => download('do-bills-example.csv', FINANCIAL_CSV_EXAMPLE, 'text/csv;charset=utf-8')}>Download example CSV</button>
            </div>
          </form>
        </details>
      </section>

      <p className={styles.feedback} role={error ? 'alert' : 'status'} aria-live="polite">{error || message}</p>

      <section className={styles.metrics} aria-label="Bill check summary">
        <div><p className={styles.kicker}>CHECKED DUE · NEXT 30 DAYS</p><strong>{calendar.totals.length ? calendar.totals.map(moneyText).join(' + ') : 'None added'}</strong><p>{calendar.due.length} {demo ? 'example bills' : 'bills with checked dates'} · through {dateLabel(calendar.end)}</p></div>
        <div><p className={styles.kicker}>RECURRING CANDIDATES</p><strong>{recurring.length}</strong><p>At least three recorded payments</p></div>
        <div><p className={styles.kicker}>WORTH CHECKING</p><strong>{increases.length + renewals.length + overdue.length}</strong><p>{increases.length} higher charges · {renewals.length} renewals · {overdue.length} past due dates</p></div>
      </section>

      <div className={styles.columns}>
        <section aria-labelledby="recurring-title">
          <div className={styles.sectionHead}><div><p className={styles.kicker}>01 · FIND</p><h2 id="recurring-title">Payments to look at.</h2></div></div>
          <p className={styles.small}>Candidates from the supplied records. Check the merchant, service and usage before deciding a charge is wrong.</p>
          {recurring.length === 0 && <div className={styles.empty}>No recurring pattern found. Add at least three payments to the same merchant, or add a checked bill.</div>}
          <div className={styles.cards}>{recurring.map(payment => <article key={payment.id} className={styles.card}>
            <div className={styles.sectionHead}><h3>{payment.merchant}</h3><strong>{moneyText(payment.amount)}</strong></div>
            <p>Latest recorded payment · {dateLabel(payment.lastPaidOn)}</p>
            {payment.increase && <p className={styles.callout}>{moneyText({ amount: payment.increase.extraAmount, currency: payment.amount.currency })} above the earlier median ({payment.increase.percent}%). Usage or fees may explain this.</p>}
            <p className={styles.small}>{payment.expectedOn ? 'Pattern estimate: ' + dateLabel(payment.expectedOn) + '. This is not an invoice due date.' : 'Timing is irregular. No next-payment date estimated.'}</p>
            {payment.expectedOn && payment.expectedOn < snapshot.asOf && <p className={styles.small}>The estimated date has passed. Check for missing records; no overdue bill is inferred.</p>}
            <details className={styles.details}><summary>See {payment.observations.length} source records</summary><ul>{payment.observations.map(row => <li key={row.id}>{dateLabel(row.date)} · {moneyText({ ...row.amount, amount: -row.amount.amount })}<br /><span className={styles.small}>{row.source.reference}</span></li>)}</ul></details>
            <div className={styles.buttons}><button disabled={busy} onClick={() => void prepare(payment, payment.increase ? 'query-charge' : 'request-options')}>{payment.increase ? 'Prepare a charge enquiry' : 'Ask about my options'}</button></div>
          </article>)}</div>
        </section>

        <section aria-labelledby="calendar-title">
          <div className={styles.sectionHead}><div><p className={styles.kicker}>02 · CHECK</p><h2 id="calendar-title">Dates from the bill.</h2></div></div>
          <p className={styles.small}>Dates come from checked invoices or renewal notices. Transaction timing is never used as a due date.</p>
          {invoices.length === 0 && <div className={styles.empty}>No checked bills yet. Add details from an actual invoice or notice below.</div>}
          <div className={styles.cards}>{[...invoices].sort((a, b) => (a.dueOn || '9999').localeCompare(b.dueOn || '9999')).map(invoice => <article key={invoice.id} className={styles.card}>
            <div className={styles.sectionHead}><h3>{invoice.payee}</h3><strong>{moneyText(invoice.amount)}</strong></div>
            <p>{invoice.paidConfirmed ? 'Marked paid by you' : invoice.dueOn ? 'Checked due date · ' + dateLabel(invoice.dueOn) : 'Due date not established'}</p>
            {invoice.renewalOn && <p className={styles.callout}>Renewal notice · {dateLabel(invoice.renewalOn)}</p>}
            {!invoice.paidConfirmed && invoice.dueOn && invoice.dueOn < snapshot.asOf && <p className={styles.callout}>Due date has passed. Check the current payment status.</p>}
            <p className={styles.small}>{invoice.sourceLabel} · {invoice.invoiceReference}</p>
            {matches.find(match => match.invoiceId === invoice.id)?.status === 'possible-match' && <p className={styles.small}>A transaction has the same reference and amount. Review it; this bill has not been marked paid.</p>}
            {matches.find(match => match.invoiceId === invoice.id)?.status === 'ambiguous' && <p className={styles.small}>Several transactions match. Check for duplicates before deciding the payment status.</p>}
            <div className={styles.buttons}>
              <button disabled={busy} onClick={() => void prepare(invoice, invoice.renewalOn ? 'review-renewal' : 'check-payment')}>{invoice.renewalOn ? 'Prepare renewal questions' : 'Prepare a payment enquiry'}</button>
              {!demo && <button disabled={busy} onClick={() => setInvoices(values => values.map(value => value.id === invoice.id ? { ...value, paidConfirmed: !value.paidConfirmed } : value))}>{invoice.paidConfirmed ? 'Mark unconfirmed' : 'I have checked: paid'}</button>}
              {!demo && <button disabled={busy} onClick={() => setInvoices(values => values.filter(value => value.id !== invoice.id))}>Remove bill</button>}
            </div>
          </article>)}</div>
          {!demo && <details className={styles.details}>
            <summary>Add a checked bill or renewal</summary>
            <form className={styles.form} onSubmit={addInvoice}><fieldset disabled={busy}>
              <label>Provider or business<input name="payee" autoComplete="off" maxLength={160} required /></label>
              <label>Invoice or notice reference<input name="reference" autoComplete="off" maxLength={160} required /></label>
              <label>Amount including GST (NZD)<input name="amount" inputMode="decimal" placeholder="89.00" required /></label>
              <label>Invoice or notice date<input name="issuedOn" type="date" max={snapshot.asOf} required /></label>
              <label>Due date, if stated<input name="dueOn" type="date" /></label>
              <label>Renewal date, if stated<input name="renewalOn" type="date" /></label>
              <label>Source you checked<input name="source" placeholder="September invoice PDF, page 1" maxLength={240} required /></label>
              <label className={styles.check}><input name="paid" type="checkbox" /><span>I have confirmed this bill is already paid.</span></label>
              <label className={styles.check}><input name="checked" type="checkbox" required /><span>I checked these figures and dates against the actual invoice or notice. Blank dates are unknown.</span></label>
              <button className={styles.primary}>Add checked bill</button>
            </fieldset></form>
          </details>}
        </section>
      </div>

      <section ref={draftRef} tabIndex={-1} className={styles.draftPanel} aria-labelledby="draft-title">
        <p className={styles.kicker}>03 · PREPARE → REVIEW → KEEP THE EVIDENCE</p>
        <h2 id="draft-title">{draft ? draft.title : 'A useful next step, ready to check.'}</h2>
        {draft ? <>
          <p>{draft.mode === 'demo' ? 'Fictional example draft. ' : ''}Nothing has been sent. Preparing another enquiry replaces this draft; download it first if you want to keep it.</p>
          <label className={styles.draftLabel}>Edit your enquiry<textarea rows={12} maxLength={12000} disabled={busy} value={draft.text} onChange={event => setDraft(editFinancialDraft(draft, event.target.value))} /></label>
          <p className={styles.small}>Any edit clears the previous review. Reviewing records your check of this text; it does not authorise a payment, cancellation or provider change.</p>
          <label className={styles.draftLabel}>Your name for the review<input value={reviewer} maxLength={100} disabled={busy} autoComplete="off" onChange={event => setReviewer(event.target.value)} /></label>
          <div className={styles.buttons}>
            <button className={styles.primary} disabled={busy || !reviewer.trim() || !draft.text.trim() || draft.status === 'reviewed'} onClick={() => void review()}>{draft.status === 'reviewed' ? 'Review recorded' : 'Mark this text reviewed'}</button>
            <button disabled={busy} onClick={() => void copyDraft()}>Copy draft</button>
            <button disabled={busy} onClick={() => { download('do-bills-' + draft.mode + '-' + draft.id + '.json', JSON.stringify(financialReceipt(draft), null, 2), 'application/json'); setMessage('Draft and evidence downloaded. Keep the file private; it contains financial details.'); }}>Download draft + evidence</button>
          </div>
          <ol className={styles.evidence}>{financialReceipt(draft).steps.map(step => <li key={step.stage}><strong>{step.stage}</strong><p>{step.detail}</p></li>)}</ol>
          {draft.review && <p className={styles.small}>Reviewed by {draft.review.reviewer} · {draft.review.at}. Applies to the saved text fingerprint.</p>}
          <details className={styles.details}><summary>Source references and record limits</summary>
            <ul>{draft.evidence.sources.map(source => <li key={source.id}>{source.label}<br /><span className={styles.small}>Captured {source.capturedAt}</span></li>)}</ul>
            <p className={styles.small}>The download includes source references and SHA-256 fingerprints. It is a local preparation record, not a signed execution receipt. Original records are not included; retain your source documents separately.</p>
          </details>
        </> : <p>Choose an enquiry above. DO assembles the recorded facts into an editable draft, then records your review. You decide whether to send it.</p>}
      </section>

      <aside className={styles.connector} aria-labelledby="connector-title">
        <div className={styles.sectionHead}><h2 id="connector-title">Bank connection</h2><span className={styles.badge}>Not enabled</span></div>
        <p>Redbark is planned as an optional, read-only source for DO Bills, Money, Business and Tradie. This release uses the example or your local CSV. It does not connect to your bank.</p>
        <p className={styles.small}>Connecting later will require your own authorisation and account choices. Sending, cancelling, switching and payments each need a separate approved action.</p>
        {snapshot.notices.map(notice => <p className={styles.small} key={notice}>{notice}</p>)}
      </aside>
    </div>
  </DoProductFrame>;
}
