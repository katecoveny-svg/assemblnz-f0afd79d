import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseLoanCarsCsv, resolveTenantForUser } from '@/lib/arataki/loan-cars';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JsonSchema = z.object({
  tenantId: z.string().uuid().optional(),
  csv: z.string().min(1),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const contentType = req.headers.get('content-type') ?? '';
  let tenantId: string | undefined;
  let csv = '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    tenantId = String(form.get('tenantId') ?? '') || undefined;
    const file = form.get('file');
    if (file instanceof File) csv = await file.text();
  } else {
    const parsed = JsonSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    tenantId = parsed.data.tenantId;
    csv = parsed.data.csv;
  }

  if (!csv.trim()) return NextResponse.json({ error: 'CSV content is required.' }, { status: 400 });

  const service = getServiceClient();
  const tenant = await resolveTenantForUser(service, user.id, tenantId);
  if (!tenant) return NextResponse.json({ error: 'Tenant access required.' }, { status: 403 });

  const parsedRows = parseLoanCarsCsv(csv);
  if (parsedRows.length === 0) {
    return NextResponse.json({ error: 'No valid loan car rows found. Include at least a rego column.' }, { status: 400 });
  }

  const rows = parsedRows.map(({ raw_payload: _rawPayload, ...row }) => ({
    ...row,
    tenant_id: tenant.id,
    user_id: user.id,
    return_date: row.expected_return_at ? row.expected_return_at.slice(0, 10) : null,
  }));

  const { error } = await service.from('loan_cars').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_log').insert({
    user_id: user.id,
    tenant_id: tenant.id,
    agent_code: 'loan-car-warden',
    agent_name: 'Loan Car Warden',
    pack_id: 'arataki',
    model_used: 'deterministic-csv-import',
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    cost_nzd: 0,
    compliance_passed: true,
    data_classification: 'CONFIDENTIAL',
    pii_detected: rows.some((row) => row.borrower_name || row.borrower_phone),
    pii_masked: false,
    policies_checked: ['Privacy Act 2020', 'Draft-only human review'],
    request_summary: `Imported ${rows.length} loan car CSV row${rows.length === 1 ? '' : 's'} for ${tenant.name}.`,
    response_summary: 'Rows stored for operator review. No external action taken.',
  });

  return NextResponse.json({ inserted: rows.length, tenantId: tenant.id });
}
