/** Diagnostic output is an allowlisted code. Never log prompts, keys or provider bodies. */
export class PublicResearchProviderError extends Error {
  constructor(readonly status: number) { super('research_provider_unavailable'); this.name='PublicResearchProviderError'; }
}
const known = new Set(['research_provider_unavailable','research_protocol_error','research_search_limit','no_verified_search_result','untraced_source','copy_review_required','receipt_not_saved','storage_unavailable']);
export function publicFailureCode(error: unknown): string {
  if (error instanceof PublicResearchProviderError && Number.isInteger(error.status) && error.status>=400 && error.status<=599) return `provider_http_${error.status}`;
  if (error instanceof SyntaxError) return 'draft_json_invalid';
  if (error instanceof Error) {
    if(error.name==='ZodError')return 'draft_schema_invalid';
    if(error.name==='TimeoutError'||error.name==='AbortError')return 'research_timeout';
    if(known.has(error.message))return error.message;
  }
  return 'research_failed';
}
