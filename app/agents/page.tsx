import type { Metadata } from 'next';
import { CinematicAgents } from '@/components/site/cinematic/CinematicAgents';
import '../cine.css';

/**
 * /agents — Kate's agents.html prototype (2026-07-24), ported 1:1 to the
 * cinematic design system. Middleware's marketplace redirect now exempts the
 * exact /agents path so this page serves.
 */

export const metadata: Metadata = {
  title: 'assembl · agents',
  description: 'Specialists, not one assistant. Each agent knows what it can do — and exactly where you stay in control.',
  alternates: { canonical: '/agents' },
};

export default function AgentsPage() {
  return <CinematicAgents />;
}
