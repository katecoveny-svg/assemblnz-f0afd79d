/**
 * Read/write helpers for `tenants.evidence_settings` JSONB column.
 *
 * Schema-first: both the tenants table (PR #79) and the evidence_settings
 * column (this PR's migration) may be missing in production at the time the
 * UI ships. Both reads and writes degrade gracefully when that's the case.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import {
  DEFAULT_EVIDENCE_SETTINGS,
  type EvidenceSettings,
} from './types';

export interface LoadedSettings {
  settings: EvidenceSettings;
  source: 'tenants' | 'defaults';
  tenantId?: string;
  error?: string;
}

/**
 * Pick the first tenant the current user belongs to (single-tenant pilot
 * convention from the toro-chatwoot wiring PR). Once tenant switcher lands
 * this becomes a parameter.
 */
async function resolvePilotTenantId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { tenant_id: string }).tenant_id;
}

export async function loadEvidenceSettings(): Promise<LoadedSettings> {
  const tenantId = await resolvePilotTenantId();
  if (!tenantId) {
    return { settings: DEFAULT_EVIDENCE_SETTINGS, source: 'defaults' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('id, evidence_settings')
    .eq('id', tenantId)
    .maybeSingle();

  if (error) {
    return {
      settings: DEFAULT_EVIDENCE_SETTINGS,
      source: 'defaults',
      tenantId,
      error: error.message,
    };
  }

  const stored = (data as { evidence_settings?: Partial<EvidenceSettings> } | null)
    ?.evidence_settings;
  if (!stored || Object.keys(stored).length === 0) {
    return { settings: DEFAULT_EVIDENCE_SETTINGS, source: 'defaults', tenantId };
  }

  return {
    settings: mergeWithDefaults(stored),
    source: 'tenants',
    tenantId,
  };
}

export async function saveEvidenceSettings(
  next: EvidenceSettings,
): Promise<{ ok: boolean; reason?: string }> {
  const tenantId = await resolvePilotTenantId();
  if (!tenantId) {
    return {
      ok: false,
      reason:
        'no tenant available — confirm you are signed in and the tenants table has applied (PR #79)',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('tenants')
    .update({ evidence_settings: next })
    .eq('id', tenantId);

  if (error) {
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}

function mergeWithDefaults(
  stored: Partial<EvidenceSettings>,
): EvidenceSettings {
  const retention = {
    ...DEFAULT_EVIDENCE_SETTINGS.retention,
    ...(stored.retention ?? {}),
  };
  return {
    retention,
    public_verifier:
      stored.public_verifier ?? DEFAULT_EVIDENCE_SETTINGS.public_verifier,
    cite_when_uncertain:
      stored.cite_when_uncertain ??
      DEFAULT_EVIDENCE_SETTINGS.cite_when_uncertain,
  };
}

export function clampRetention(months: number, settings: EvidenceSettings): number {
  const min = settings.retention.min_months;
  const max = settings.retention.max_months;
  if (Number.isNaN(months)) return DEFAULT_EVIDENCE_SETTINGS.retention.receipts_months;
  return Math.max(min, Math.min(max, Math.round(months)));
}
