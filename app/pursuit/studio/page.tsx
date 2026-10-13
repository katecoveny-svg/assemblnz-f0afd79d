import type { Metadata } from 'next';
import { PublicStudio } from './PublicStudio';
export const metadata: Metadata = {
  title: 'Pursuit to Studio — make a short film',
  description: 'Try a fictional brief, edit four scenes and export a short video in your browser. No sign-in required.',
  alternates: { canonical: '/pursuit/studio' },
};
export default async function PublicStudioPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams;
  return <PublicStudio exampleId={example} />;
}
