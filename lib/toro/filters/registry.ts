/**
 * Tōro filter pipeline registry.
 *
 * Composes the six default Phase 1 filters into the pipeline declared
 * in agent.yaml (spec §4.3). Filters are listed in execution order;
 * the runtime groups by phase and runs each phase as a chain where
 * each filter's `modifiedBody` becomes the input for the next.
 *
 * Pluggability: per-tenant overrides eventually swap individual
 * filters or rearrange order — that's why filters are values, not
 * functions registered by name. To override per-tenant, build a
 * derived array (e.g. `[...TORO_DEFAULT_PIPELINE.filter(f => f.name
 * !== 'tikanga_before_draft'), customTikangaFilter]`) and pass it
 * to runPipeline.
 *
 * Hard rule #20 (canon): no Tōro draft skips the pipeline. Removing
 * a filter is a per-tenant configuration choice with an audit trail;
 * not running the pipeline at all is forbidden.
 */
import type { Filter, FilterContext, FilterPhase, FilterResult } from './types';
import { tikangaBeforeDraft } from './tikanga-before-draft';
import { privacyBeforeDraft } from './privacy-before-draft';
import { consentBeforeDraft } from './consent-before-draft';
import { ageGateAfterDraft } from './age-gate-after-draft';
import { tikangaAfterDraft } from './tikanga-after-draft';
import { auditBeforeSend } from './audit-before-send';

export const TORO_DEFAULT_PIPELINE: Filter[] = [
  // before_draft
  tikangaBeforeDraft,
  privacyBeforeDraft,
  consentBeforeDraft,
  // after_draft
  ageGateAfterDraft,
  tikangaAfterDraft,
  // before_send
  auditBeforeSend,
];

export interface PipelineRunResult {
  pass: boolean;
  ctx: FilterContext;
  results: Array<{ filter: string; result: FilterResult }>;
}

/**
 * Run a single phase of the pipeline.
 *
 * Iterates the filters in declaration order, skipping any whose
 * `phase` does not match. Each filter receives the context as
 * mutated by upstream filters in this phase: a `modifiedBody`
 * returned by filter N becomes `incomingMessage` (in before_draft)
 * or `draftBody` (in after_draft / before_send) for filter N+1.
 *
 * Returns immediately on the first `pass: false` result. The
 * caller decides whether to short-circuit the whole pipeline (hard
 * gate, e.g. consent missing) or surface the failure as a draft
 * annotation.
 */
export async function runPipeline(
  filters: Filter[],
  phase: FilterPhase,
  ctx: FilterContext,
): Promise<PipelineRunResult> {
  let workingCtx: FilterContext = { ...ctx };
  const results: PipelineRunResult['results'] = [];

  for (const filter of filters) {
    if (filter.phase !== phase) continue;

    const result = await filter.run(workingCtx);
    results.push({ filter: filter.name, result });

    if (typeof result.modifiedBody === 'string') {
      workingCtx = applyModifiedBody(workingCtx, phase, result.modifiedBody);
    }

    if (!result.pass) {
      return { pass: false, ctx: workingCtx, results };
    }
  }

  return { pass: true, ctx: workingCtx, results };
}

function applyModifiedBody(
  ctx: FilterContext,
  phase: FilterPhase,
  body: string,
): FilterContext {
  if (phase === 'before_draft') {
    return { ...ctx, incomingMessage: body };
  }
  // after_draft and before_send both operate on draftBody
  return { ...ctx, draftBody: body };
}

/**
 * Convenience helper: collect every receiptAddition emitted across a
 * pipeline run into a single object that downstream Mana Receipt
 * assembly can merge into the filters block. Last-write-wins on key
 * collision; pass deterministic keys per filter.
 */
export function collectReceiptAdditions(
  results: PipelineRunResult['results'],
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const { result } of results) {
    if (result.receiptAddition) {
      Object.assign(merged, result.receiptAddition);
    }
  }
  return merged;
}
