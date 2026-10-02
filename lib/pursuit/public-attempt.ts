import type { TrialInput, PublicResearchResult, PublicPresentationResult } from './public-contract';

export type PublicBrief = Omit<TrialInput, 'requestId'>;
export type PublicAttempt = { input: Readonly<TrialInput>; fingerprint: string };

function normalized(brief: PublicBrief): PublicBrief {
  return { company: brief.company.trim(), goal: brief.goal.trim(), consent: brief.consent,
    useTypeSafe: brief.useTypeSafe, ...(brief.workflow ? { workflow: brief.workflow } : {}), ...(brief.sourceMode ? { sourceMode: brief.sourceMode } : {}), ...(brief.directFocus ? { directFocus: brief.directFocus } : {}) };
}

export function matchesPublicAttempt(attempt: PublicAttempt | null, brief: PublicBrief): boolean {
  return Boolean(attempt && attempt.fingerprint === JSON.stringify(normalized(brief)));
}

/** One identity per unchanged brief, including timeout/recovery. Never persisted in browser storage. */
export function publicAttempt(previous: PublicAttempt | null, brief: PublicBrief, createId: () => string): PublicAttempt {
  if (matchesPublicAttempt(previous, brief)) return previous!;
  const input = normalized(brief);
  return { input: Object.freeze({ requestId: createId(), ...input }), fingerprint: JSON.stringify(input) };
}

/** Bind only the immutable submitted request, never current editable form state.
 * No prompt is returned by the server or written to browser storage. */
export function bindPublicPresentation(result: PublicResearchResult, attempt: PublicAttempt): PublicPresentationResult {
  if (result.trace.id !== attempt.input.requestId) throw new Error('The result did not match the submitted request.');
  const presentation: PublicPresentationResult = {...result};
  delete presentation.scopedPlan;
  if (result.mode === 'direct_source_brief' && attempt.input.sourceMode === 'direct_source_brief' && result.planKind === 'authored_starter_plan') {
    presentation.scopedPlan = {kind:'authored_starter_plan',yourBrief:attempt.input.goal,focus:attempt.input.directFocus??'goal-led'};
  }
  return presentation;
}
