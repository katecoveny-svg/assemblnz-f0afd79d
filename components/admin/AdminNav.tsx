'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Admin top nav — the marketplace-era operator surface.
 *
 * Lowercase `assembl` wordmark + rose state mark, logo links to `/`.
 * Instrument Sans labels and the canonical plum/rose active state. Self-contained
 * chrome: the global SiteHeader/Footer are suppressed on
 * /admin (see components/site/site-header.tsx).
 */

const NAV: { label: string; href: string }[] = [
  { label: 'Today', href: '/admin' },
  { label: 'Genome', href: '/admin/genome' },
  { label: 'Activity', href: '/admin/activity' },
  { label: 'Agents', href: '/admin/agents' },
  { label: 'Bundles', href: '/admin/bundles' },
  { label: 'Knowledge', href: '/admin/knowledge' },
  { label: 'Opportunities', href: '/admin/opportunities' },
  { label: 'Tenants', href: '/admin/tenants' },
  { label: 'Invites', href: '/admin/invites' },
  { label: 'Approvals', href: '/admin/approvals' },
  { label: 'Connectors', href: '/admin/connectors' },
  { label: 'Receipts', href: '/admin/receipts' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Pilot', href: '/admin/pilot' },
  { label: 'Billing', href: '/admin/billing' },
  { label: 'Content', href: '/admin/content' },
  { label: 'Support', href: '/admin/support' },
  { label: 'Health', href: '/admin/health' },
  { label: 'Settings', href: '/admin/settings' },
];

const INK = '#240B21';
const BODY = '#654A4E';
const STATE = '#916A70';
const PAPER = '#FFFDFB';
const HAIRLINE = '#F5F1F2';
const DISPLAY = 'var(--font-display), system-ui, sans-serif';
const FONT_BODY = 'var(--font-body), system-ui, sans-serif';

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(href + '/');
}

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,253,251,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
        }}
      >
        {/* Wordmark → home */}
        <Link
          href="/"
          aria-label="assembl — home"
          style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 4, textDecoration: 'none', flexShrink: 0 }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 27,
              lineHeight: 1,
              letterSpacing: '-0.01em',
              color: INK,
            }}
          >
            assembl
          </span>
          <span
            aria-hidden
            style={{ width: 22, height: 7, borderRadius: 4, background: STATE, marginBottom: 5 }}
          />
        </Link>

        {/* Sections */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            overflowX: 'auto',
            flex: 1,
            scrollbarWidth: 'none',
          }}
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: FONT_BODY,
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  color: active ? PAPER : BODY,
                  background: active ? STATE : 'transparent',
                  padding: '7px 13px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'background .12s ease, color .12s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span
          title={email}
          style={{
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
            fontSize: 12,
            letterSpacing: '0.08em',
            color: BODY,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </span>
      </div>
    </header>
  );
}
