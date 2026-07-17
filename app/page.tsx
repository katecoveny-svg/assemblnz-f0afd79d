import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssemblHero } from '@/components/assembl-hero/AssemblHero';
import { TimeSavingsCalculator } from '@/components/home/TimeSavingsCalculator';
import { HOME } from '@/lib/copy/homepage';
import styles from './home-simplified.module.css';

export const metadata: Metadata = {
  title: HOME.metadata.title,
  description: HOME.metadata.description,
  alternates: { canonical: '/' },
};

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

function sharedNumber(
  value: string | string[] | undefined,
  allowed: (candidate: number) => boolean,
  fallback: number,
) {
  const candidate = Number(Array.isArray(value) ? value[0] : value);
  return allowed(candidate) ? candidate : fallback;
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const query = await searchParams;
  const initialSavings = {
    people: sharedNumber(query.team, (value) => Number.isInteger(value) && value >= 1 && value <= 25, 3),
    adminHours: sharedNumber(query.admin, (value) => Number.isInteger(value) && value >= 1 && value <= 20, 6),
    repeatableShare: sharedNumber(
      query.repeatable,
      (value) => HOME.savings.repeatableOptions.some((option) => option.value === value),
      35,
    ),
  };

  return (
    <div className={styles.page}>
      <AssemblHero />
      <TimeSavingsCalculator initialValues={initialSavings} />

      <section className={styles.how} aria-labelledby="simple-how-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{HOME.how.eyebrow}</p>
          <h2 id="simple-how-title">{HOME.how.heading}</h2>
        </div>
        <div className={styles.steps}>
          {HOME.how.steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.pilot} aria-labelledby="pilot-title">
        <div className={styles.pilotCopy}>
          <p className={styles.eyebrow}>{HOME.pilot.eyebrow}</p>
          <h2 id="pilot-title">{HOME.pilot.heading}</h2>
          <p>{HOME.pilot.body}</p>
          <ul>{HOME.pilot.includes.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className={styles.pilotActions}>
          <Link href="/pilot-sprint">{HOME.pilot.actions.primary} <ArrowRight aria-hidden /></Link>
          <Link href="/pricing">{HOME.pilot.actions.secondary}</Link>
        </div>
      </section>
    </div>
  );
}
