import type { Metadata } from 'next';
import Link from 'next/link';
import { DoMark } from '@/components/do/DoMark';
import { DoDownloadCtas } from '@/components/do/DoDownloadCtas';
import styles from './install.module.css';
import '../do.css';

export const metadata: Metadata = {
  title: { absolute: 'Install DO · Chrome + Mac · assembl' },
  description:
    'Download the Chrome DO extension zip or the Mac companion source. Load unpacked in Chrome; build the Mac app on a Mac with Xcode tools.',
  alternates: { canonical: '/do/install' },
  robots: { index: true, follow: true },
};

export default function DoInstallPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/do" className={styles.brand}>
          <span className={styles.mark} aria-hidden>
            <DoMark />
          </span>
          DO
        </Link>
        <nav className={styles.nav} aria-label="DO">
          <Link className={styles.navLink} href="/do">Your DOs</Link>
          <Link className={styles.navLink} href="/do/meetings">Meeting DO</Link>
          <Link className={styles.navLink} href="/login?redirect=%2Fdo%2Finstall">Sign in</Link>
        </nav>
      </header>

      <section>
        <p className={styles.kicker}>INSTALL · PORTABLE DO</p>
        <h1 className={styles.heroTitle}>Take DO with you.</h1>
        <p className={styles.heroCopy}>
          Download Chrome DO for the browser toolbar, or Mac DO source to build
          the floating companion on your Mac. Drafts only — nothing is sent or
          paid for you.
        </p>
        <DoDownloadCtas variant="sheet" />
      </section>

      <section className={styles.card} id="chrome">
        <h2 className={styles.cardTitle}>Chrome DO</h2>
        <ol className={styles.list}>
          <li className={styles.listItem}>
            Click <strong>Download Chrome DO</strong> — you get{' '}
            <code className={styles.code}>assembl-do-extension-1.5.0.zip</code>.
          </li>
          <li className={styles.listItem}>
            Unzip the folder (keep <code className={styles.code}>manifest.json</code> at the top).
          </li>
          <li className={styles.listItem}>
            Open <code className={styles.code}>chrome://extensions</code> → enable{' '}
            <strong>Developer mode</strong>.
          </li>
          <li className={styles.listItem}>
            <strong>Load unpacked</strong> → select the unzipped folder →{' '}
            <strong>Reload</strong> if it was already installed.
          </li>
          <li className={styles.listItem}>Pin DO. Select page text to light the toolbar badge.</li>
        </ol>
        <p className={styles.note}>
          If Chrome marks the extension <strong>Inactive</strong>, open Errors. Every
          shipped <code className={styles.code}>.js</code> file must start with quoted{' '}
          <code className={styles.code}>&apos;use strict&apos;;</code> — a bare{' '}
          <code className={styles.code}>use strict</code> disables the extension. Toolbar
          icons (16/32/48) are included so Chrome can show the D-mark.
        </p>
        <a className={styles.cta} href="/api/do/download?format=extension" download>
          Download Chrome DO zip
        </a>
        <p className={styles.alt}>
          Static mirror (same package):{' '}
          <a className={styles.altLink} href="/do/downloads/assembl-do-extension-1.5.0.zip" download>
            /do/downloads/assembl-do-extension-1.5.0.zip
          </a>
        </p>
      </section>

      <section className={styles.card} id="mac">
        <h2 className={styles.cardTitle}>Mac DO</h2>
        <p className={styles.heroCopy}>
          There is <strong>no notarised public .app download</strong> yet. The button
          downloads the companion <strong>source</strong> from{' '}
          <code className={styles.code}>apps/do/macos</code> so you can build locally.
        </p>
        <ol className={styles.list}>
          <li className={styles.listItem}>
            Click <strong>Download Mac DO</strong> → unzip on a Mac with Xcode Command
            Line Tools.
          </li>
          <li className={styles.listItem}>
            Run <code className={styles.code}>./build.sh ~/Desktop/do-mac-build</code> then open{' '}
            <code className={styles.code}>DO.app</code>.
          </li>
          <li className={styles.listItem}>
            Optional: <code className={styles.code}>bash package.sh ~/Desktop/do-mac-build</code> for a
            development DMG (still ad-hoc signed).
          </li>
        </ol>
        <p className={styles.note}>
          Gatekeeper may warn on unsigned development builds. Do not disable macOS
          security protections. A public Mac installer needs Developer ID signing and
          Apple notarisation — not claimed here.
        </p>
        <a className={styles.cta} href="/api/do/download?format=mac" download="DO-mac-companion.zip">
          Download Mac DO source zip
        </a>
        <p className={styles.alt}>
          Static mirror:{' '}
          <a className={styles.altLink} href="/do/downloads/DO-mac-companion.zip" download>
            /do/downloads/DO-mac-companion.zip
          </a>
        </p>
      </section>

      <p className={styles.foot}>
        <Link className={styles.footLink} href="/do">← Back to DO</Link>
      </p>
    </main>
  );
}
