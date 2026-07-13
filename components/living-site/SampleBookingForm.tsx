'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { CalendarCheck, ShieldCheck } from 'lucide-react';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { localBookingStorageKey, type LivingSiteBooking } from '@/lib/living-site/bookings';
import type { VerticalPalette } from '@/lib/living-site/verticals';
import styles from './sample.module.css';

type BookingState = 'idle' | 'sending' | 'sent' | 'sent-local' | 'error';

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
    const input = {
      tenant,
      serviceId,
      serviceLabel: service?.label ?? 'Service request',
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      preferredDate: String(form.get('preferredDate') ?? ''),
      preferredTime: String(form.get('preferredTime') ?? ''),
      notes: String(form.get('notes') ?? ''),
      website: String(form.get('website') ?? ''),
    };
    const saveToBrowser = (reason: string) => {
      const booking: LivingSiteBooking = {
        id: `local-${window.crypto.randomUUID()}`,
        tenant,
        serviceId,
        serviceLabel: input.serviceLabel,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        notes: input.notes || null,
        status: 'requested',
        source: 'browser-only',
        createdAt: new Date().toISOString(),
      };
      const key = localBookingStorageKey(tenant);
      let existing: LivingSiteBooking[] = [];
      try {
        const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]');
        if (Array.isArray(parsed)) existing = parsed as LivingSiteBooking[];
      } catch {
        // Ignore malformed older browser data and start a clean local queue.
      }
      window.localStorage.setItem(key, JSON.stringify([booking, ...existing].slice(0, 30)));
      setError(reason);
      setState('sent-local');
    };
    let response: Response;
    try {
      response = await fetch('/api/living-site/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    } catch (cause) {
      saveToBrowser(cause instanceof Error ? cause.message : 'the shared booking desk could not be reached');
      return;
    }
    const result = await response.json().catch(() => ({}));
    if (response.status === 503) {
      saveToBrowser(result.error ?? 'the shared booking desk is unavailable');
      return;
    }
    if (!response.ok || !result.ok || typeof result.id !== 'string') {
      setError(result.error ?? 'Could not save the request.');
      setState('error');
      return;
    }
    setState('sent');
  }

  if (state === 'sent' || state === 'sent-local') {
    return (
      <div
        className={styles.success}
        role="status"
        style={{ '--sample-accent': palette.accent, '--sample-muted': palette.muted } as CSSProperties}
      >
        <CalendarCheck aria-hidden />
        <h3>{state === 'sent' ? 'Request received.' : 'Request saved on this browser.'}</h3>
        <p>{state === 'sent'
          ? `${owner} will check the diary and confirm the time with you. Nothing has been charged or booked yet.`
          : `The shared booking desk is not configured here, so this fictional request is available to the CRM on this browser only. ${owner} has not confirmed it and nothing has been charged.`}</p>
        {state === 'sent-local' ? <small>{error}</small> : null}
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
