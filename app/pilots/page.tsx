import type { Metadata } from 'next';
import { CinematicSubpage } from '@/components/site/cinematic/CinematicSubpage';
import '../cine.css';

export const metadata: Metadata = {
  title: 'assembl · pilots',
  description: 'Founding pilots — one real repeat task, one supervised agent, measured honestly.',
  alternates: { canonical: '/pilots' },
};

export default function PilotsPage() {
  return (
    <CinematicSubpage
      spec={{
        kicker: 'pilots',
        h1a: 'One real task,',
        h1b: 'measured honestly.',
        lede: 'We work closely with a small group of New Zealand businesses to replace one repeat task with a supervised agent — and record exactly what changed.',
        panels: [
          { n: '01', h: 'the blueprint', p: 'We encode what you sell, how you speak, what you allow. Your living source of truth.' },
          { n: '02', h: 'the agent', p: 'One working agent, one customer journey, end to end — drafts only, approval visible.' },
          { n: '03', h: 'the proof', p: 'Time returned, satisfaction, cost — measured against your baseline and shown plainly.' },
        ],
        cta: { label: 'see the founding offer', href: '/pricing' },
        scene: 'pilots',
      }}
    />
  );
}
