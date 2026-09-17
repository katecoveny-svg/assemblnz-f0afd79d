import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from '@/components/public/public-pages.module.css';
import company from '@/components/public/company-pages.module.css';

export const metadata: Metadata = {
  title: 'How assembl works',
  description:
    'Pursuit finds the opportunity. DO moves the work forward. Studio makes the result tangible. Context, permissions and proof stay connected underneath.',
  alternates: { canonical: '/how-it-works' },
};

const products = [
  {
    n: '01',
    name: 'Pursuit',
    verb: 'find it.',
    body: 'Bring relevant signals, source evidence and business context together. Decide what is worth acting on and what the next move should be.',
    href: '/pursuit',
  },
  {
    n: '02',
    name: 'DO',
    verb: 'DO it.',
    body: 'Bring the right agent, tools, model and permissions to a bounded job. Keep the prepared result, approval state and evidence visible.',
    href: '/do',
  },
  {
    n: '03',
    name: 'Studio',
    verb: 'show it.',
    body: 'Turn the opportunity or completed work into something people can see, test and understand: a demonstrator, site, pitch, campaign, film or experience.',
    href: '/creative-studio',
  },
] as const;

const loop = [
  ['Signal', 'A relevant change, need, deadline or opportunity comes into view.'],
  ['Find', 'Pursuit gathers evidence and prepares the opportunity.'],
  ['DO', 'The right agent and tools move the bounded work forward.'],
  ['Show', 'Studio makes the result tangible enough to review, sell, test or ship.'],
  ['Learn', 'Evidence and decisions strengthen the next job instead of disappearing into a chat.'],
] as const;

export default function HowItWorksPage() {
  return (
    <div className={`${styles.page} ${company.page}`}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>how it works · one connected loop</p>
          <h1>find it.<br />DO it.<br />show it.</h1>
          <p className={styles.lede}>
            Start with the product that matches the work in front of you. Connect the full loop when the opportunity, execution and proof need to stay together.
          </p>
        </div>
        <aside className={styles.heroAside} aria-label="Pursuit, DO and Studio">
          {products.map((product) => (
            <div className={styles.heroFact} key={product.name}>
              <span>{product.n}</span>
              <div>
                <strong><Link href={product.href}>{product.name} · {product.verb} <ArrowUpRight size={16} aria-hidden="true" /></Link></strong>
                <p>{product.body}</p>
              </div>
            </div>
          ))}
        </aside>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>signal → action → proof</p>
        <h2>The work stays connected.</h2>
        <p className={styles.lede}>
          The shared operating layer carries context, tools, permissions, evidence and learning underneath the products. The model or interface can change without forcing the job to start from zero.
        </p>
        <div style={{ display: 'grid', gap: '1px', marginTop: 36, background: 'rgba(36,11,33,.10)' }}>
          {loop.map(([label, body], index) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: 20, padding: '22px 24px', background: 'var(--surface, #fffdfb)' }}>
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: '#916A70' }}>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong style={{ color: '#240B21' }}>{label}</strong>
                <p style={{ marginTop: 6 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>people stay in control</p>
        <h2>Permission is part of the product.</h2>
        <p className={styles.lede}>
          Connecting a system does not automatically grant authority to send, publish, spend or make irreversible changes. Consequential actions use the approval boundary agreed for the workflow, and completed work should leave evidence or a receipt.
        </p>
        <p>Previews, simulations and demonstrations stay labelled. A polished interface is not treated as proof that an external action happened.</p>
        <Link href="/contact?product=system">Bring us the work <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
