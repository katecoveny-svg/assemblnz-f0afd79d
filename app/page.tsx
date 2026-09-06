import type { Metadata } from 'next';
import { AssemblHomepage } from '@/components/site/AssemblHomepage';

const HOME_DESCRIPTION =
  'Every customer journey has moments in between. Assembl turns waiting, processing and handoff into useful progress — with specialist agents, human control and proof.';

export const metadata: Metadata = {
  title: 'assembl · active customer journeys',
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'assembl · active customer journeys',
    description: HOME_DESCRIPTION,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl · active customer journeys',
    description: HOME_DESCRIPTION,
  },
};

export default function HomePage() {
  return <AssemblHomepage />;
}
