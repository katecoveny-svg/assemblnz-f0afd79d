import type { PilotInput, PilotResult } from './core';
import type { DoPreparationInput, DoPreparedDraft } from '@/apps/do/shared/preparation';

/** A preparation receipt is not a database save, delivery receipt or permission. */
export type DoWorkflowResult = {
  state: 'prepared' | 'needs_input' | 'failed' | 'cancelled';
  message: string;
  draft: DoPreparedDraft | null;
  persisted: false;
  externalActions: false;
  reviewRequired: true;
  generatedDraftVerified: false;
};
export type WorkflowPilotResult = PilotResult & { workflow?: DoWorkflowResult };
export type WorkflowDependencies = {
  reserve: () => Promise<{ release: () => Promise<void> }>;
  prepare: (input: DoPreparationInput, signal?: AbortSignal) => Promise<DoPreparedDraft>;
};
export class DoWorkflowConsentError extends Error {
  constructor() { super('Confirm that DO may use this context with its preparation providers for this request.'); }
}
export function requireDoWorkflowConsent(raw: unknown): void {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
      (raw as Record<string, unknown>).shareWithDo !== true) throw new DoWorkflowConsentError();
}

/** The caller must supply the server's own evaluation, never a client-posted decision. */
export function preparationForDecision(input: PilotInput, pilot: PilotResult): DoPreparationInput | null {
  if (!input.shareWithTypeSafe || pilot.mode !== 'live' || !pilot.trace.providerCalled || !pilot.evaluation) return null;
  const action = pilot.decision.action;
  if (action === 'ask_user' || action === 'unsupported') return null;
  const task = action === 'extract_facts' ? 'extract' : action === 'studio_handoff' ? 'plan' : action === 'prepare_brief' ? 'brief' : null;
  if (!task) return null;
  return {
    task, brief: input.intent, source: input.page.text,
    sourceTitle: input.page.title.slice(0, 160), sourceUrl: input.page.url, consent: true,
  };
}
const result = (state: DoWorkflowResult['state'], message: string, draft: DoPreparedDraft | null = null): DoWorkflowResult => ({
  state, message, draft, persisted: false, externalActions: false,
  reviewRequired: true, generatedDraftVerified: false,
});

/** Uses DO's existing model/extraction service and entitlement reservation. No tools are executed. */
export async function runDoWorkflow(
  input: PilotInput, pilot: PilotResult, dependencies: WorkflowDependencies, signal?: AbortSignal,
): Promise<DoWorkflowResult> {
  const preparation = preparationForDecision(input, pilot);
  if (!preparation) return result('needs_input', 'No permitted preparation was selected. Review the request; no drafting allowance was consumed.');
  if (signal?.aborted) return result('cancelled', 'Preparation was cancelled before it started.');
  let reservation: Awaited<ReturnType<WorkflowDependencies['reserve']>> | undefined;
  try {
    reservation = await dependencies.reserve();
    if (signal?.aborted) {
      await reservation.release().catch(() => {});
      return result('cancelled', 'Preparation was cancelled before generation.');
    }
    const draft = await dependencies.prepare(preparation, signal);
    return result('prepared', 'Prepared through the existing DO service. Review this draft before use. The TypeSafe claim check concerns the supplied claim, not an independent verification of this new draft.', draft);
  } catch {
    if (reservation) await reservation.release().catch(() => {});
    // Do not expose provider bodies, credentials or internal database errors.
    return signal?.aborted
      ? result('cancelled', 'Preparation was cancelled. The TypeSafe result is retained; no external action was made.')
      : result('failed', 'DO preparation is unavailable, limited, or failed. The TypeSafe result is retained. No prepared draft, record save, send or publication is claimed.');
  }
}
