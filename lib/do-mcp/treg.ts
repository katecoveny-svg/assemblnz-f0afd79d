import 'server-only';

import { tregConfigured } from './providers';

const BASE = 'https://treg.to';

/**
 * Public catalog search — no token required.
 * Live /call/{endpoint} requires TREG_TOKEN and is metered.
 */
export async function tregCatalogSearch(query: string, limit = 8): Promise<
  | { ok: true; results: unknown }
  | { ok: false; error: string }
> {
  const q = query.trim().slice(0, 120);
  if (!q) return { ok: false, error: 'query required' };
  try {
    const res = await fetch(
      `${BASE}/catalog/search?q=${encodeURIComponent(q)}&limit=${Math.min(Math.max(limit, 1), 20)}`,
      { signal: AbortSignal.timeout(15_000), cache: 'no-store' },
    );
    if (!res.ok) {
      return { ok: false, error: `Treg catalog search failed: HTTP ${res.status}` };
    }
    return { ok: true, results: await res.json() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Treg catalog search failed' };
  }
}

/**
 * Pay-per-call proxy. Env-gated — never invents a successful spend.
 */
export async function tregCallEndpoint(input: {
  endpointId: string;
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
}): Promise<{ ok: true; detail: Record<string, unknown> } | { ok: false; error: string }> {
  if (!tregConfigured()) {
    return {
      ok: false,
      error: 'TREG_TOKEN is not configured. Catalog search works without it; live calls need a Bearer token + prepaid balance.',
    };
  }
  const endpointId = input.endpointId.trim();
  if (!/^[a-z0-9][a-z0-9._-]{1,120}$/i.test(endpointId)) {
    return { ok: false, error: 'Invalid Treg endpoint id' };
  }
  const method = input.method ?? 'GET';
  try {
    const res = await fetch(`${BASE}/call/${encodeURIComponent(endpointId)}`, {
      method,
      headers: {
        Authorization: `Bearer ${process.env.TREG_TOKEN!.trim()}`,
        Accept: 'application/json',
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      body: method === 'POST' ? JSON.stringify(input.body ?? {}) : undefined,
      signal: AbortSignal.timeout(45_000),
    });
    const text = await res.text().catch(() => '');
    let parsed: Record<string, unknown> = {};
    try {
      parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      parsed = { raw: text.slice(0, 400) };
    }
    if (!res.ok) {
      return { ok: false, error: `Treg call failed: HTTP ${res.status}${text ? ` — ${text.slice(0, 160)}` : ''}` };
    }
    return { ok: true, detail: { endpoint: endpointId, response: parsed } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Treg call failed' };
  }
}
