import Link from 'next/link';
import { AssemblGlassMark } from '@/components/site/AssemblGlassMark';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';
import styles from './contact-chrome.module.css';

const products = [['/pursuit', 'Pursuit'], ['/do', 'DO'], ['/creative-studio', 'Studio']] as const;

export function ContactHeader() {
  return <header className={styles.header}>
    <Link href="/" aria-label="assembl home" className={styles.brand}><AssemblGlassMark size={32} /><AssemblWordmark /></Link>
    <nav aria-label="Primary">{products.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <Link href="/do" className={styles.open}>Open DO <span aria-hidden="true">↗</span></Link>
  </header>;
}

export function ContactFooter() {
  return <footer className={styles.footer}>
    <Link href="/" aria-label="assembl home" className={styles.brand}><AssemblGlassMark size={32} /><AssemblWordmark /></Link>
    <nav aria-label="Footer">{products.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/about">About</Link><Link href="/legal/privacy">Privacy</Link></nav>
  </footer>;
}
