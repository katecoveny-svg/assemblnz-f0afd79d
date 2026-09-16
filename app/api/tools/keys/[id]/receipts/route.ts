import { getToolStore } from '@/lib/tools/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/tools/keys/[id]/receipts
 * Simple HTML ledger by default; `?format=json` for machine consumers.
 * Key id is the public `atk_…` id — never the secret.
 */
export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id || !/^atk_[a-zA-Z0-9_]+$/.test(id)) {
    return Response.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid key id.',
          fix: 'Use the public key id from a successful call meta.keyId (starts with atk_).',
        },
      },
      { status: 400 },
    );
  }

  const store = getToolStore();
  const key = await store.getKeyById(id);
  if (!key) {
    return Response.json(
      {
        error: {
          code: 'not_found',
          message: 'No key found for this id in the current store.',
          fix: 'Call the tool once with your key (memory store is process-local), or seed the key into Supabase assembl_tool_keys.',
        },
      },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? 50) || 50));
  const receipts = await store.listReceipts(id, limit);
  const format = url.searchParams.get('format');

  if (format === 'json') {
    return Response.json(
      {
        key: {
          id: key.id,
          keyPrefix: key.keyPrefix,
          label: key.label,
          environment: key.environment,
          dailyCapCents: key.dailyCapCents,
          unitCostCents: key.unitCostCents,
        },
        receipts,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const rows = receipts
    .map(
      (r) => `<tr>
  <td><code>${escapeHtml(r.id)}</code></td>
  <td>${escapeHtml(r.createdAt)}</td>
  <td>${escapeHtml(r.toolSlug)}</td>
  <td>${escapeHtml(r.environment)}</td>
  <td>${escapeHtml(r.status)}</td>
  <td>${r.unitCostCents}</td>
  <td><pre>${escapeHtml(JSON.stringify(r.requestSummary))}</pre></td>
  <td><pre>${escapeHtml(JSON.stringify(r.responseSummary))}</pre></td>
</tr>`,
    )
    .join('\n');

  const html = `<!doctype html>
<html lang="en-NZ">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>assembl tool receipts · ${escapeHtml(key.id)}</title>
  <style>
    :root { color-scheme: light; --plum:#240B21; --muted:#654A4E; --paper:#FFFDFB; --chalk:#F5F1F2; }
    body { margin:0; font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif; background:var(--paper); color:var(--plum); }
    main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .meta { color: var(--muted); font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.8rem; }
    a { color: var(--muted); }
    table { width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.85rem; }
    th, td { border-bottom: 1px solid rgba(36,11,33,0.12); text-align:left; vertical-align:top; padding: 0.55rem 0.4rem; }
    th { font-family: "IBM Plex Mono", ui-monospace, monospace; font-weight: 500; color: var(--muted); background: var(--chalk); }
    pre { margin:0; white-space: pre-wrap; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.72rem; }
    code { font-family: "IBM Plex Mono", ui-monospace, monospace; }
  </style>
</head>
<body>
  <main>
    <p class="meta">assembl · agent tool receipts</p>
    <h1>Receipts for ${escapeHtml(key.id)}</h1>
    <p class="meta">
      prefix ${escapeHtml(key.keyPrefix)} · ${escapeHtml(key.environment)} ·
      unit ${key.unitCostCents}¢ · daily cap ${key.dailyCapCents}¢ ·
      <a href="?format=json">JSON</a>
    </p>
    <table>
      <thead>
        <tr>
          <th>receipt</th><th>when</th><th>tool</th><th>env</th><th>status</th><th>¢</th><th>request</th><th>response</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="8">No receipts yet. Successful POSTs write one row each.</td></tr>'}
      </tbody>
    </table>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
