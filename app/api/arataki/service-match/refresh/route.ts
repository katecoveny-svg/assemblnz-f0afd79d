import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  buildServiceSalesMatch,
  findSalesConversation,
  resolveAratakiTenantForUser,
  summariseMatches,
  type SalesConversationRow,
  type ServiceAppointmentRow,
} from '@/lib/arataki/service-match';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  tenantId: z.string().uuid().optional(),
  days: z.number().int().min(1).max(30).optional(),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const service = getServiceClient();
  const tenant = await resolveAratakiTenantForUser(service, user.id, parsed.data.tenantId);
  if (!tenant) return NextResponse.json({ error: 'Tenant access required.' }, { status: 403 });

  const now = new Date();
  const until = new Date(now.getTime() + (parsed.data.days ?? 14) * 24 * 60 * 60 * 1000);
  const [{ data: appointments }, { data: conversations }] = await Promise.all([
    service
      .from('arataki_service_appointments')
      .select('*')
      .eq('tenant_id', tenant.id)
      .gte('appointment_at', now.toISOString())
      .lte('appointment_at', until.toISOString()),
    service.from('arataki_sales_conversations').select('*').eq('tenant_id', tenant.id),
  ]);

  const salesRows = (conversations ?? []) as SalesConversationRow[];
  const matches = ((appointments ?? []) as ServiceAppointmentRow[])
    .map((appointment) => buildServiceSalesMatch(appointment, findSalesConversation(appointment, salesRows), now));
  const visibleMatches = matches.filter((match) => match.tier !== 'routine');

  await service.from('audit_log').insert({
    user_id: user.id,
    tenant_id: tenant.id,
    agent_code: 'service-to-sales-matcher',
    agent_name: 'Service-to-Sales Matcher',
    pack_id: 'arataki',
    model_used: 'deterministic-score-refresh',
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    cost_nzd: 0,
    compliance_passed: true,
    data_classification: 'CONFIDENTIAL',
    pii_detected: visibleMatches.length > 0,
    pii_masked: false,
    policies_checked: ['Privacy Act 2020', 'Fair Trading Act 1986', 'Draft-only human review'],
    request_summary: `Refreshed service-to-sales matches for ${tenant.name}.`,
    response_summary: `${visibleMatches.length} non-routine match${visibleMatches.length === 1 ? '' : 'es'} surfaced for operator review.`,
  });

  return NextResponse.json({ tenant, summary: summariseMatches(matches), matches: visibleMatches });
}
