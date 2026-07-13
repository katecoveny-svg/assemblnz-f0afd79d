import Link from 'next/link';
import type { LiveEnquiry } from '@/lib/customers/auckland-dog-trainer/genome-store';
import type { LivingSiteBooking } from '@/lib/living-site/booking-store';
import type { SampleVertical } from '@/lib/living-site/verticals';
import styles from './living-site-tools.module.css';

const nzDate = new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });

export function CustomerDesk({
  v,
  enquiries,
  bookings,
  siteHref,
}: {
  v: SampleVertical;
  enquiries: LiveEnquiry[];
  bookings: LivingSiteBooking[];
  siteHref?: string;
}) {
  const site = siteHref ?? `/living-site/${v.slug}`;
  const contacts = new Set([...enquiries.map((item) => item.email), ...bookings.map((item) => item.email)]).size;
  const requested = bookings.filter((item) => item.status === 'requested').length;
  return (
    <>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>customer desk · live tenant records</p>
        <h2>Every lead and requested time, together.</h2>
        <p>Website forms write into this tenant-scoped desk. Use the email links to reply; confirmations and sends remain with {v.owner}.</p>
      </section>
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
          <p className={styles.cardLead}>Real submissions from this Living Site, newest first.</p>
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
          <p className={styles.cardLead}>A request is not a booking until {v.owner} confirms it.</p>
          <div className={styles.recordList}>
            {bookings.length ? bookings.map((item) => (
              <article className={styles.record} key={item.id}>
                <div>
                  <h3>{item.serviceLabel}</h3>
                  <p>{item.name} · {nzDate.format(new Date(`${item.preferredDate}T12:00:00`))} · {item.preferredTime}</p>
                  {item.notes ? <p>{item.notes}</p> : null}
                  <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Your requested time with ${v.businessName}`)}`}>confirm by email →</a>
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
