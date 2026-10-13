import type { Metadata } from 'next';
import Link from 'next/link';
import { MailWorkspace } from './MailWorkspace';
import { DoBrand } from '@/components/do/DoBrand';
import styles from './mail.module.css';

export const metadata: Metadata = { title: { absolute: 'Mail review · DO' }, robots: { index: false, follow: false } };
export default function MailPage() {
  return <main className={styles.shell}>
    <nav><DoBrand /><Link href="/do/connections">Connections</Link></nav>
    <p className={styles.eyebrow}>Personal DO / correspondence</p>
    <h1>Find the correspondence. Prepare your next step.</h1>
    <p>Choose one account and a short time range. Review the evidence, then write a task draft here.</p>
    <MailWorkspace />
  </main>;
}
