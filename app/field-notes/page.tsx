import type { Metadata } from 'next';
import { CinematicSubpage } from '@/components/site/cinematic/CinematicSubpage';
import '../cine.css';

/**
 * /field-notes — a light cinematic index. Deliberately NOT the quarantined
 * Field Notes build (parked 2026-07-20; not to be resurrected without Kate).
 */

export const metadata: Metadata = {
  title: 'assembl · field notes',
  description: 'Notes from the workshop — what we are building and what we are learning.',
  alternates: { canonical: '/field-notes' },
};

export default function FieldNotesPage() {
  return (
    <CinematicSubpage
      spec={{
        kicker: 'field notes',
        h1a: 'Notes from',
        h1b: 'the workshop.',
        lede: 'Short, honest notes on what we are building and what we are learning — the agentic era from the workbench, not the conference stage.',
        panels: [
          { n: '01', h: 'first notes coming', p: 'The first field notes are being written now. The inbox is the fastest way to hear when they land.' },
          { n: '02', h: 'what to expect', p: 'Build logs, measured results from pilots, and the occasional strong opinion about visible AI.' },
          { n: '03', h: 'from the founder', p: 'Written by Kate and the team — plain words, real numbers, nothing ghostwritten.' },
        ],
        cta: { label: 'watch the platform', href: '/' },
        scene: 'notes',
      }}
    />
  );
}
