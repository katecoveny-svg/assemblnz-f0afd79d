'use client';

import { useMemo, useState } from 'react';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { documentTotals, nzd, priceFromGenome } from '@/lib/living-site/documents';
import type { SampleVertical } from '@/lib/living-site/verticals';
import styles from './living-site-tools.module.css';

type DraftType = 'proposal' | 'invoice';

export function DocumentStudio({
  v,
  services,
  issueDate,
  issueYear,
}: {
  v: SampleVertical;
  services: GenomeFact[];
  issueDate: string;
  issueYear: number;
}) {
  const first = services[0];
  const [kind, setKind] = useState<DraftType>('proposal');
  const [client, setClient] = useState('');
  const [email, setEmail] = useState('');
  const [serviceId, setServiceId] = useState(first?.id ?? '');
  const [description, setDescription] = useState(first?.label ?? 'Professional services');
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(priceFromGenome(first?.value ?? ''));
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const totals = useMemo(() => documentTotals(quantity, rate), [quantity, rate]);
  const documentNumber = `${kind === 'proposal' ? 'P' : 'INV'}-${issueYear}-001`;

  const chooseService = (id: string) => {
    const service = services.find((item) => item.id === id);
    setServiceId(id);
    setDescription(service?.label ?? 'Professional services');
    setRate(priceFromGenome(service?.value ?? ''));
  };

  const copyEmail = async () => {
    const subject = `${kind === 'proposal' ? 'Proposal' : 'Draft invoice'} ${documentNumber} from ${v.businessName}`;
    const body = [
      `Kia ora ${client || 'there'},`,
      '',
      `Attached is ${kind === 'proposal' ? 'our proposal' : 'your draft invoice'} for ${description}.`,
      `Total: ${nzd(totals.total)} including GST.`,
      '',
      kind === 'proposal' ? 'Please reply with any questions. Nothing begins until you approve the scope.' : 'Please review the details before this invoice is issued.',
      '',
      `Ngā mihi,`,
      v.owner,
      v.businessName,
    ].join('\n');
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setNotice('Draft email copied. Review it before sending.');
  };

  return (
    <>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>documents · Business Genome pricing</p>
        <h2>Draft the commercial paperwork now.</h2>
        <p>Choose a service, adjust the scope, and create a GST-calculated proposal or invoice. Print to PDF when it is ready; a person reviews every detail before it is sent or entered into the books.</p>
      </section>
      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>document inputs</p>
          <h2>Build the draft</h2>
          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <div className={styles.formRow}>
              <label>Document type<select value={kind} onChange={(event) => setKind(event.target.value as DraftType)}><option value="proposal">Proposal</option><option value="invoice">Invoice</option></select></label>
              <label>Service<select value={serviceId} onChange={(event) => chooseService(event.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}</select></label>
            </div>
            <div className={styles.formRow}>
              <label>Customer name<input value={client} onChange={(event) => setClient(event.target.value)} placeholder="Alex Morgan" /></label>
              <label>Customer email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@example.co.nz" /></label>
            </div>
            <label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} /></label>
            <div className={styles.formRow}>
              <label>Quantity<input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label>
              <label>Unit price · NZD ex GST<input type="number" min="0" step="0.01" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
            </div>
            <label>Scope or payment notes<textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={kind === 'proposal' ? 'What is included, timing, exclusions, acceptance terms…' : 'Payment due date, reference, bank details…'} /></label>
            <div className={styles.buttonRow}>
              <button className={styles.primaryButton} type="button" onClick={() => window.print()}>Print / save PDF</button>
              <button className={styles.secondaryButton} type="button" onClick={() => void copyEmail()}>Copy covering email</button>
            </div>
            {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
          </form>
        </section>

        <section className={styles.preview} aria-label={`${kind} preview`}>
          <div className={styles.documentMeta}>
            <div><p className={styles.eyebrow}>{v.businessName}</p><h2>{kind === 'proposal' ? 'Proposal' : 'Tax invoice'}</h2><p>{v.tagline}</p></div>
            <div><strong>{documentNumber}</strong><p>{issueDate}</p><p>NZD · GST 15%</p></div>
          </div>
          <div className={styles.documentTo}>
            <p className={styles.eyebrow}>{kind === 'proposal' ? 'prepared for' : 'bill to'}</p>
            <h3>{client || 'Customer name'}</h3>
            <p>{email || 'customer@example.co.nz'}</p>
          </div>
          <table className={styles.lineTable}>
            <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody><tr><td>{description || 'Professional services'}</td><td>{quantity}</td><td>{nzd(rate)}</td><td>{nzd(totals.subtotal)}</td></tr></tbody>
          </table>
          <div className={styles.totals}>
            <p><span>Subtotal</span><strong>{nzd(totals.subtotal)}</strong></p>
            <p><span>GST · 15%</span><strong>{nzd(totals.gst)}</strong></p>
            <p><span>Total NZD</span><strong>{nzd(totals.total)}</strong></p>
          </div>
          {notes ? <p className={styles.approval}>{notes}</p> : null}
          <p className={styles.approval}>Draft generated from the Business Genome. Check scope, GST registration, payment details and customer information before sending or recording it.</p>
        </section>
      </div>
    </>
  );
}
