import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AssemblGlassMark } from '@/components/site/AssemblGlassMark';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';
import styles from './contact-chrome.module.css';

export function ContactHeader({ contact = false }: { contact?: boolean }) {
  return <header className={styles.header}>
    <Link href="/" aria-label="assembl home" className={styles.brand}><AssemblGlassMark size={36} /><AssemblWordmark /></Link>
    <nav aria-label="Primary"><Link href="/">Home</Link><Link href="/lab">Lab</Link></nav>
    <Link href={contact ? '#project-brief' : '/contact'} className={styles.open}>{contact ? 'Start a conversation' : 'Bring us the work'}<ArrowUpRight size={16} aria-hidden="true" /></Link>
  </header>;
}

export function ContactFooter() {
  return <footer className={styles.footer}>
    <div><Link href="/" aria-label="assembl home" className={styles.brand}><AssemblGlassMark size={32} /><AssemblWordmark /></Link><p>Useful work. Built in Aotearoa New Zealand.</p></div>
    <nav aria-label="Footer"><Link href="/lab">Lab</Link><Link href="/#try">About assembl</Link><Link href="/contact">Contact</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/disclaimer">Disclaimer</Link><Link href="/legal/meta-data-deletion">Meta data deletion</Link></nav>
  </footer>;
}
