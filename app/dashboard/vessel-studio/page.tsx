import type { Metadata } from 'next';
import { VesselStudio } from '@/components/dashboard/vessel-studio/VesselStudio';
import {
  isFounderAuthed,
  isFounderConfigured,
} from '@/lib/vessel-studio/founderAuth';
import {
  isPersistenceConfigured,
  listGenerations,
} from '@/lib/vessel-studio/persistence';
import { hasEdgeFunctionConfig } from '@/lib/vessel-studio/generate';
import { FounderGateForm } from './FounderGateForm';
import { clearFounderGate } from './founder-gate-action';

export const metadata: Metadata = {
  title: 'vessel studio',
  description: 'Founder/admin tool — Mārama Whenua vessel imagery generator.',
};

export default async function VesselStudioPage() {
  const authed = await isFounderAuthed();
  const configured = isFounderConfigured();

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center px-6 py-16">
        <div className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> dashboard
        </div>
        <h1 className="mt-2 font-display text-[36px] font-light leading-tight text-[color:var(--text-primary)]">
          vessel studio
        </h1>
        <p className="mt-2 font-mono text-[11px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
          founder tool · gated
        </p>
        <div className="mt-8 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-6">
          <FounderGateForm configured={configured} />
        </div>
      </main>
    );
  }

  const persistenceConfigured = await isPersistenceConfigured();
  const initialGenerations = persistenceConfigured ? await listGenerations(12) : [];
  const edgeConfigured = hasEdgeFunctionConfig();

  return (
    <main>
      <header className="border-b border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-8 pb-2 pt-7 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs lowercase tracking-[0.18em] text-[color:var(--text-primary)]">
              assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span>{' '}
              dashboard
            </div>
            <form action={clearFounderGate}>
              <button
                type="submit"
                className="font-mono text-[10.5px] lowercase tracking-[0.16em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              >
                sign out
              </button>
            </form>
          </div>
          <h1 className="mt-1 font-display text-[38px] font-light leading-[1.1] tracking-[0.005em] text-[color:var(--text-primary)]">
            vessel studio
          </h1>
          <p className="mt-1.5 font-mono text-[11px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
            a quiet prompt builder for hero imagery · flux 1.1 pro via fal.ai
          </p>
          {!edgeConfigured && (
            <p className="mt-2 font-mono text-[10.5px] tracking-[0.06em] text-[color:var(--text-secondary)]">
              · edge function not configured — using direct fal.ai with a browser-supplied key
            </p>
          )}
          {!persistenceConfigured && (
            <p className="mt-1 font-mono text-[10.5px] tracking-[0.06em] text-[color:var(--text-secondary)]">
              · supabase persistence not configured — gallery is local to this browser
            </p>
          )}
        </div>
      </header>

      <VesselStudio
        initialGenerations={initialGenerations}
        persistenceConfigured={persistenceConfigured}
      />

      <footer className="mx-auto max-w-[1280px] px-8 pb-10 pt-2 text-right font-mono text-[10.5px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)] md:px-10">
        assembl · vessel studio · founder tool
      </footer>
    </main>
  );
}
