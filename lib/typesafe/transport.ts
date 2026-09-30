/** HTTP transport. Called only by the server pilot; credentials are explicit, never read by client code. */
import { makePayload, parseEvaluation, PilotError, type PilotInput, type Evaluation } from './core';
export const TYPESAFE_ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
export type TransportConfig = { apiKey: string; model: string; timeoutMs?: number; signal?: AbortSignal };
export async function evaluateTypeSafe(
  input: PilotInput,
  config: TransportConfig,
  fetcher: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<{ evaluation: Evaluation; elapsedMs: number; attempts: number }> {
  return evaluateTypeSafePayload(makePayload(input, config.model), raw => parseEvaluation(raw, Boolean(input.claim)), config, fetcher, sleep);
}

/** Same documented vendor protocol, reusable with a product-specific typed choice rubric. */
export async function evaluateTypeSafePayload<T>(
  payload: { model: string; state: unknown; questions: Record<string, { type: 'choice'; instructions: string; criteria: Record<string, string> }> },
  parse: (raw: unknown) => T,
  config: TransportConfig,
  fetcher: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<{ evaluation: T; elapsedMs: number; attempts: number }> {
  if (!config.apiKey.trim() || !config.model.trim()) throw new PilotError('not_configured', 503, 'TypeSafe is not configured.');
  const started = performance.now();
  const timeout = Math.min(8_000, Math.max(100, config.timeoutMs ?? 7_000));
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (config.signal?.aborted) throw new PilotError('request_cancelled', 499, 'The request was cancelled.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    let retry = false;
    let retryMs = 300;
    try {
      const response = await fetcher(TYPESAFE_ENDPOINT, {
        method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), cache: 'no-store',
        redirect: 'error', signal: config.signal ? AbortSignal.any([config.signal, controller.signal]) : controller.signal,
      });
      if ((response.status === 429 || response.status === 529) && attempt === 1) {
        retry = true;
        const retryAfter = Number(response.headers.get('retry-after'));
        if (Number.isFinite(retryAfter) && retryAfter > 0) retryMs = Math.min(1_500, retryAfter * 1_000);
        await response.body?.cancel();
      } else {
        if (!response.ok) {
          await response.body?.cancel();
          const authError = response.status === 401 || response.status === 403;
          throw new PilotError(authError ? 'provider_auth_failed' : 'provider_unavailable', 502,
            authError ? 'TypeSafe rejected the server credential. Check the hosting secret.' : 'TypeSafe is unavailable. No action was taken; retry later.');
        }
        // Bound untrusted provider output too, even when Content-Length is absent.
        const reader = response.body?.getReader();
        if (!reader) throw new PilotError('provider_protocol_error', 502, 'TypeSafe returned an empty response.');
        const chunks: Uint8Array[] = []; let bytes = 0;
        try {
          for (;;) {
            const { value, done } = await reader.read(); if (done) break;
            bytes += value.byteLength;
            if (bytes > 64_000) { await reader.cancel(); throw new PilotError('provider_protocol_error', 502, 'TypeSafe returned an oversized response.'); }
            chunks.push(value);
          }
        } finally { reader.releaseLock(); }
        const combined = new Uint8Array(bytes); let offset = 0;
        for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.byteLength; }
        let raw: unknown;
        try { raw = JSON.parse(new TextDecoder().decode(combined)); }
        catch { throw new PilotError('provider_protocol_error', 502, 'TypeSafe returned invalid JSON.'); }
        return { evaluation: parse(raw), elapsedMs: Math.round(performance.now() - started), attempts: attempt };
      }
    } catch (error) {
      if (config.signal?.aborted) throw new PilotError('request_cancelled', 499, 'The request was cancelled.');
      if (error instanceof PilotError) throw error;
      throw new PilotError(controller.signal.aborted ? 'provider_timeout' : 'provider_network_error', 502,
        controller.signal.aborted ? 'TypeSafe timed out. No action was taken.' : 'Could not reach TypeSafe. No action was taken.');
    } finally { clearTimeout(timer); }
    if (retry) await sleep(retryMs);
  }
  throw new PilotError('provider_unavailable', 502, 'TypeSafe is unavailable. No action was taken.');
}
