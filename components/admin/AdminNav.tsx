'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Admin top nav — the marketplace-era operator surface.
 *
 * Lowercase `assembl` wordmark (Cormorant 600) + canary pill-dash, logo links
 * to `/`. Ten real sections. Space Mono labels, canary highlight on the active
 * route. Self-contained chrome: the global SiteHeader/Footer are suppressed on
 * /admin (see components/site/site-header.tsx).
 */

const NAV: { label: string; href: string }[] = [
  { label: 'Today', href: '/admin' },
  { label: 'Agents', href: '/admin/agents' },
  { label: 'Bundles', href: '/admin/bundles' },
  { label: 'Knowledge', href: '/admin/knowledge' },
  { label: 'Tenants', href: '/admin/tenants' },
  { label: 'Invites', href: '/admin/invites' },
  { label: 'Approvals', href: '/admin/approvals' },
  { label: 'Receipts', href: '/admin/receipts' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Pilot', href: '/admin/pilot' },
  { label: 'Billing', href: '/admin/billing' },
  { label: 'Content', href: '/admin/content' },
  { label: 'Support', href: '/admin/support' },
  { label: 'Health', href: '/admin/health' },
  { label: 'Settings', href: '/admin/settings' },
];

const INK = '#3A3832';
const BODY = '#56544B';
const CANARY = '#FFD42A';
const HAIRLINE = '#EFEADC';
const DISPLAY = 'var(--font-display), "Cormorant Garamond", Georgia, serif';
const FONT_BODY = 'var(--font-body), Lato, system-ui, sans-serif';

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
        background: 'rgba(251,248,241,0.86)',
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
            style={{ width: 22, height: 7, borderRadius: 4, background: CANARY, marginBottom: 5 }}
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
                  color: active ? INK : BODY,
                  background: active ? CANARY : 'transparent',
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
            fontFamily: 'var(--font-mono), "Space Mono", ui-monospace, monospace',
            fontSize: 10.5,
            letterSpacing: '0.08em',
            color: '#8A8678',
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
