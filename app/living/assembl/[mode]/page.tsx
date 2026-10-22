import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MODES, type Mode } from '@/lib/living/builder';
import { fredoka } from '../../fonts';
import { LivingFoot, LivingHeader } from '../../LivingChrome';
import { AssemblBuilder } from '../AssemblBuilder';
import '../../living.css';
import '../assembl.css';

export const metadata: Metadata = {
  title: 'assembl yours — assembl / living',
  description: 'Pick and mix: drag the parts into your pod, your wall, your bike or your day and see it built from the real print files, with a price and a timeline.',
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return MODES.map((m) => ({ mode: m.id }));
}

export default async function AssemblPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  if (!MODES.some((m) => m.id === mode)) notFound();
  return (
    <div className={`lv ${fredoka.variable}`}>
      <LivingHeader current="assembl" />
      <AssemblBuilder initialMode={mode as Mode} />
      <LivingFoot />
    </div>
  );
}
