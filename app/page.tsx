import type { Metadata } from 'next';
import { CinematicHome } from '@/components/site/cinematic/CinematicHome';
import './cine.css';

/**
 * assembl.co.nz homepage — Kate's cinematic prototype
 * (~/assembl-3d-gallery, 2026-07-24), ported 1:1 into the app.
 * See components/site/cinematic/CinematicHome.tsx for the port notes.
 */

export const metadata: Metadata = {
  title: 'assembl — agentic customer journeys',
  description:
    'assembl — the visual operating system for assembling, deploying and understanding intelligent business systems. Aotearoa New Zealand.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <CinematicHome />;
}
