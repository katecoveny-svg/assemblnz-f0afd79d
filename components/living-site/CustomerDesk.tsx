'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LiveEnquiry } from '@/lib/customers/auckland-dog-trainer/genome-store';
import {
  canTransitionBooking,
  isLocalBooking,
  localBookingStorageKey,
  type LivingSiteBooking,
  type LivingSiteBookingStatus,
} from '@/lib/living-site/bookings';
import type { SampleVertical } from '@/lib/living-site/verticals';
import styles from './living-site-tools.module.css';

const nzDate = new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });

export function CustomerDesk({
  v,
  tenant,
  enquiries,
  bookings: initialBookings,
  siteHref,
}: {
  v: SampleVertical;
  tenant: string;
  enquiries: LiveEnquiry[];
  bookings: LivingSiteBooking[];
  siteHref?: string;
}) {
  const site = siteHref ?? `/living-site/${v.slug}`;
  const storageKey = localBookingStorageKey(tenant);
  const [bookings, setBookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
        if (!Array.isArray(parsed)) return;
        const local = parsed as LivingSiteBooking[];
        setBookings((current) => {
          const ids = new Set(current.map((item) => item.id));
          return [...current, ...local.filter((item) => !ids.has(item.id))]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 30);
        });
      } catch {
        // Malformed browser-only demo data must not break the desk.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  const updateLocalBooking = (booking: LivingSiteBooking, status: LivingSiteBookingStatus) => {
    const updated = { ...booking, status };
    setBookings((current) => current.map((item) => item.id === booking.id ? updated : item));
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
      const local = Array.isArray(parsed) ? parsed as LivingSiteBooking[] : [];
      window.localStorage.setItem(storageKey, JSON.stringify(local.map((item) => item.id === booking.id ? updated : item)));
    } catch {
      // The in-memory status still remains visible for this session.
    }
    setNotice(`${booking.name}'s request is now ${status} in this browser-only demo queue.`);
  };

  const changeStatus = async (booking: LivingSiteBooking, status: LivingSiteBookingStatus) => {
    if (!canTransitionBooking(booking.status, status)) return;
    setBusyId(booking.id);
    setNotice('');
    setError('');
    if (isLocalBooking(booking)) {
      updateLocalBooking(booking, status);
      setBusyId('');
      return;
    }
    try {
      const response = await fetch('/api/living-site/booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant, id: booking.id, status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.booking) throw new Error(result.error ?? 'Could not update the request.');
      setBookings((current) => current.map((item) => item.id === booking.id ? result.booking as LivingSiteBooking : item));
      setNotice(`${booking.name}'s request is now ${status}. This updates the tenant record only; no email was sent.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the request.');
    } finally {
      setBusyId('');
    }
  };

  const contacts = new Set([...enquiries.map((item) => item.email), ...bookings.map((item) => item.email)]).size;
  const requested = bookings.filter((item) => item.status === 'requested').length;
  return (
    <>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>customer desk · tenant records</p>
        <h2>Every lead and requested time, together.</h2>
        <p>Website forms write into this desk. A status button updates the record only; use the email draft separately and keep the actual confirmation with {v.owner}.</p>
      </section>
      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <section className={styles.summaryGrid} aria-label="Customer desk summary">
        <Metric value={String(contacts)} label="contacts" hint="deduplicated by email" />
        <Metric value={String(enquiries.length)} label="enquiries" hint="from the customer site" />
        <Metric value={String(requested)} label="times requested" hint="waiting for confirmation" />
        <Metric value={String(bookings.filter((item) => item.status === 'confirmed').length)} label="confirmed" hint="owner-approved only" />
      </section>
      <div className={styles.deskGrid}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>enquiry inbox</p>
          <h2>New conversations</h2>
          <p className={styles.cardLead}>Submissions from this Living Site, newest first.</p>
          <div className={styles.recordList}>
            {enquiries.length ? enquiries.map((item) => (
              <article className={styles.record} key={item.id}>
                <div>
                  <h3>{item.name}{item.dog ? ` · ${item.dog}` : ''}</h3>
                  <p>{item.message}</p>
                  <p>{item.when} · {item.email}</p>
                  <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: your enquiry to ${v.businessName}`)}`}>draft a reply →</a>
                </div>
                <span className={styles.status}>new</span>
              </article>
            )) : <div className={styles.empty}>No live enquiries yet. <Link href={site}>Send a test from the customer site →</Link></div>}
          </div>
        </section>
        <section className={styles.card}>
          <p className={styles.eyebrow}>booking queue</p>
          <h2>Requested times</h2>
          <p className={styles.cardLead}>A request is not a booking until {v.owner} checks the diary and contacts the customer.</p>
          <div className={styles.recordList}>
            {bookings.length ? bookings.map((item) => (
              <article className={styles.record} key={item.id}>
                <div>
                  <h3>{item.serviceLabel}</h3>
                  <p>{item.name} · {nzDate.format(new Date(`${item.preferredDate}T12:00:00`))} · {item.preferredTime}</p>
                  {item.notes ? <p>{item.notes}</p> : null}
                  {isLocalBooking(item) ? <p>Browser-only demo record</p> : null}
                  <div className={styles.recordActions}>
                    <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Your requested time with ${v.businessName}`)}`}>draft customer email →</a>
                    {item.status === 'requested' ? (
                      <>
                        <button type="button" disabled={busyId === item.id} onClick={() => void changeStatus(item, 'confirmed')}>Mark confirmed</button>
                        <button type="button" disabled={busyId === item.id} onClick={() => void changeStatus(item, 'declined')}>Decline</button>
                      </>
                    ) : null}
                    {item.status === 'confirmed' ? (
                      <>
                        <button type="button" disabled={busyId === item.id} onClick={() => void changeStatus(item, 'completed')}>Mark complete</button>
                        <button type="button" disabled={busyId === item.id} onClick={() => void changeStatus(item, 'cancelled')}>Cancel</button>
                      </>
                    ) : null}
                  </div>
                </div>
                <span className={styles.status}>{item.status}</span>
              </article>
            )) : <div className={styles.empty}>No requested times yet. Open the customer site, choose Book, and submit one to prove the loop.</div>}
          </div>
        </section>
      </div>
    </>
  );
}

function Metric({ value, label, hint }: { value: string; label: string; hint: string }) {
  return <article className={styles.metric}><strong>{value}</strong><span>{label}</span><small>{hint}</small></article>;
}
