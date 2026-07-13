import Link from 'next/link';
import { ArrowDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ParticleCanvas } from './ParticleCanvas';
import styles from './assembl-hero.module.css';

export function AssemblHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.signalRail} aria-label="assembl operating principles">
        <span>Living Business Genome</span>
        <span>Built in Aotearoa</span>
        <span><i aria-hidden /> Human approval stays visible</span>
      </div>

      <div className={styles.heroCanvas}>
        <ParticleCanvas />
      </div>

      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Your business · understood as one living system</p>
        <h1>
          Your business already has a genome.
          <span>assembl makes it intelligent.</span>
        </h1>
        <p className={styles.lede}>
          Connect the people, knowledge, customers and workflows you already have. assembl turns that context into a working operating system — with specialised agents, clear permissions and proof before anything consequential changes.
        </p>
        <div className={styles.actions}>
          <Link href="/pilot-sprint">
            Build your Business Genome <ArrowRight aria-hidden />
          </Link>
          <Link href="#business-genome" className={styles.secondaryAction}>
            See the living system <ArrowDown aria-hidden />
          </Link>
        </div>
        <div className={styles.proofLine}>
          <span><CheckCircle2 aria-hidden /> One shared source of truth</span>
          <span><CheckCircle2 aria-hidden /> Review before send</span>
          <span><CheckCircle2 aria-hidden /> Sources attached</span>
        </div>
      </div>
    </header>
  );
}
