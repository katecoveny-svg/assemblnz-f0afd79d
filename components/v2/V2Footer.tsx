import Link from 'next/link';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';

/**
 * Site-wide footer — Instrument Sans body, IBM Plex Mono only for micro labels.
 * Public product doors stay on assembl.co.nz. Private Pursuit client hubs are
 * launched only from explicit hub/workspace CTAs.
 */
const FOOTER_LINKS: Array<[string, string]> = [
  ['/pursuit', 'Pursuit'],
  ['/do', 'DO'],
  ['/creative-studio', 'Studio'],
  ['/contact', 'Contact'],
  ['/about', 'About'],
  ['/legal/privacy', 'Privacy'],
];

const linkStyle = {
  color: '#240B21',
  fontFamily: "var(--font-body), 'Instrument Sans', system-ui, sans-serif",
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '-0.01em',
  textDecoration: 'none',
} as const;

const microStyle = {
  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#654A4E',
};

export function V2Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 34,
        padding: '34px clamp(18px, 3.3vw, 52px) 44px',
        borderTop: '1px solid rgba(36, 11, 33, 0.12)',
        background: '#F5F1F2',
        fontFamily: "var(--font-body), 'Instrument Sans', system-ui, sans-serif",
      }}
    >
      <div>
        <AssemblWordmark
          className="text-[24px] leading-none"
          style={{ letterSpacing: '-0.04em', color: '#240B21' }}
        />
        <p style={{ margin: '8px 0 0', color: '#654A4E', fontSize: 13, lineHeight: 1.5 }}>
          Find it. DO it. Show it. Built in New Zealand.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
        <p style={microStyle}>Product doors</p>
        <nav aria-label="assembl footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>
          {FOOTER_LINKS.map(([href, label]) => (
            <Link key={href} href={href} style={linkStyle}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
