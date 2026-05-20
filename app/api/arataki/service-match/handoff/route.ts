import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  buildServiceSalesMatch,
  findSalesConversation,
  resolveAratakiTenantForUser,
  type SalesConversationRow,
  type ServiceAppointmentRow,
} from '@/lib/arataki/service-match';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  tenantId: z.string().uuid(),
  appointmentId: z.string().uuid(),
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

  const { data: appointment, error: appointmentError } = await service
    .from('arataki_service_appointments')
    .select('*')
    .eq('id', parsed.data.appointmentId)
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  if (appointmentError) return NextResponse.json({ error: appointmentError.message }, { status: 500 });
  if (!appointment) return NextResponse.json({ error: 'Service appointment not found.' }, { status: 404 });

  const row = appointment as ServiceAppointmentRow;
  const [{ data: conversations, error: conversationError }] = await Promise.all([
    service
      .from('arataki_sales_conversations')
      .select('*')
      .eq('tenant_id', tenant.id),
  ]);

  if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 500 });

  const salesRows = (conversations ?? []) as SalesConversationRow[];
  const match = buildServiceSalesMatch(row, findSalesConversation(row, salesRows));
  const { data: audit, error } = await service
    .from('audit_log')
    .insert({
      user_id: user.id,
      tenant_id: tenant.id,
      agent_code: 'service-to-sales-matcher',
      agent_name: 'Service-to-Sales Matcher',
      pack_id: 'arataki',
      model_used: 'operator-action',
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cost_nzd: 0,
      compliance_passed: true,
      data_classification: 'CONFIDENTIAL',
      pii_detected: true,
      pii_masked: false,
      policies_checked: ['Privacy Act 2020', 'Fair Trading Act 1986', 'Draft-only human review'],
      request_summary: `Operator handoff requested for ${row.customer_name} at ${tenant.name}.`,
      response_summary: `${match.handoffDraft} Score ${match.score}. No external message sent.`,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, auditId: (audit as { id: string }).id });
}
