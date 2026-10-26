import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './lab.module.css';

const LAB_URL = 'https://assembl-lab.vercel.app/';

export const metadata: Metadata = {
  title: 'Lab — interactive worlds',
  description: 'Explore interactive 3D models of everyday places. Change something, follow what happens and inspect the sources behind each simulation.',
  alternates: { canonical: '/lab' },
};

/** Keep the Lab on its own origin: its nested 3D previews and controls share that origin. */
export default function LabPage() {
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <Link href="/" className={styles.home} aria-label="Back to assembl">← assembl</Link>
        <h1 className={styles.title}>Lab <span>Interactive worlds</span></h1>
        <a href={LAB_URL} target="_blank" rel="noopener noreferrer" className={styles.open}>Open full page ↗</a>
      </header>
      <iframe
        className={styles.frame}
        src={LAB_URL}
        title="assembl lab — interactive 3D worlds and study machines"
        allow="fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <footer className={styles.note}>
        <span>Models and public-data shadows. Sources and assumptions stay inside each experiment.</span>
        <a href={LAB_URL} target="_blank" rel="noopener noreferrer">Lab not loading? Open directly ↗</a>
      </footer>
    </div>
  );
}
