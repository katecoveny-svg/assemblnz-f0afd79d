import type { Metadata } from 'next';
import styles from '../dash.module.css';

export const metadata: Metadata = {
  title: 'Dash privacy · assembl',
  description:
    'How Dash by assembl handles data under the Privacy Act 2020. No prompt or content collection, salted IP hashing, Sydney data residency, and retention periods.',
  alternates: { canonical: '/dash/privacy' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Dash privacy · assembl',
    description:
      'How Dash by assembl handles data under the Privacy Act 2020 — what we collect, what we never do, salted IP hashing and Sydney residency.',
    type: 'website',
    siteName: 'dash. by assembl',
    url: '/dash/privacy',
    locale: 'en_NZ',
    images: [
      { url: '/images/dash/og-image.png', width: 1200, height: 630, alt: 'Dash privacy · assembl' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dash privacy · assembl',
    description: 'How Dash by assembl handles data under the Privacy Act 2020.',
    images: ['/images/dash/og-image.png'],
  },
};

export default function DashPrivacyPage() {
  return (
    <section className={styles.legal}>
      <h1 className={styles.legalTitle}>Privacy Policy</h1>
      <p className={styles.legalMeta}>
        Dash by assembl · ASSEMBL NZ LIMITED · last updated 17 June 2026
      </p>

      <div className={styles.legalBody}>
        <p>
          <strong>Dash by assembl</strong> is built to be native to the Privacy Act 2020. This
          policy explains what we collect, what we deliberately do not, and how we look after it.
          ASSEMBL NZ LIMITED is the agency responsible for personal information handled through Dash.
          Our Privacy Officer is Kate Hudson,{' '}
          <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>.
        </p>

        <h2>1. What we never collect</h2>
        <p>
          The Dash SDK is designed so it has no way to read the things that matter most. We never
          collect, store or transmit:
        </p>
        <ul>
          <li>your users&rsquo; prompts, inputs or queries;</li>
          <li>the content, documents, code or files inside the host software;</li>
          <li>the outputs the host software generates.</li>
        </ul>
        <p>
          That promise is structural, not just a setting. There is no field in the SDK for this
          data because we do not want it.
        </p>

        <h2>2. What we do collect</h2>
        <p>To run the auction, prevent fraud and pay publishers, the SDK sends us only:</p>
        <ul>
          <li>the publisher id of the surface serving the impression;</li>
          <li>the surface type (e.g. web, Electron, CLI) and a coarse, non-identifying context tag;</li>
          <li>impression, click and dismiss events, and a timestamp;</li>
          <li>
            a network-derived IP address, used solely for fraud-prevention and coarse NZ-geography
            checks (see below).
          </li>
        </ul>

        <h2>3. We never store a raw IP — IPP 3A and salted hashing</h2>
        <p>
          Consistent with Information Privacy Principle 3A and the data-minimisation spirit of the
          Privacy Act 2020, we do not retain raw IP addresses. On receipt, an IP is combined with a
          rotating secret <strong>salt</strong> and one-way <strong>hashed</strong>; only that salted
          hash is stored, and only for the limited fraud-detection window. The hash cannot be
          reversed back to the original address, and the salt is held separately.
        </p>

        <h2>4. Purpose and lawful basis</h2>
        <p>
          We use the limited information above only to: run the second-price auction; detect and
          prevent invalid or fraudulent traffic; calculate and pay publisher revenue; and produce
          aggregate reporting. We do not build advertising profiles of individuals, and we do not
          sell personal information.
        </p>

        <h2>5. Where your data lives — Sydney residency</h2>
        <p>
          Dash&rsquo;s data is hosted in <strong>Sydney, Australia</strong> on our infrastructure
          provider&rsquo;s ap-southeast-2 region. Australia provides privacy protections comparable
          to New Zealand&rsquo;s. Where any processor is engaged outside New Zealand, we take
          reasonable steps to ensure comparable safeguards are in place, as the Privacy Act 2020
          requires.
        </p>

        <h2>6. How long we keep it — retention</h2>
        <ul>
          <li>
            <strong>Operational event and salted-hash data:</strong> retained for up to{' '}
            <strong>24 months</strong>, then deleted or further aggregated.
          </li>
          <li>
            <strong>Financial and payment records</strong> (publisher payouts, advertiser invoices):
            retained for <strong>7 years</strong> to meet New Zealand tax and record-keeping
            obligations.
          </li>
        </ul>

        <h2>7. Sharing</h2>
        <p>
          We share personal information only with the processors that run the network (hosting,
          payments) under confidentiality obligations, and where we are required to by New Zealand
          law. We do not share it with advertisers.
        </p>

        <h2>8. Your rights</h2>
        <p>
          Under the Privacy Act 2020 you may ask to access or correct personal information we hold
          about you. Because Dash stores no raw identifiers and no content, the information we can
          tie to an individual is minimal. Send any request to Kate Hudson at{' '}
          <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>. If you are not satisfied
          with our response, you may contact the Office of the Privacy Commissioner.
        </p>

        <h2>9. Changes</h2>
        <p>
          We will post any update to this policy here with a new &ldquo;last updated&rdquo; date.
        </p>

        <p className={styles.legalDraft}>
          These pages are a working draft prepared by assembl. They have not been reviewed by
          external counsel.
        </p>
      </div>
    </section>
  );
}
