/**
 * Tōro filter pipeline — public surface.
 *
 * Consumers should import the named filters and the registry from
 * here, not from individual filter files, so a future re-arrangement
 * of the directory shape doesn't ripple through call sites.
 */
export type {
  Filter,
  FilterContext,
  FilterPhase,
  FilterResult,
  ConsentGrant,
  LoadedMemoryBlocks,
} from './types';
export {
  TORO_DEFAULT_PIPELINE,
  runPipeline,
  collectReceiptAdditions,
  type PipelineRunResult,
} from './registry';
export { tikangaBeforeDraft } from './tikanga-before-draft';
export { privacyBeforeDraft } from './privacy-before-draft';
export { consentBeforeDraft } from './consent-before-draft';
export { ageGateAfterDraft } from './age-gate-after-draft';
export { tikangaAfterDraft } from './tikanga-after-draft';
export { auditBeforeSend } from './audit-before-send';
