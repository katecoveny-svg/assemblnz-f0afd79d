/**
 * DO runtime posture — shared by runtime.ts and the Agents SDK spine.
 * Kept separate to avoid circular imports.
 */

export type DoRuntimeMode = 'assembl' | 'byo';

export type DoRuntimeProvider = 'assemblHosted' | 'byo';

export type DoRuntimeCapability = 'live' | 'demo';

export type DoRuntimeStatus = {
  mode: DoRuntimeMode;
  provider: DoRuntimeProvider;
  capability: DoRuntimeCapability;
  /** Chip label for UI honesty. */
  label: string;
  /** Plain-English note for README / telemetry. */
  note: string;
  /** Which spine is serving jobs right now. */
  spine?: 'openai-sdk' | 'orchestrator';
};
