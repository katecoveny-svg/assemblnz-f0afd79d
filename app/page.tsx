import type { Metadata } from 'next';
import { TimeSavingsCalculator } from '@/components/home/TimeSavingsCalculator';
import { OneMinuteBusiness } from '@/components/one-minute-business/OneMinuteBusiness';
import { HOME } from '@/lib/copy/homepage';
import styles from './home-simplified.module.css';

export const metadata: Metadata = {
  title: 'one minute business · assembl',
  description: 'Describe your business and see its Business Genome, coordinated agent team and first useful result form in about a minute.',
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
      <OneMinuteBusiness />
      <TimeSavingsCalculator initialValues={initialSavings} />
    </div>
  );
}
