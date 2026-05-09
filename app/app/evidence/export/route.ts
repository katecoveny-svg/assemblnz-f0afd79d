/**
 * Evidence pack export — downloadable ZIP of receipts + supporting files.
 *
 * Inputs (any one):
 *   ?ids=uuid1,uuid2,...         — explicit receipt ids
 *   ?from=ISO&to=ISO             — date range (created_at)
 *   ?case_id=...                 — case scope (TODO: requires Case table)
 *
 * Output:
 *   ZIP named assembl-evidence-pack-<YYYY-MM-DD>.zip containing
 *   - receipts/<id>.json         — canonical receipt
 *   - receipts/<id>.html         — single-page printable HTML (Day 8.5 stub)
 *   - audit/<id>.json            — slice of assembl_audit_log keyed by audit_log_id
 *   - sources/<n>-<safe-name>    — cited source PDFs (mocked from URLs in citations)
 *   - manifest.json              — index of contents + scope
 *
 * Server-only, gated by Supabase Auth session. The route is registered
 * under /app/* so the existing PROTECTED_PREFIXES middleware redirects
 * unauthenticated users to /login.
 */

import { NextResponse, type NextRequest } from 'next/server';
import JSZip from 'jszip';
import { createClient } from '@/lib/supabase/server';
import {
  getReceiptsByIds,
  getReceiptsInRange,
} from '@/lib/evidence/getReceipt';
import { renderReceiptHtml } from '@/lib/evidence/receipt-html';
import type { ManaReceipt } from '@/lib/evidence/types';

export const dynamic = 'force-dynamic';

const MAX_RECEIPTS = 200;
const MAX_SOURCE_BYTES = 5 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids');
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');
  const caseIdParam = url.searchParams.get('case_id');

  let receipts: ManaReceipt[] = [];
  let scopeNote = '';
  let usedMock = false;

  if (idsParam) {
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, MAX_RECEIPTS);
    const results = await getReceiptsByIds(ids);
    for (const r of results) {
      if (r.receipt) receipts.push(r.receipt);
      if (r.source === 'mock') usedMock = true;
    }
    scopeNote = `${ids.length} receipt id${ids.length === 1 ? '' : 's'}`;
  } else if (fromParam && toParam) {
    if (Number.isNaN(Date.parse(fromParam)) || Number.isNaN(Date.parse(toParam))) {
      return NextResponse.json(
        { error: 'invalid date in from/to — use ISO 8601' },
        { status: 400 },
      );
    }
    const result = await getReceiptsInRange(fromParam, toParam);
    receipts = result.receipts.slice(0, MAX_RECEIPTS);
    if (result.source === 'mock') usedMock = true;
    scopeNote = `range ${fromParam} → ${toParam}`;
  } else if (caseIdParam) {
    return NextResponse.json(
      {
        error:
          'case_id scope is not yet supported — Case table ships in Phase 2 (twin-run verifier). Use ids= or from=/to= for now.',
      },
      { status: 501 },
    );
  } else {
    return NextResponse.json(
      { error: 'specify ?ids=... OR ?from=...&to=... OR ?case_id=...' },
      { status: 400 },
    );
  }

  if (receipts.length === 0) {
    return NextResponse.json({ error: 'no receipts in scope' }, { status: 404 });
  }

  const zip = new JSZip();
  const auditIds: string[] = [];
  const citedUrls = new Map<string, string>();

  for (const receipt of receipts) {
    zip.file(`receipts/${receipt.id}.json`, JSON.stringify(receipt, null, 2));
    zip.file(`receipts/${receipt.id}.html`, renderReceiptHtml(receipt));
    if (receipt.audit_log_id) auditIds.push(receipt.audit_log_id);
    for (const c of receipt.citations ?? []) {
      const maybeUrl =
        ('url' in c && typeof c.url === 'string' && /^https?:\/\//.test(c.url))
          ? c.url
          : null;
      if (maybeUrl && !citedUrls.has(maybeUrl)) {
        citedUrls.set(maybeUrl, safeFilename(maybeUrl));
      }
    }
  }

  // Audit-log slice — best-effort. Skip silently if the table isn't there.
  if (auditIds.length > 0) {
    const { data: auditRows, error: auditError } = await supabase
      .from('assembl_audit_log')
      .select('*')
      .in('id', auditIds);

    if (!auditError && auditRows) {
      for (const row of auditRows as Array<{ id: string }>) {
        zip.file(`audit/${row.id}.json`, JSON.stringify(row, null, 2));
      }
    } else if (auditError && !isMissingTable(auditError)) {
      zip.file('audit/_error.txt', `audit_log query failed: ${auditError.message}`);
    } else if (auditError) {
      zip.file(
        'audit/_README.txt',
        'assembl_audit_log table not yet shipped (Day 7). Audit slice will populate once the migration applies.',
      );
    }
  }

  // Cited sources — fetched and bundled. Best-effort, capped per file.
  let sourceIndex = 0;
  for (const [sourceUrl, safeName] of citedUrls.entries()) {
    sourceIndex += 1;
    try {
      const res = await fetch(sourceUrl, {
        headers: { Accept: 'application/pdf, */*' },
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) {
        zip.file(
          `sources/${pad(sourceIndex)}-${safeName}.error.txt`,
          `Could not fetch ${sourceUrl}: ${res.status} ${res.statusText}`,
        );
        continue;
      }
      const cl = Number(res.headers.get('content-length') ?? '0');
      if (cl > MAX_SOURCE_BYTES) {
        zip.file(
          `sources/${pad(sourceIndex)}-${safeName}.skipped.txt`,
          `Skipped ${sourceUrl} — ${cl} bytes exceeds ${MAX_SOURCE_BYTES} byte cap`,
        );
        continue;
      }
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_SOURCE_BYTES) {
        zip.file(
          `sources/${pad(sourceIndex)}-${safeName}.skipped.txt`,
          `Skipped ${sourceUrl} — ${buf.byteLength} bytes exceeds cap`,
        );
        continue;
      }
      zip.file(`sources/${pad(sourceIndex)}-${safeName}`, buf);
    } catch (err) {
      zip.file(
        `sources/${pad(sourceIndex)}-${safeName}.error.txt`,
        `Fetch failed for ${sourceUrl}: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    }
  }

  const manifest = {
    pack_format_version: 'v1',
    generated_at: new Date().toISOString(),
    generated_by: user.email ?? user.id,
    scope: scopeNote,
    receipt_count: receipts.length,
    audit_row_ids: auditIds,
    cited_source_urls: Array.from(citedUrls.keys()),
    scaffold_mode: usedMock,
    notes: usedMock
      ? 'mana_receipts table not deployed yet — receipts in this pack are scaffold-mode samples.'
      : undefined,
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: 'uint8array' });
  const today = new Date().toISOString().slice(0, 10);
  const filename = `assembl-evidence-pack-${today}.zip`;

  return new NextResponse(new Uint8Array(blob), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function safeFilename(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop() ?? 'source';
    const cleaned = last.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    return cleaned.length > 0 ? cleaned : 'source';
  } catch {
    return 'source';
  }
}

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

function isMissingTable(error: { code?: string; message?: string }): boolean {
  if (error.code === '42P01' || error.code === '42703') return true;
  const m = (error.message ?? '').toLowerCase();
  return (
    m.includes('does not exist') ||
    m.includes('relation "public.assembl_audit_log"') ||
    m.includes('could not find the table')
  );
}
