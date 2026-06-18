import type { Metadata } from 'next';
import styles from '../dash.module.css';

export const metadata: Metadata = {
  title: 'Dash by assembl — Copyright & Trademarks',
  description:
    'Copyright, trademark and intellectual-property terms for Dash by assembl, including the proprietary SDK and how to report infringing content.',
  alternates: { canonical: '/dash/copyright' },
  robots: { index: true, follow: true },
};

export default function DashCopyrightPage() {
  return (
    <section className={styles.legal}>
      <h1 className={styles.legalTitle}>Copyright &amp; Trademarks</h1>
      <p className={styles.legalMeta}>
        Dash by assembl · ASSEMBL NZ LIMITED · last updated 17 June 2026
      </p>

      <div className={styles.legalBody}>
        <h2>1. Ownership</h2>
        <p>
          The <strong>Dash by assembl</strong> network, this website, the Dash brand, and all
          related copy, design, graphics and source code are owned by ASSEMBL NZ LIMITED or its
          licensors, and are protected by New Zealand and international copyright law. © 2026 ASSEMBL
          NZ LIMITED. All rights reserved.
        </p>

        <h2>2. Trademarks</h2>
        <p>
          <strong>assembl</strong>, <strong>Dash by assembl</strong>, the assembl and Dash
          wordmarks, and our visual identity are trademarks of ASSEMBL NZ LIMITED, whether
          registered or unregistered. You may not use them — including in a way that suggests
          endorsement, partnership or affiliation — without our prior written permission. Nominative
          reference (for example, &ldquo;our tool uses Dash by assembl&rdquo;) is permitted where it
          is accurate and not misleading.
        </p>

        <h2>3. The SDK is proprietary</h2>
        <p>
          The <strong>@assembl/dash-sdk</strong> and any related libraries are{' '}
          <strong>proprietary software</strong>, licensed — not sold — to publishers for the sole
          purpose of serving Dash inventory under our{' '}
          <a href="/dash/terms">Terms of Service</a>. Except to the extent permitted by law, you may
          not copy, modify, decompile, reverse-engineer, redistribute, sublicense or create
          derivative works from the SDK. We grant no rights by implication.
        </p>

        <h2>4. Advertiser and publisher content</h2>
        <p>
          Advertisers retain ownership of their own creative and grant us the licence needed to
          serve it through the network. Publishers retain ownership of their own software. You are
          responsible for ensuring you hold the rights to anything you submit to Dash.
        </p>

        <h2>5. Reporting infringement (DMCA / takedown)</h2>
        <p>
          We respect the intellectual-property rights of others. If you believe content served or
          hosted through Dash infringes your copyright, send a notice to our designated agent with:
        </p>
        <ul>
          <li>your contact details;</li>
          <li>identification of the copyrighted work you say has been infringed;</li>
          <li>identification of the infringing material and where it appears;</li>
          <li>
            a statement that you have a good-faith belief the use is not authorised by the rights
            holder, their agent or the law;
          </li>
          <li>
            a statement, made under penalty of perjury where applicable, that your notice is
            accurate and you are authorised to act for the rights holder;
          </li>
          <li>your physical or electronic signature.</li>
        </ul>
        <p>
          Send copyright and DMCA notices to our designated agent, Kate Hudson, at{' '}
          <a href="mailto:assembl@assembl.co.nz?subject=Dash%20by%20assembl%20%E2%80%94%20copyright%20notice">
            assembl@assembl.co.nz
          </a>
          . We will respond promptly and may remove or disable access to the material in question.
        </p>

        <h2>6. Contact</h2>
        <p>
          For permissions, licensing or trademark questions, contact Kate Hudson at{' '}
          <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>.
        </p>

        <p className={styles.legalDraft}>
          These pages are a working draft prepared by assembl. They have not been reviewed by
          external counsel.
        </p>
      </div>
    </section>
  );
}
