import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../living.css';

export const metadata: Metadata = {
  title: 'id page — dayrally (proposed sample)',
  robots: { index: false, follow: false, noarchive: true },
};

/**
 * The page a printed id code points at. PROPOSED: only the sample token
 * answers, with placeholder fields, so the layout can be seen. There is no
 * token store, no edit page and no live code; see
 * docs/living/DAYRALLY-POCKET.md ("The owner page, as proposed").
 */
const SAMPLE = {
  firstName: 'Sample',
  allergies: ['Peanuts (carries an EpiPen, in the pod)'],
  medical: 'Asthma: blue inhaler in the bag.',
  contacts: [
    { who: 'Parent', phone: '021 000 0000' },
    { who: 'Second contact', phone: '021 000 0001' },
  ],
  note: 'Please call a parent first. They are usually close by.',
  scans: 0,
};

export default async function IdPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token !== 'SAMPLE') notFound();
  const d = SAMPLE;
  return (
    <main className="lv-sun" style={{ minHeight: '100vh', padding: '1.5rem 1rem 3rem', maxWidth: 520, margin: '0 auto' }}>
      <p
        style={{
          fontFamily: 'var(--ls-mono, "IBM Plex Mono", monospace)',
          fontSize: 12,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          background: 'var(--ls-cream)',
          padding: '0.6rem 0.8rem',
          borderRadius: 8,
        }}
      >
        Proposed · sample page · not a live code · nothing here is a real person
      </p>
      <p style={{ fontSize: 13, opacity: 0.7, marginTop: '1rem' }}>You scanned a dayrally id tag.</p>
      <h1 style={{ fontSize: '2.4rem', margin: '0.2rem 0 0.4rem' }}>This is {d.firstName}.</h1>
      <p style={{ marginTop: 0 }}>If {d.firstName} needs help, this is what the family wants you to know.</p>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Allergies</h2>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          {d.allergies.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Medical</h2>
        <p style={{ margin: 0 }}>{d.medical}</p>
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>Call</h2>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {d.contacts.map((c) => (
            <a key={c.who} className="ls-btn" data-variant="sun" href={`tel:${c.phone.replace(/\s/g, '')}`} style={{ justifyContent: 'space-between' }}>
              <span>{c.who}</span>
              <span style={{ fontFamily: 'var(--ls-mono, "IBM Plex Mono", monospace)', fontWeight: 500 }}>{c.phone}</span>
            </a>
          ))}
        </div>
        <p style={{ fontSize: 14, marginTop: '0.8rem' }}>{d.note}</p>
      </section>

      <section style={{ marginTop: '1.5rem', padding: '1rem', border: '1px dashed rgba(36,11,33,0.3)', borderRadius: 12 }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 0.4rem' }}>Known helper?</h2>
        <p style={{ margin: 0, fontSize: 14 }}>
          A second layer (a fuller medical note, a third contact, an address) sits behind a four-digit PIN the parent sets. Proposed; not built.
        </p>
      </section>

      <footer style={{ marginTop: '2rem', fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
        <p style={{ margin: 0 }}>
          The parent chose every line on this page and can change or switch it off at any time from the private link in their order. Nothing
          else about {d.firstName} is held here. Scans the parent can see: {d.scans}.
        </p>
        <p style={{ margin: '0.6rem 0 0' }}>
          Where the details go in: not the product widget. The widget picks the shape and colours and reserves this code; the details are
          entered afterwards on the parent&apos;s edit page. <Link href="/living/widget/lab-id-charm">See the charm widget</Link>.
        </p>
      </footer>
    </main>
  );
}
