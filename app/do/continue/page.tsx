import type { Metadata } from 'next';
import { PortableDo } from './PortableDo';
export const metadata: Metadata = { title: 'Continue with DO', robots: { index: false, follow: false } };
export default async function ContinuePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return <PortableDo initialFixture={params.fixture === '1'} initialScope={params.scope === 'work' ? 'work' : 'personal'} />;
}
