import Link from 'next/link';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';

/**
 * The homepage's slim footer, extracted so it can be the single site-wide
 * footer (paired with V2Nav) instead of the tall SiteFooter. Server-safe.
 */
const FOOTER_LINKS: Array<[string, string]> = [
  ['/genome', 'Live demo'],
  ['/agents', 'Agents'],
  ['/concept-studio', 'Concept Studio'],
  ['/pilot-sprint', 'Start a pilot'],
  ['/pricing', 'Pricing'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/legal/privacy', 'Privacy'],
];

// Free, public tools — surfaced so they're actually reachable, not orphaned.
const TOOL_LINKS: Array<[string, string]> = [
  ['/hapai', 'Free tools'],
  ['/motion-studio', 'Motion Studio'],
  ['/pattern-studio', 'Pattern Studio'],
  ['/ad-studio', 'Ad Studio'],
  ['/hui', 'Meeting notes'],
  ['/a', 'Agent Maker'],
];

const linkStyle = {
  color: '#240B21',
  fontFamily: 'var(--font-mono), Space Mono, monospace',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textDecoration: 'none',
  textTransform: 'uppercase',
} as const;

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
        borderTop: '1px solid rgba(17, 19, 17, 0.18)',
        background: '#F5F1F2',
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      <div>
        <AssemblWordmark className="text-[24px] leading-none" style={{ letterSpacing: '0.12em', color: '#240B21' }} />
        <p style={{ margin: '5px 0 0', color: '#654A4E', fontSize: 12, letterSpacing: '0.06em' }}>
          See what your agent is made of. Built in Aotearoa.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <nav aria-label="assembl footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>
          {FOOTER_LINKS.map(([href, label]) => (
            <Link key={href} href={href} style={linkStyle}>
              {label}
            </Link>
          ))}
        </nav>
        <nav
          aria-label="Free tools"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono), Space Mono, monospace',
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#654A4E',
            }}
          >
            Free tools
          </span>
          {TOOL_LINKS.map(([href, label]) => (
            <Link key={href} href={href} style={linkStyle}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
