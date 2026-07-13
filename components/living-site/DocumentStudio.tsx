'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import type { LivingSiteDocument, LivingSiteDocumentKind } from '@/lib/living-site/document-store';
import { commercialDocumentNumber, documentTotals, nzd, priceFromGenome } from '@/lib/living-site/documents';
import type { SampleVertical } from '@/lib/living-site/verticals';
import styles from './living-site-tools.module.css';

export function DocumentStudio({
  v,
  tenant,
  services,
  issueDate,
  issueYear,
  initialDocuments,
}: {
  v: SampleVertical;
  tenant: string;
  services: GenomeFact[];
  issueDate: string;
  issueYear: number;
  initialDocuments: LivingSiteDocument[];
}) {
  const first = services[0];
  const [kind, setKind] = useState<LivingSiteDocumentKind>('proposal');
  const [client, setClient] = useState('');
  const [email, setEmail] = useState('');
  const [serviceId, setServiceId] = useState(first?.id ?? '');
  const [description, setDescription] = useState(first?.label ?? 'Professional services');
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(priceFromGenome(first?.value ?? ''));
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [savedNumber, setSavedNumber] = useState('');
  const [documents, setDocuments] = useState(initialDocuments);
  const totals = useMemo(() => documentTotals(quantity, rate), [quantity, rate]);
  const documentNumber = savedNumber || `${kind === 'proposal' ? 'P' : 'INV'}-${issueYear}-DRAFT`;
  const localStorageKey = `assembl:living-site-documents:${tenant}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const local = JSON.parse(window.localStorage.getItem(localStorageKey) ?? '[]') as LivingSiteDocument[];
        if (!Array.isArray(local)) return;
        setDocuments((current) => {
          const ids = new Set(current.map((item) => item.id));
          return [...current, ...local.filter((item) => !ids.has(item.id))]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 12);
        });
      } catch {
        // A malformed browser draft must not break the studio.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [localStorageKey]);

  const markDirty = () => {
    setSavedNumber('');
    setNotice('');
    setError('');
  };

  const chooseService = (id: string) => {
    const service = services.find((item) => item.id === id);
    markDirty();
    setServiceId(id);
    setDescription(service?.label ?? 'Professional services');
    setRate(priceFromGenome(service?.value ?? ''));
  };

  const saveDraft = async () => {
    setError('');
    setNotice('');
    if (!client.trim() || !email.trim() || !serviceId || !description.trim()) {
      setError('Add the customer, valid email, service and description before saving.');
      return;
    }
    setBusy(true);
    const saveToBrowser = (reason: string) => {
      const id = window.crypto.randomUUID();
      const now = new Date().toISOString();
      const local: LivingSiteDocument = {
        id,
        tenant,
        kind,
        documentNumber: `LOCAL-${commercialDocumentNumber(kind, id)}`,
        clientName: client.trim(),
        clientEmail: email.trim(),
        serviceId,
        description: description.trim(),
        quantity,
        unitPriceNzd: rate,
        subtotalNzd: totals.subtotal,
        gstNzd: totals.gst,
        totalNzd: totals.total,
        notes: notes.trim() || null,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      };
      const existing = (() => {
        try {
          const value = JSON.parse(window.localStorage.getItem(localStorageKey) ?? '[]');
          return Array.isArray(value) ? value as LivingSiteDocument[] : [];
        } catch {
          return [];
        }
      })();
      window.localStorage.setItem(localStorageKey, JSON.stringify([local, ...existing].slice(0, 12)));
      setSavedNumber(local.documentNumber);
      setDocuments((current) => [local, ...current.filter((item) => item.id !== local.id)].slice(0, 12));
      setNotice(`${local.documentNumber} saved in this browser only because ${reason}. Apply the document migration to enable the shared tenant record.`);
    };
    try {
      const response = await fetch('/api/living-site/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant,
          kind,
          clientName: client,
          clientEmail: email,
          serviceId,
          description,
          quantity,
          unitPriceNzd: rate,
          notes,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.document) {
        if (response.status === 503) {
          saveToBrowser(result.error ?? 'the shared document store is unavailable');
          return;
        }
        throw new Error(result.error ?? 'Could not save the draft.');
      }
      const saved = result.document as LivingSiteDocument;
      setSavedNumber(saved.documentNumber);
      setDocuments((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 12));
      setNotice(`${saved.documentNumber} saved as a draft. It has not been approved, sent or entered into the books.`);
    } catch (cause) {
      saveToBrowser(cause instanceof Error ? cause.message : 'the shared document store could not be reached');
    } finally {
      setBusy(false);
    }
  };

  const reopen = (document: LivingSiteDocument) => {
    setKind(document.kind);
    setClient(document.clientName);
    setEmail(document.clientEmail);
    setServiceId(document.serviceId);
    setDescription(document.description);
    setQuantity(document.quantity);
    setRate(document.unitPriceNzd);
    setNotes(document.notes ?? '');
    setSavedNumber(document.documentNumber);
    setError('');
    setNotice(`${document.documentNumber} reopened. Editing a field creates a new unsaved draft; the stored record remains unchanged.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      'Ngā mihi,',
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
        <h2>Draft, save and reopen the commercial paperwork.</h2>
        <p>Choose a service, adjust the scope, and create a GST-calculated proposal or invoice. Each save receives a durable reference. A person still reviews every detail before it is approved, sent or entered into the books.</p>
      </section>
      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>document inputs</p>
          <h2>Build the draft</h2>
          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <div className={styles.formRow}>
              <label>Document type<select value={kind} onChange={(event) => { markDirty(); setKind(event.target.value as LivingSiteDocumentKind); }}><option value="proposal">Proposal</option><option value="invoice">Invoice</option></select></label>
              <label>Service<select value={serviceId} onChange={(event) => chooseService(event.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}</select></label>
            </div>
            <div className={styles.formRow}>
              <label>Customer name<input value={client} onChange={(event) => { markDirty(); setClient(event.target.value); }} placeholder="Alex Morgan" /></label>
              <label>Customer email<input type="email" value={email} onChange={(event) => { markDirty(); setEmail(event.target.value); }} placeholder="alex@example.co.nz" /></label>
            </div>
            <label>Description<input value={description} onChange={(event) => { markDirty(); setDescription(event.target.value); }} /></label>
            <div className={styles.formRow}>
              <label>Quantity<input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => { markDirty(); setQuantity(Number(event.target.value)); }} /></label>
              <label>Unit price · NZD ex GST<input type="number" min="0" step="0.01" value={rate} onChange={(event) => { markDirty(); setRate(Number(event.target.value)); }} /></label>
            </div>
            <label>Scope or payment notes<textarea rows={5} value={notes} onChange={(event) => { markDirty(); setNotes(event.target.value); }} placeholder={kind === 'proposal' ? 'What is included, timing, exclusions, acceptance terms…' : 'Payment due date, reference, bank details…'} /></label>
            <div className={styles.buttonRow}>
              <button className={styles.primaryButton} type="button" disabled={busy} onClick={() => void saveDraft()}>{busy ? 'saving…' : savedNumber ? 'Save as a new draft' : 'Save draft'}</button>
              <button className={styles.secondaryButton} type="button" onClick={() => window.print()}>Print / save PDF</button>
              <button className={styles.secondaryButton} type="button" onClick={() => void copyEmail()}>Copy covering email</button>
            </div>
            {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
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

      <section className={`${styles.card} ${styles.savedDocuments}`}>
        <div>
          <p className={styles.eyebrow}>saved drafts · newest first</p>
          <h2>Commercial record</h2>
          <p className={styles.cardLead}>Saved drafts are immutable. Reopen one to print it or use it as the starting point for a new version.</p>
        </div>
        <div className={styles.savedDocumentGrid}>
          {documents.length ? documents.map((document) => (
            <button type="button" key={document.id} className={styles.savedDocument} onClick={() => reopen(document)}>
              <span className={styles.status}>{document.status}</span>
              <strong>{document.documentNumber}</strong>
              <span>{document.clientName}</span>
              <span>{document.description}</span>
              <b>{nzd(document.totalNzd)}</b>
              <small>Reopen draft →</small>
            </button>
          )) : <div className={styles.empty}>No saved commercial drafts yet. Complete the customer details above and choose Save draft.</div>}
        </div>
      </section>
    </>
  );
}
