'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { CalendarCheck, ShieldCheck } from 'lucide-react';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import type { VerticalPalette } from '@/lib/living-site/verticals';
import styles from './sample.module.css';

type BookingState = 'idle' | 'sending' | 'sent' | 'error';

export function SampleBookingForm({
  tenant,
  owner,
  services,
  palette,
  initialServiceId,
}: {
  tenant: string;
  owner: string;
  services: GenomeFact[];
  palette: VerticalPalette;
  initialServiceId?: string;
}) {
  const [state, setState] = useState<BookingState>('idle');
  const [error, setError] = useState('');
  const [serviceId, setServiceId] = useState(initialServiceId ?? services[0]?.id ?? '');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setError('');
    const form = new FormData(event.currentTarget);
    const service = services.find((item) => item.id === serviceId);
    try {
      const response = await fetch('/api/living-site/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant,
          serviceId,
          serviceLabel: service?.label ?? 'Service request',
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          preferredDate: form.get('preferredDate'),
          preferredTime: form.get('preferredTime'),
          notes: form.get('notes'),
          website: form.get('website'),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error ?? 'Could not save the request.');
      setState('sent');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the request.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div
        className={styles.success}
        role="status"
        style={{ '--sample-accent': palette.accent, '--sample-muted': palette.muted } as CSSProperties}
      >
        <CalendarCheck aria-hidden />
        <h3>Request received.</h3>
        <p>{owner} will check the diary and confirm the time with you. Nothing has been charged or booked yet.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} style={{ '--sample-accent': palette.accent, '--sample-ink': palette.ink, '--sample-card': palette.card, '--sample-muted': palette.muted } as CSSProperties}>
      <div className={styles.honeypot} aria-hidden>
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label>
        Service
        <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} required>
          {services.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}
        </select>
      </label>
      <div className={styles.formRow}>
        <label>Your name<input name="name" autoComplete="name" required maxLength={120} /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} /></label>
      </div>
      <div className={styles.formRow}>
        <label>Phone <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label>Preferred day<input name="preferredDate" type="date" required /></label>
      </div>
      <label>
        Preferred time
        <select name="preferredTime" required defaultValue="">
          <option value="" disabled>Select a window</option>
          <option value="Morning · 8am–11am">Morning · 8am–11am</option>
          <option value="Midday · 11am–2pm">Midday · 11am–2pm</option>
          <option value="Afternoon · 2pm–5pm">Afternoon · 2pm–5pm</option>
          <option value="Evening · after 5pm">Evening · after 5pm</option>
        </select>
      </label>
      <label>Anything we should know? <span>(optional)</span><textarea name="notes" rows={4} maxLength={1500} /></label>
      {state === 'error' ? <p className={styles.error} role="alert">{error}</p> : null}
      <button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'saving…' : 'request this time'}
      </button>
      <p className={styles.reviewNote}><ShieldCheck aria-hidden /> This is a request, not a confirmed booking. {owner} checks it before replying.</p>
    </form>
  );
}
