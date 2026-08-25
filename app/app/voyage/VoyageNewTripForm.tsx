'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Props = {
  ownerId: string;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; tripId: string; message: string };

/**
 * Client-side form that submits a natural-language trip brief to the
 * `voyage-agent` Supabase Edge Function in "natural" mode. The function
 * converts the prompt to a structured payload via Gemini and writes
 * trip_plans + trip_destinations + trip_days + trip_activities to the
 * March schema. On success we router.refresh() so the new trip card
 * shows up in the list above.
 */
export function VoyageNewTripForm({ ownerId }: Props) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(
    'Plan me a 10-day Italy trip in early June: Rome → Florence → Cinque Terre → Venice. Travelling solo from Auckland. Budget around NZ$8,000 for the trip excluding flights. Must include Vatican Museums and the Uffizi.',
  );
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setStatus({ kind: 'pending' });

    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('voyage-agent', {
        body: { mode: 'natural', prompt: prompt.trim(), owner_id: ownerId },
      });
      if (error) {
        setStatus({ kind: 'error', message: error.message });
        return;
      }
      const payload = data as
        | { trip_id?: string; url?: string; message?: string; error?: string }
        | null;
      if (!payload || payload.error) {
        setStatus({
          kind: 'error',
          message: payload?.error ?? 'Voyage returned no trip_id.',
        });
        return;
      }
      if (!payload.trip_id) {
        setStatus({
          kind: 'error',
          message: 'Voyage returned no trip_id. Check function logs.',
        });
        return;
      }
      setStatus({
        kind: 'success',
        tripId: payload.trip_id,
        message: payload.message ?? 'Trip saved.',
      });
      router.refresh();
    } catch (err) {
      setStatus({
        kind: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Unknown error invoking voyage-agent.',
      });
    }
  }

  const pending = status.kind === 'pending';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={6}
        disabled={pending}
        className="w-full resize-y rounded-card border border-[rgba(35,33,31,0.15)] bg-white/75 p-4 font-sans text-sm leading-relaxed text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--assembl-pounamu)] focus:outline-none disabled:opacity-60"
        placeholder="Describe the trip — destinations, dates, travellers, must-dos, budget."
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !prompt.trim()}
          className="rounded-full bg-[color:var(--assembl-pounamu)] px-5 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--assembl-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Drafting trip…' : 'Draft trip'}
        </button>
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
          ~10–30 seconds · Gemini 2.5 Flash · always a draft
        </span>
      </div>

      {status.kind === 'error' && (
        <p
          role="alert"
          className="rounded-card border border-[rgba(200,60,60,0.25)] bg-[rgba(200,60,60,0.06)] px-4 py-3 text-sm text-[#a3261d]"
        >
          {status.message}
        </p>
      )}

      {status.kind === 'success' && (
        <p
          role="status"
          className="rounded-card border border-[rgba(43,107,87,0.25)] bg-[rgba(43,107,87,0.06)] px-4 py-3 text-sm text-[color:var(--assembl-pounamu)]"
        >
          {status.message} The trip is now in your list above — open it in chat
          to refine.
        </p>
      )}
    </form>
  );
}
