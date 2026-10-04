/** Terminal metadata only. Never expose raw response bodies or headers. */
export type GenerationCompletion = {
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';
  rawFinishReason: string | null;
  providerStatus: string | null;
  incompleteReason: string | null;
};
const reasons = new Set(['stop', 'length', 'end_turn', 'stop_sequence', 'max_tokens', 'max_output_tokens', 'model_context_window_exceeded', 'content_filter', 'refusal', 'tool_calls', 'function_call', 'tool_use', 'pause_turn', 'local_output_limit']);
const statuses = new Set(['completed', 'incomplete', 'failed', 'cancelled', 'in_progress', 'queued']);
const finishes = new Set(['stop', 'length', 'content-filter', 'tool-calls', 'error', 'other', 'unknown']);
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function known(value: unknown, allowed: Set<string>): string | null {
  if (value === undefined || value === null) return null;
  return typeof value === 'string' && allowed.has(value) ? value : "unknown";
}
export function generationCompletion(result: { finishReason?: unknown; rawFinishReason?: unknown; response?: { body?: unknown } }): GenerationCompletion {
  const body = record(result.response?.body);
  return {
    finishReason: known(result.finishReason, finishes) as GenerationCompletion['finishReason'] || 'unknown',
    rawFinishReason: known(result.rawFinishReason, reasons),
    providerStatus: known(body.status, statuses),
    incompleteReason: known(record(body.incomplete_details).reason, reasons),
  };
}
export type TranscriptionCompletion = GenerationCompletion & { status: 'provider-ended' | 'incomplete' | 'unverified' };
export function transcriptionCompletion(value?: GenerationCompletion): TranscriptionCompletion {
  const metadata = value ?? { finishReason: 'unknown', rawFinishReason: null, providerStatus: null, incompleteReason: null };
  const limited = ['max_tokens', 'max_output_tokens', 'model_context_window_exceeded', 'length', 'content_filter', 'refusal'];
  const incomplete = metadata.finishReason === 'length' || metadata.finishReason === 'content-filter' || metadata.finishReason === 'error' || metadata.finishReason === 'tool-calls' || limited.includes(metadata.rawFinishReason ?? '') || metadata.incompleteReason !== null || ['incomplete', 'failed', 'cancelled', 'in_progress', 'queued'].includes(metadata.providerStatus ?? '');
  // A provider's normal ending is never verification of handwritten content.
  const ended = metadata.finishReason === 'stop' && metadata.rawFinishReason !== 'unknown' && metadata.providerStatus !== 'unknown' && (metadata.providerStatus === 'completed' || ['stop', 'end_turn', 'stop_sequence'].includes(metadata.rawFinishReason ?? ''));
  return { ...metadata, status: incomplete ? 'incomplete' : ended ? 'provider-ended' : 'unverified' };
}
