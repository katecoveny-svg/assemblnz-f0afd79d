import Link from 'next/link';
import { DoMark } from './DoMark';
import { DoPresence } from './DoPresence';
import styles from './do-unified.module.css';

export function DoBrand({ href = '/do', target, rel, finish = 'plum' }: { href?: string; target?: string; rel?: string; finish?: 'plum' | 'glass' }) {
  return <Link href={href} target={target} rel={rel} className={styles.brand} aria-label="DO by assembl, home">{finish === 'glass' ? <span className={styles.flatMark}><DoMark /></span> : <DoPresence size="small" />}<span>DO<small>by assembl</small></span></Link>;
}

/** Rounded product shapes, kept recognisable at a small control size. */
export function DoActionIcon({ kind }: { kind: 'note' | 'voice' | 'photo' | 'arrow' }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'note' && <><path d="M6 3.5h8l4 4V20H6a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" /><path d="M14 3.5v4h4M8 12h6M8 16h4" /></>}
    {kind === 'voice' && <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" /></>}
    {kind === 'photo' && <><rect x="3" y="5" width="18" height="15" rx="4" /><circle cx="8" cy="10" r="1.5" /><path d="m4 17 5-4 4 3 3-5 5 5" /></>}
    {kind === 'arrow' && <><path d="M5 12h14M13 6l6 6-6 6" /></>}
  </svg>;
}
