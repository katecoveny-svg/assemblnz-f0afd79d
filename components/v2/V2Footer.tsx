import Link from 'next/link';

/**
 * The homepage's slim footer, extracted so it can be the single site-wide
 * footer (paired with V2Nav) instead of the tall SiteFooter. Server-safe.
 */
const FOOTER_LINKS: Array<[string, string]> = [
  ['/living-site', 'Living Sites'],
  ['/genome', 'Business Genome'],
  ['/os', 'Operating system'],
  ['/pilot', 'Build an agent'],
  ['/install', 'Install'],
  ['/trust', 'Trust'],
  ['/contact', 'Contact'],
  ['/legal/privacy', 'Privacy'],
];

// Free, public tools — surfaced so they're actually reachable, not orphaned.
const TOOL_LINKS: Array<[string, string]> = [
  ['/hapai', 'Free tools'],
  ['/pattern-studio', 'Pattern Studio'],
  ['/ad-studio', 'Ad Studio'],
  ['/hui', 'Meeting notes'],
];

const linkStyle = { color: '#53656a', fontSize: 11, textDecoration: 'none' } as const;

export function V2Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 22,
        padding: '26px clamp(18px, 4vw, 58px) 36px',
        borderTop: '1px solid rgba(49, 60, 66, 0.1)',
        background: '#f8f9f8',
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      <div>
        <p style={{ margin: 0, fontFamily: 'var(--font-display), Georgia, serif', fontSize: 19 }}>
          assembl
        </p>
        <p style={{ margin: '4px 0 0', color: '#68766f', fontSize: 10, letterSpacing: '0.08em' }}>
          Mahi that earns its proof. Built in Aotearoa.
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
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#9aa39c',
            }}
          >
            Free tools
          </span>
          {TOOL_LINKS.map(([href, label]) => (
            <Link key={href} href={href} style={{ ...linkStyle, color: '#3f7373' }}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
