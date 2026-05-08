import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agent marketplace',
  description:
    'Agent provisioning happens through your Pilot Sprint. Book one to talk to a real assembl team member.',
};

export default function AgentsPage() {
  return (
    <section
      className="relative py-32 md:py-48"
      style={{ backgroundColor: 'var(--assembl-paper)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none mx-auto max-w-7xl px-6 md:px-12"
      >
        <div
          className="h-px w-full"
          style={{ backgroundColor: 'rgba(212,168,83,0.20)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-y-8 pt-20 md:pt-28 lg:grid-cols-12">
          <div className="lg:col-start-2 lg:col-span-6">
            <p className="mb-6 font-mono text-sm uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:mb-8">
              Phase 1B · Coming
            </p>
            <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-[color:var(--text-primary)] md:text-6xl lg:text-7xl">
              Agent <em className="not-italic text-gradient-hero">marketplace</em>.
            </h1>
            <p className="mt-10 text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              Coming in Phase 1B. Right now agent provisioning happens through your
              Pilot Sprint — book one to talk to a real assembl team member.
            </p>
            <div className="mt-12">
              <Link
                href="/pilot-sprint"
                className="cta-primary inline-flex items-center px-8 py-4 text-base transition-transform hover:-translate-y-0.5 md:text-lg"
              >
                Book a pilot
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
