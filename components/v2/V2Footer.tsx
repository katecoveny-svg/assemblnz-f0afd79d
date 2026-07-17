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

export function V2Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
        padding: '24px clamp(18px, 4vw, 58px) 34px',
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
      <nav aria-label="assembl footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>
        {FOOTER_LINKS.map(([href, label]) => (
          <Link key={href} href={href} style={{ color: '#53656a', fontSize: 11, textDecoration: 'none' }}>
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
