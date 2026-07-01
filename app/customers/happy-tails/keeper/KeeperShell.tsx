import type { ReactNode } from 'react';
import Link from 'next/link';
import { HAPPY_TAILS_BRAND, DEMO_BANNER } from '@/lib/tenants/happy-tails/data';

const BASE = '/customers/happy-tails/keeper';

const NAV = [
  { n: '1', label: 'Dashboard', href: BASE, key: 'dashboard' },
  { n: '2', label: 'Dog profiles', href: `${BASE}/dogs/franklin`, key: 'dogs' },
  { n: '3', label: 'Welcome Pack', href: `${BASE}/welcome-pack`, key: 'welcome-pack' },
  { n: '4', label: 'Bus route', href: `${BASE}/route`, key: 'route' },
  { n: '5', label: 'Xero invoicing', href: `${BASE}/invoicing`, key: 'invoicing' },
  { n: '6', label: 'Mana Receipts', href: `${BASE}/receipts`, key: 'receipts' },
  { n: '7', label: 'Team', href: `${BASE}/team`, key: 'team' },
];

/** Sketch dachshund line-drawing — the Happy Tails mark. */
export function DachshundMark() {
  return (
    <svg viewBox="0 0 120 62" fill="none" stroke="#1a1712" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 40 Q10 40 9 32 Q8 24 15 22 L18 30" />
      <path d="M15 22 Q22 14 34 17 Q40 18 46 24 L104 24 Q114 24 114 33 Q114 40 106 40" />
      <path d="M46 24 Q42 34 46 40" />
      <path d="M26 40 L26 52 M40 40 L40 52 M96 40 L96 52 M108 40 L108 52" />
      <path d="M104 24 Q112 18 110 12" />
      <circle cx="16" cy="27" r="1.6" fill="#1a1712" stroke="none" />
    </svg>
  );
}

/** Small brown dachshund avatar for dog rows. */
export function DogAvatar() {
  return (
    <svg viewBox="0 0 120 62" fill="none" stroke="#7a4e2c" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 40 Q9 38 10 30 Q11 23 16 23" />
      <path d="M16 23 Q24 16 40 20 L100 24 Q112 24 110 34" />
      <path d="M46 24 Q42 33 46 40" />
      <path d="M26 40v11M42 40v11M92 40v11M104 40v11" />
      <path d="M100 24 Q108 19 106 13" />
    </svg>
  );
}

/** Franklin has real branded photos; everyone else uses the sketch avatar. */
export function RosterAvatar({ slug, kind = 'sit' }: { slug: string; kind?: 'sit' | 'wave' | 'stand' | 'lying' }) {
  if (slug === 'franklin') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="avimg" src={`/customers/happy-tails/franklin-${kind}.jpg`} alt="Franklin" />;
  }
  return (
    <div className="av">
      <DogAvatar />
    </div>
  );
}

export function DemoPill() {
  return (
    <span className="pill">
      <span className="dot" />
      {DEMO_BANNER}
    </span>
  );
}

/** Tenant chrome: sidebar nav + main region. No assembl chrome inside the tenant. */
export function KeeperShell({ active, children }: { active: string; children: ReactNode }) {
  const b = HAPPY_TAILS_BRAND;
  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <DachshundMark />
          <div className="wm">
            Happy Tails
            <small>Keeper workspace</small>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((item) => (
            <Link key={item.key} className={item.key === active ? 'on' : undefined} href={item.href}>
              <span className="n">{item.n}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidefoot">
          <b>{b.location}</b>
          <br />
          {b.email}
          <br />
          GST {b.gst}
          <br />
          <span className="powered">powered by assembl · Keeper</span>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
