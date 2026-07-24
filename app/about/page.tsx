import type { Metadata } from 'next';
import { CinematicSubpage } from '@/components/site/cinematic/CinematicSubpage';
import '../cine.css';

export const metadata: Metadata = {
  title: 'assembl · about',
  description: 'An independent New Zealand agency for the agentic era. We make AI visible.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <CinematicSubpage
      spec={{
        kicker: 'about',
        h1a: 'An independent',
        h1b: 'NZ agency.',
        lede: 'assembl builds intelligent systems people can see, hold and understand. Founded in Aotearoa for the agentic era — every agent visible, every decision traceable, every send approved by a person.',
        panels: [
          { n: '01', h: 'what we believe', p: 'AI is not complex. Visible agents are the only agents people actually adopt.' },
          { n: '02', h: 'how we work', p: 'One Blueprint per business. Specialist agents with contracts. Evidence, not analytics.' },
          { n: '03', h: 'where we stand', p: 'Aotearoa New Zealand. NZ-hosted. NZ Privacy Act compliant. Named support, not a ticket queue.' },
        ],
        cta: { label: 'see the platform', href: '/' },
        scene: 'about',
      }}
    />
  );
}
