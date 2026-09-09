import type { Metadata } from "next";
import { AssemblHomepage } from "@/components/site/AssemblHomepage";

const HOME_DESCRIPTION =
  "assembl designs and runs agentic customer journeys, from first enquiry to final handoff. Specialist agents prepare the work. Your people stay in control.";

export const metadata: Metadata = {
  title: "assembl · active customer journeys",
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "assembl · active customer journeys",
    description: HOME_DESCRIPTION,
    type: "website",
    locale: "en_NZ",
    url: "https://www.assembl.co.nz",
    siteName: "assembl",
  },
  twitter: {
    card: "summary_large_image",
    title: "assembl · active customer journeys",
    description: HOME_DESCRIPTION,
import type { Metadata } from 'next';
import { CinematicJourneyHome } from '@/components/site/cinematic-journey/CinematicJourneyHome';
import { HOME_META } from '@/components/site/cinematic-journey/copy';

export const metadata: Metadata = {
  title: HOME_META.title,
  description: HOME_META.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_META.title,
    description: HOME_META.description,
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_META.title,
    description: HOME_META.description,
  },
};

/** Preview: cinematic 3D homepage. Do not merge to production until Kate signs off. */
export default function HomePage() {
  return <CinematicJourneyHome />;
}
