import 'server-only';

import { getServiceClient } from '@/lib/supabase/service';
import {
  calendarWeekAhead,
  nzPrivacyAct2020,
  pipelineMovement,
  pulseSynthesis,
  tikangaCompliance,
  xeroCashPosition,
  type BusinessPulseInputs,
} from './skills';
import { businessPulseDrivePath, renderBusinessPulseMarkdown } from './markdown';
import type { BusinessPulseBrief, BusinessPulseContext } from './types';

type TenantRow = {
  id: string;
  slug: string | null;
  name: string | null;
  metadata: Record<string, unknown> | null;
};

type BriefRow = {
  id: string;
  tenant_id: string;
  brief_date: string;
  drive_path: string | null;
  markdown: string | null;
  three_things: unknown;
  cash_position: unknown;
  pipeline_movement: unknown;
  weekly_commitments: unknown;
  pilot_health: unknown;
  tikanga_check_passed: boolean | null;
  privacy_check_passed: boolean | null;
  source_status: Record<string, string> | null;
  created_at: string | null;
};

function dateInNz(asOf: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(asOf);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function thresholdForTenant(tenant: TenantRow): number {
  const raw = tenant.metadata?.business_pulse_cash_threshold;
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 5000;
}

export async function runBusinessPulse(context: BusinessPulseContext): Promise<BusinessPulseBrief> {
  const supabase = context.supabase;
  const asOf = context.asOf ?? new Date();
  const briefDate = dateInNz(asOf);

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id,slug,name,metadata')
    .eq('id', context.tenantId)
    .maybeSingle();
  if (tenantError || !tenant) {
    throw new Error(`Business Pulse tenant lookup failed: ${tenantError?.message ?? 'not found'}`);
  }
  const currentTenant = tenant as TenantRow;
  const orgSlug = currentTenant.slug ?? currentTenant.id;
  const orgName = currentTenant.name ?? orgSlug;

  const [{ data: integrations }, { data: syncedData }, { data: pilotHealthRows }] = await Promise.all([
    supabase
      .from('assembl_integrations')
      .select('provider_code,status,metadata')
      .eq('organisation_id', currentTenant.id),
    supabase
      .from('assembl_synced_data')
      .select('provider_code,data_type,data,synced_at')
      .eq('organisation_id', currentTenant.id)
      .eq('is_stale', false)
      .limit(500),
    supabase
      .from('business_pulse_pilot_health')
      .select('name,last_active_at,errors_last_7d,billing_status')
      .eq('tenant_id', currentTenant.id)
      .limit(20),
  ]);

  const inputs: BusinessPulseInputs = {
    integrations: (integrations ?? []) as BusinessPulseInputs['integrations'],
    syncedData: (syncedData ?? []) as BusinessPulseInputs['syncedData'],
    pilotHealthRows: (pilotHealthRows ?? []) as Array<Record<string, unknown>>,
    threshold: thresholdForTenant(currentTenant),
  };

  const cash = await xeroCashPosition(inputs);
  const commitments = calendarWeekAhead(inputs);
  const pipeline = pipelineMovement(inputs);
  const threeThings = pulseSynthesis({ cash, commitments, pipeline });
  const pilotHealth = {
    status: inputs.pilotHealthRows.length > 0 ? ('available' as const) : ('not_configured' as const),
    customers: inputs.pilotHealthRows.map((row) => ({
      name: String(row.name ?? 'Unnamed pilot'),
      lastActiveAt: typeof row.last_active_at === 'string' ? row.last_active_at : null,
      errorsLast7Days: typeof row.errors_last_7d === 'number' ? row.errors_last_7d : 0,
      billingStatus: typeof row.billing_status === 'string' ? row.billing_status : null,
    })),
    notes:
      inputs.pilotHealthRows.length > 0
        ? ['Pilot health is sourced from the Business Pulse health view/table.']
        : ['No pilot health rows configured for this tenant.'],
  };

  const sourceStatus = {
    xero: cash.status,
    stripe: cash.stripeNetLast7Days > 0 || process.env.STRIPE_SECRET_KEY ? 'connected' : 'not_connected',
    calendar: commitments.status,
    gmail: inputs.integrations.some((row) => row.provider_code === 'gmail') ? 'connected' : 'not_connected',
    hubspot: pipeline?.status ?? 'not_connected',
    supabase: 'connected',
  } as const;

  const drivePath = businessPulseDrivePath(orgSlug, briefDate);
  const withoutMarkdown = {
    orgId: currentTenant.id,
    orgSlug,
    orgName,
    briefDate,
    drivePath,
    threeThings,
    cashPosition: cash,
    pipelineMovement: pipeline,
    weeklyCommitments: commitments,
    pilotHealth,
    checks: {
      privacy: { passed: true, notes: [] },
      tikanga: { passed: true, note: '' },
    },
    sourceStatus,
  } satisfies Omit<BusinessPulseBrief, 'markdown'>;

  const markdown = renderBusinessPulseMarkdown(withoutMarkdown);
  const checks = {
    privacy: nzPrivacyAct2020(markdown),
    tikanga: tikangaCompliance(markdown),
  };
  const brief: BusinessPulseBrief = {
    ...withoutMarkdown,
    checks,
    markdown: renderBusinessPulseMarkdown({ ...withoutMarkdown, checks }),
  };

  const { data: saved, error: saveError } = await supabase
    .from('business_pulse_briefs')
    .upsert(
      {
        tenant_id: brief.orgId,
        brief_date: brief.briefDate,
        drive_path: brief.drivePath,
        markdown: brief.markdown,
        three_things: brief.threeThings,
        cash_position: brief.cashPosition,
        pipeline_movement: brief.pipelineMovement,
        weekly_commitments: brief.weeklyCommitments,
        pilot_health: brief.pilotHealth,
        tikanga_check_passed: brief.checks.tikanga.passed,
        privacy_check_passed: brief.checks.privacy.passed,
        source_status: brief.sourceStatus,
      },
      { onConflict: 'tenant_id,brief_date' },
    )
    .select('id,created_at')
    .single();

  if (saveError) {
    throw new Error(`Business Pulse save failed: ${saveError.message}`);
  }

  brief.id = (saved as { id?: string } | null)?.id;
  brief.createdAt = (saved as { created_at?: string } | null)?.created_at;
  return brief;
}

export async function runBusinessPulseWithService(tenantId: string, asOf?: Date): Promise<BusinessPulseBrief> {
  return runBusinessPulse({ supabase: getServiceClient(), tenantId, asOf, manual: false });
}

export function toBusinessPulseBrief(row: BriefRow, tenant: { slug: string; name: string }): BusinessPulseBrief {
  return {
    id: row.id,
    orgId: row.tenant_id,
    orgSlug: tenant.slug,
    orgName: tenant.name,
    briefDate: row.brief_date,
    drivePath: row.drive_path ?? '',
    markdown: row.markdown ?? '',
    threeThings: Array.isArray(row.three_things) ? (row.three_things as BusinessPulseBrief['threeThings']) : [],
    cashPosition: (row.cash_position ?? {}) as BusinessPulseBrief['cashPosition'],
    pipelineMovement: (row.pipeline_movement ?? null) as BusinessPulseBrief['pipelineMovement'],
    weeklyCommitments: (row.weekly_commitments ?? {}) as BusinessPulseBrief['weeklyCommitments'],
    pilotHealth: (row.pilot_health ?? {}) as BusinessPulseBrief['pilotHealth'],
    checks: {
      tikanga: {
        passed: row.tikanga_check_passed !== false,
        note: row.tikanga_check_passed === false ? 'Review required.' : 'Passed.',
      },
      privacy: {
        passed: row.privacy_check_passed !== false,
        notes: row.privacy_check_passed === false ? ['Review required.'] : ['Passed.'],
      },
    },
    sourceStatus: (row.source_status ?? {}) as BusinessPulseBrief['sourceStatus'],
    createdAt: row.created_at ?? undefined,
  };
}
