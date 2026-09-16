import 'server-only';

import { composioConfigured } from './providers';

const API = 'https://backend.composio.dev/api/v3.1';

export type ComposioToolSummary = {
  slug: string;
  name: string;
  description?: string;
  toolkit?: string;
};

function apiKey(): string | null {
  return process.env.COMPOSIO_API_KEY?.trim() || null;
}

/**
 * List tools from Composio REST (v3.1). Env-gated — returns [] when not configured.
 * Optional toolkitSlug e.g. "gmail" or "hackernews".
 */
export async function composioListTools(options: {
  toolkitSlug?: string;
  query?: string;
  limit?: number;
} = {}): Promise<{ ok: true; tools: ComposioToolSummary[] } | { ok: false; error: string }> {
  if (!composioConfigured()) {
    return { ok: false, error: 'COMPOSIO_API_KEY is not configured' };
  }
  const key = apiKey()!;
  const params = new URLSearchParams();
  if (options.toolkitSlug) params.set('toolkit_slug', options.toolkitSlug);
  if (options.query) params.set('query', options.query);
  params.set('limit', String(Math.min(Math.max(options.limit ?? 20, 1), 50)));

  try {
    const res = await fetch(`${API}/tools?${params}`, {
      headers: { 'x-api-key': key, Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `Composio list failed: HTTP ${res.status}${text ? ` — ${text.slice(0, 160)}` : ''}` };
    }
    const body = (await res.json()) as {
      items?: Array<{ slug?: string; name?: string; description?: string; toolkit?: { slug?: string } | string }>;
      data?: Array<{ slug?: string; name?: string; description?: string; toolkit_slug?: string }>;
    };
    const rows = body.items ?? body.data ?? [];
    const tools: ComposioToolSummary[] = [];
    for (const row of rows) {
      const slug = row.slug?.trim();
      if (!slug) continue;
      const toolkit =
        typeof (row as { toolkit?: unknown }).toolkit === 'string'
          ? (row as { toolkit: string }).toolkit
          : (row as { toolkit?: { slug?: string } }).toolkit?.slug
            ?? (row as { toolkit_slug?: string }).toolkit_slug;
      tools.push({
        slug,
        name: row.name?.trim() || slug,
        description: row.description,
        toolkit,
      });
    }
    return { ok: true, tools };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Composio list failed' };
  }
}

/**
 * Execute a Composio tool for a DO owner external id (`do:user:<uuid>`).
 * Does not invent connected accounts — upstream errors surface honestly.
 */
export async function composioExecuteTool(input: {
  toolSlug: string;
  userId: string;
  arguments?: Record<string, unknown>;
}): Promise<{ ok: true; detail: Record<string, unknown> } | { ok: false; error: string }> {
  if (!composioConfigured()) {
    return { ok: false, error: 'COMPOSIO_API_KEY is not configured' };
  }
  const toolSlug = input.toolSlug.trim();
  if (!/^[A-Z0-9_]{3,120}$/i.test(toolSlug)) {
    return { ok: false, error: 'Invalid Composio tool slug' };
  }
  if (!input.userId.trim()) {
    return { ok: false, error: 'user_id required for Composio execute' };
  }

  try {
    const res = await fetch(`${API}/tools/execute/${encodeURIComponent(toolSlug)}`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey()!,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user_id: input.userId,
        arguments: input.arguments ?? {},
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const text = await res.text().catch(() => '');
    let parsed: Record<string, unknown> = {};
    try {
      parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      parsed = { raw: text.slice(0, 400) };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: `Composio execute failed: HTTP ${res.status}${typeof parsed.error === 'string' ? ` — ${parsed.error}` : text ? ` — ${text.slice(0, 160)}` : ''}`,
      };
    }
    return { ok: true, detail: { tool: toolSlug, response: parsed } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Composio execute failed' };
  }
}
