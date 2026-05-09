'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { saveEvidenceSettings } from '@/lib/evidence/settings';
import {
  DEFAULT_EVIDENCE_SETTINGS,
  type EvidenceSettings,
} from '@/lib/evidence/types';

export interface SaveResult {
  ok: boolean;
  reason?: string;
  saved?: EvidenceSettings;
}

const VALID_VERIFIER = new Set<EvidenceSettings['public_verifier']>(['on', 'off']);
const VALID_CITE = new Set<EvidenceSettings['cite_when_uncertain']>([
  'always_cite',
  'flag_for_human',
]);

export async function saveEvidenceSettingsAction(
  formData: FormData,
): Promise<SaveResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not authenticated' };

  const receipts = clamp(
    Number(formData.get('receipts_months') ?? DEFAULT_EVIDENCE_SETTINGS.retention.receipts_months),
  );
  const audit = clamp(
    Number(formData.get('audit_log_months') ?? DEFAULT_EVIDENCE_SETTINGS.retention.audit_log_months),
  );
  const verifierRaw = String(formData.get('public_verifier') ?? 'off');
  const citeRaw = String(formData.get('cite_when_uncertain') ?? 'always_cite');

  const verifier: EvidenceSettings['public_verifier'] = VALID_VERIFIER.has(
    verifierRaw as EvidenceSettings['public_verifier'],
  )
    ? (verifierRaw as EvidenceSettings['public_verifier'])
    : 'off';
  const cite: EvidenceSettings['cite_when_uncertain'] = VALID_CITE.has(
    citeRaw as EvidenceSettings['cite_when_uncertain'],
  )
    ? (citeRaw as EvidenceSettings['cite_when_uncertain'])
    : 'always_cite';

  const next: EvidenceSettings = {
    retention: {
      ...DEFAULT_EVIDENCE_SETTINGS.retention,
      receipts_months: receipts,
      audit_log_months: audit,
    },
    public_verifier: verifier,
    cite_when_uncertain: cite,
  };

  const result = await saveEvidenceSettings(next);
  if (!result.ok) return { ok: false, reason: result.reason };

  revalidatePath('/app/admin/evidence/settings');
  return { ok: true, saved: next };
}

function clamp(months: number): number {
  if (Number.isNaN(months)) return DEFAULT_EVIDENCE_SETTINGS.retention.receipts_months;
  const min = DEFAULT_EVIDENCE_SETTINGS.retention.min_months;
  const max = DEFAULT_EVIDENCE_SETTINGS.retention.max_months;
  return Math.max(min, Math.min(max, Math.round(months)));
}
