import { NextResponse } from 'next/server';
import { z } from 'zod';
import { effectiveReturnAt, formatNzDateTime, resolveTenantForUser, type LoanCarRow } from '@/lib/arataki/loan-cars';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  tenantId: z.string().uuid(),
  carId: z.string().uuid(),
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
  const tenant = await resolveTenantForUser(service, user.id, parsed.data.tenantId);
  if (!tenant) return NextResponse.json({ error: 'Tenant access required.' }, { status: 403 });

  const { data: car, error: carError } = await service
    .from('loan_cars')
    .select('id,user_id,tenant_id,make,model,rego,status,borrower_name,borrower_phone,return_date,expected_return_at,loan_started_at,linked_job_id,notes,created_at,updated_at')
    .eq('id', parsed.data.carId)
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  if (carError) return NextResponse.json({ error: carError.message }, { status: 500 });
  if (!car) return NextResponse.json({ error: 'Loan car not found.' }, { status: 404 });

  const row = car as LoanCarRow;
  const due = formatNzDateTime(effectiveReturnAt(row)) ?? 'not recorded';
  const { data: audit, error } = await service
    .from('audit_log')
    .insert({
      user_id: user.id,
      tenant_id: tenant.id,
      agent_code: 'loan-car-warden',
      agent_name: 'Loan Car Warden',
      pack_id: 'arataki',
      model_used: 'operator-action',
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cost_nzd: 0,
      compliance_passed: true,
      data_classification: 'CONFIDENTIAL',
      pii_detected: Boolean(row.borrower_name || row.borrower_phone),
      pii_masked: false,
      policies_checked: ['Privacy Act 2020', 'Draft-only human review'],
      request_summary: `Operator handoff requested for ${row.rego} at ${tenant.name}.`,
      response_summary: `Draft handoff recorded for ${row.make} ${row.model}; borrower ${row.borrower_name ?? 'not assigned'}; expected return ${due}. No external message sent.`,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, auditId: (audit as { id: string }).id });
}
