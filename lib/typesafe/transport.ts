/** HTTP transport. Called only by the server pilot; credentials are explicit, never read by client code. */
import { makePayload, parseEvaluation, PilotError, type PilotInput, type Evaluation } from './core';
export const TYPESAFE_ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
export type TransportConfig = { apiKey: string; model: string; timeoutMs?: number };
export async function evaluateTypeSafe(
  input: PilotInput,
  config: TransportConfig,
  fetcher: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<{ evaluation: Evaluation; elapsedMs: number; attempts: number }> {
  if (!config.apiKey.trim() || !config.model.trim()) throw new PilotError('not_configured', 503, 'TypeSafe is not configured.');
  const started = performance.now();
  const timeout = Math.min(8_000, Math.max(100, config.timeoutMs ?? 7_000));
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    let retry = false;
    let retryMs = 300;
    try {
      const response = await fetcher(TYPESAFE_ENDPOINT, {
        method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(makePayload(input, config.model)), cache: 'no-store',
        redirect: 'error', signal: controller.signal,
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
        const raw: unknown = await response.json().catch(() => { throw new PilotError('provider_protocol_error', 502, 'TypeSafe returned invalid JSON.'); });
        return { evaluation: parseEvaluation(raw, Boolean(input.claim)), elapsedMs: Math.round(performance.now() - started), attempts: attempt };
      }
    } catch (error) {
      if (error instanceof PilotError) throw error;
      throw new PilotError(controller.signal.aborted ? 'provider_timeout' : 'provider_network_error', 502,
        controller.signal.aborted ? 'TypeSafe timed out. No action was taken.' : 'Could not reach TypeSafe. No action was taken.');
    } finally { clearTimeout(timer); }
    if (retry) await sleep(retryMs);
  }
  throw new PilotError('provider_unavailable', 502, 'TypeSafe is unavailable. No action was taken.');
}
