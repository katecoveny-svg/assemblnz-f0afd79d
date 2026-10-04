import { NzServiceError } from './auth';

export const NZBN_BASE = 'https://api.business.govt.nz/gateway/nzbn/v5';
export const NZBN_DOCS = 'https://portal.api.business.govt.nz/api/nzbn';
export const FRESH_FOR_MS = 24 * 60 * 60 * 1000; // pilot policy, not MBIE freshness guarantee
export function validNzbn(value: string) {
  if (!/^\d{13}$/.test(value)) return false;
  const sum = [...value.slice(0, 12)].reduce((n, digit, i) => n + Number(digit) * (i % 2 ? 3 : 1), 0);
  return (10 - sum % 10) % 10 === Number(value[12]);
}
export type BusinessInspection = {
  state: 'available' | 'unavailable' | 'ambiguous'; nzbn: string;
  identity?: { legalName: string; entityTypeCode: string; statusCode: string };
  citation: string; observedAt: string | null; freshUntil: string | null;
  freshness: 'fresh' | 'stale' | 'unknown';
};
const safeField = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 200 && !/[\u0000-\u001f\u007f]/.test(v);

/** No env/key resolution and no ambient fetch. Mock wire contract until separately released. */
export function createNzbnInspector(options?: {
  transport: typeof fetch; subscriptionKey: string; now?: () => number;
}) {
  return async (nzbn: string): Promise<BusinessInspection> => {
    if (!validNzbn(nzbn)) throw new NzServiceError('invalid_input');
    const empty: BusinessInspection = { state: 'unavailable', nzbn, citation: `${NZBN_BASE}/entities/${nzbn}`,
      observedAt: null, freshUntil: null, freshness: 'unknown' };
    if (!options?.subscriptionKey) return empty;
    const controller = new AbortController();
    let activeReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Deadline spans headers AND stream; Promise.race bounds even a broken injected transport.
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        void activeReader?.cancel().catch(() => {});
        reject(new Error('deadline'));
      }, 2000);
    });
    const work = async (): Promise<BusinessInspection> => {
      const response = await options.transport(empty.citation, { method: 'GET', redirect: 'error',
        credentials: 'omit', signal: controller.signal,
        headers: { Accept: 'application/json', 'Ocp-Apim-Subscription-Key': options.subscriptionKey } });
      if (response.status !== 200 || response.redirected || !response.headers.get('content-type')?.includes('application/json')) return empty;
      if (Number(response.headers.get('content-length')) > 128 * 1024) { await response.body?.cancel(); return empty; }
      const reader = response.body?.getReader();
      if (!reader) return empty;
      activeReader = reader;
      let size = 0;
      const chunks: Uint8Array[] = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 128 * 1024) { await reader.cancel(); return empty; }
          chunks.push(value);
        }
      } finally { reader.releaseLock(); activeReader = undefined; }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const raw: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...empty, state: 'ambiguous' };
      const entity = raw as Record<string, unknown>;
      if (entity.nzbn !== nzbn || !safeField(entity.entityName) || !safeField(entity.entityTypeCode)
        || !safeField(entity.entityStatusCode)) return { ...empty, state: 'ambiguous' };
      const now = options.now?.() ?? Date.now();
      return { ...empty, state: 'available', identity: { legalName: entity.entityName,
        entityTypeCode: entity.entityTypeCode, statusCode: entity.entityStatusCode },
        observedAt: new Date(now).toISOString(), freshUntil: new Date(now + FRESH_FOR_MS).toISOString(), freshness: 'fresh' };
    };
    try { return await Promise.race([work(), deadline]); }
    catch { return empty; }
    finally { clearTimeout(timer); controller.abort(); }
  };
}
export const inspectNzBusiness = createNzbnInspector();
