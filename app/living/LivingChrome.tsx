import Link from 'next/link';
import { CAD_MANIFEST } from '@/lib/living';

/**
 * assembl / living — the header and foot the living pages that ship their own chrome use
 * (the Space Studio today). One line of wordmark and four doors; the plum foot carries the facts.
 * The company nav, footer and DO assistant stay off these pages (components/site/GlobalChrome.tsx,
 * apps/do/shared/public-assistant-routes.ts).
 */
export function LivingHeader({ current }: { current: 'studio' | 'storefront' }) {
  return (
    <header className="lv-top">
      <div className="lv-wrap lv-top-row">
        <Link href="/living" className="lv-top-mark"><b>assembl</b><span>/ living</span></Link>
        <nav className="lv-top-nav" aria-label="Living">
          <Link href="/living">dayrally kits</Link>
          <Link href="/living#ls-home">at home</Link>
          <Link href="/living#ls-shop">the pieces</Link>
          <Link href="/living/studio" aria-current={current === 'studio' ? 'page' : undefined}>space studio</Link>
        </nav>
        <span className="lv-top-tag">designed · not yet printed · nothing for sale yet</span>
      </div>
    </header>
  );
}

export function LivingFoot() {
  const served = CAD_MANIFEST.parts.filter((p) => p.file).length;
  return (
    <footer className="lv-foot">
      <div className="lv-wrap lv-foot-row">
        <p className="lv-foot-line">photo in. design out.</p>
        <ul>
          <li className="lv-mono">by assembl / living</li>
          <li className="lv-mono">the assembl TURN standard · {served} print files · {CAD_MANIFEST.pack}</li>
          <li className="lv-mono">designed · not yet printed · nothing for sale yet</li>
          <li><Link href="/">assembl</Link></li>
        </ul>
      </div>
    </footer>
  );
}
