/**
 * Server-side receipt loader for the Evidence Ledger.
 *
 * Schema-first: the mana_receipts table is shipped by Kaihanga at Day 7.5.
 * Until then this helper falls back to the canonical example receipt so the
 * UI surface (drawer, /verify page, export pack) can be wired and reviewed
 * independently of the migration landing.
 *
 * The fallback path is signalled to callers via the `source` field on the
 * return value so the UI can render a "scaffold mode — no production data
 * yet" hint where appropriate.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { MOCK_RECEIPT } from './mock-receipt';
import type { ManaReceipt } from './types';

export type ReceiptSource = 'mana_receipts' | 'mock';

export interface GetReceiptResult {
  receipt: ManaReceipt | null;
  source: ReceiptSource;
  error?: string;
}

/**
 * Load a single receipt by id. When the underlying table doesn't exist yet
 * (PG error code 42P01 — undefined_table — or 42703 — undefined_column —
 * during early migration drift) we fall back to the mock receipt with the
 * requested id stamped in.
 */
export async function getReceipt(receiptId: string): Promise<GetReceiptResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mana_receipts')
    .select('*')
    .eq('id', receiptId)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) {
      return {
        receipt: { ...MOCK_RECEIPT, id: receiptId },
        source: 'mock',
      };
    }
    return { receipt: null, source: 'mana_receipts', error: error.message };
  }

  if (!data) {
    // Authentic empty result — not table-missing. Surface as null so the
    // drawer renders a "receipt not found" state.
    return { receipt: null, source: 'mana_receipts' };
  }

  return { receipt: data as ManaReceipt, source: 'mana_receipts' };
}

/**
 * Load every receipt cited by a list of ids — used by the export route.
 * Same fallback behaviour as getReceipt(): if the table isn't there we
 * synthesise a row per id.
 */
export async function getReceiptsByIds(
  receiptIds: string[],
): Promise<GetReceiptResult[]> {
  if (receiptIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mana_receipts')
    .select('*')
    .in('id', receiptIds);

  if (error) {
    if (isMissingTable(error)) {
      return receiptIds.map((id) => ({
        receipt: { ...MOCK_RECEIPT, id },
        source: 'mock' as const,
      }));
    }
    return receiptIds.map((id) => ({
      receipt: null,
      source: 'mana_receipts' as const,
      error: error.message,
    }));
  }

  const byId = new Map<string, ManaReceipt>();
  for (const row of (data ?? []) as ManaReceipt[]) {
    byId.set(row.id, row);
  }

  return receiptIds.map((id) => {
    const row = byId.get(id);
    if (row) return { receipt: row, source: 'mana_receipts' as const };
    return { receipt: null, source: 'mana_receipts' as const };
  });
}

/**
 * Load receipts in a date range — used by the export route's `from`/`to`
 * query path.
 */
export async function getReceiptsInRange(
  fromIso: string,
  toIso: string,
): Promise<{ receipts: ManaReceipt[]; source: ReceiptSource; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mana_receipts')
    .select('*')
    .gte('created_at', fromIso)
    .lte('created_at', toIso)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    if (isMissingTable(error)) {
      return { receipts: [MOCK_RECEIPT], source: 'mock' };
    }
    return { receipts: [], source: 'mana_receipts', error: error.message };
  }

  return { receipts: (data ?? []) as ManaReceipt[], source: 'mana_receipts' };
}

function isMissingTable(error: { code?: string; message?: string }): boolean {
  if (error.code === '42P01' || error.code === '42703') return true;
  const m = (error.message ?? '').toLowerCase();
  return (
    m.includes('does not exist') ||
    m.includes('relation "public.mana_receipts"') ||
    m.includes('could not find the table')
  );
}
