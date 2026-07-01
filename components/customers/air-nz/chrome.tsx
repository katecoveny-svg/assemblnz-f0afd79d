'use client';

/**
 * Air New Zealand × Dash — hosted pilot workspace chrome.
 *
 * Matches the real Air NZ app: near-black header with the koru mark centred,
 * Ocean Teal accent, and the five-item bottom tab bar (Home · Flights · Book ·
 * Koru · More) verbatim from Kate's app screenshots. Marked "concept · demo
 * pending" — there is no live Air NZ partnership and the koru mark is a
 * stylised placeholder, never the real logo.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/customers/air-nz/dash/airnz.module.css';
import { KoruMark } from './KoruMark';

const BASE = '/customers/air-nz/dash';

export function AirNzHeader({ back }: { back?: string }) {
  return (
    <header className={styles.header}>
      {back ? (
        <Link href={back} className={styles.headerBack} aria-label="Back">
          ‹
        </Link>
      ) : (
        <span className={styles.headerBack} aria-hidden />
      )}
      <div className={styles.headerMark}>
        <KoruMark size={22} />
      </div>
      <div className={styles.headerPerson} aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M4 20c0-4 3.6-6 8-6s8 2 8 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </header>
  );
}

const TABS = [
  { label: 'Home', href: BASE, key: 'home' },
  { label: 'Flights', href: `${BASE}/journey`, key: 'flights' },
  { label: 'Book', href: `${BASE}/wait-states`, key: 'book', plus: true },
  { label: 'Koru', href: `${BASE}/shairpoints`, key: 'koru' },
  { label: 'More', href: `${BASE}/economics`, key: 'more' },
];

export function AirNzTabBar() {
  const pathname = usePathname();
  return (
    <nav className={styles.tabbar} aria-label="Air New Zealand">
      {TABS.map((t) => {
        const active =
          t.href === BASE ? pathname === BASE : pathname.startsWith(t.href);
        if (t.plus) {
          return (
            <Link key={t.key} href={t.href} className={styles.tab}>
              <span className={styles.tabPlus}>+</span>
              <span>{t.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={t.key}
            href={t.href}
            className={`${styles.tab} ${active ? styles.active : ''}`}
          >
            <TabIcon k={t.key} active={active} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function TabIcon({ k, active }: { k: string; active: boolean }) {
  const stroke = active ? '#00b0b9' : '#6b6e71';
  if (k === 'koru') {
    return <KoruMark size={18} color={stroke} />;
  }
  if (k === 'home') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (k === 'flights') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15l-8-3V4.5a1.5 1.5 0 00-3 0V12l-8 3v2l8-2v3l-2 1.5V21l3.5-1L15 21v-1.5L13 18v-3l8 2z"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // more
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="1.6" fill={stroke} />
      <circle cx="12" cy="12" r="1.6" fill={stroke} />
      <circle cx="19" cy="12" r="1.6" fill={stroke} />
    </svg>
  );
}

/** Bottom-right concept marker — present on every workspace surface. */
export function ConceptCorner() {
  return (
    <div className={styles.conceptCorner}>
      concept · demo pending — assembl × Air New Zealand
    </div>
  );
}

/** Top hairline pill — "not a live Air NZ asset". */
export function ConceptTop() {
  return (
    <div className={styles.conceptTop}>
      <span
        style={{ width: 6, height: 6, borderRadius: 999, background: '#00b0b9' }}
        aria-hidden
      />
      Koru × pitch concept — not a live Air New Zealand asset
    </div>
  );
}

/** Form A earn-attribution pill — Koru | assembl, canary divider. */
export function EarnPill() {
  return (
    <span className={styles.earnPill}>
      <span className={styles.koruDot}>
        <KoruMark size={13} color="#00b0b9" />
      </span>
      <span className={styles.koru}>Koru</span>
      <span className={styles.divider} aria-hidden />
      <span className={styles.assembl}>assembl</span>
    </span>
  );
}
