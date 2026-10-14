import type {Metadata} from 'next';
import {ProductLanding} from '@/components/site/assembl-the-work/ProductLanding';
export const metadata: Metadata = {
  title: { absolute: "Studio by assembl | Give the idea a working version" },
  description: "Develop working software, demos, pitches and customer experiences with assembl Studio. Agree the brief, build a useful version and review it.",
  alternates: { canonical: "/creative-studio" },
  openGraph: { title: "Studio by assembl | Give the idea a working version", description: "Develop working software, demos, pitches and customer experiences with assembl Studio. Agree the brief, build a useful version and review it.", url: "https://www.assembl.co.nz/creative-studio", type: 'website', locale: 'en_NZ', siteName: 'assembl' },
  twitter: { card: 'summary_large_image', title: "Studio by assembl | Give the idea a working version", description: "Develop working software, demos, pitches and customer experiences with assembl Studio. Agree the brief, build a useful version and review it." },
};
export default function CreativeStudioPage(){return <ProductLanding product="studio"/>;}
