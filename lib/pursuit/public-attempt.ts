import type { TrialInput } from './public-contract';

export type PublicBrief = Omit<TrialInput, 'requestId'>;
export type PublicAttempt = { input: TrialInput; fingerprint: string };

function normalized(brief: PublicBrief): PublicBrief {
  return { company: brief.company.trim(), goal: brief.goal.trim(), consent: brief.consent,
    useTypeSafe: brief.useTypeSafe, ...(brief.workflow ? { workflow: brief.workflow } : {}) };
}

export function matchesPublicAttempt(attempt: PublicAttempt | null, brief: PublicBrief): boolean {
  return Boolean(attempt && attempt.fingerprint === JSON.stringify(normalized(brief)));
}

/** One identity per unchanged brief, including timeout/recovery. Never persisted in browser storage. */
export function publicAttempt(previous: PublicAttempt | null, brief: PublicBrief, createId: () => string): PublicAttempt {
  if (matchesPublicAttempt(previous, brief)) return previous!;
  const input = normalized(brief);
  return { input: { requestId: createId(), ...input }, fingerprint: JSON.stringify(input) };
}
