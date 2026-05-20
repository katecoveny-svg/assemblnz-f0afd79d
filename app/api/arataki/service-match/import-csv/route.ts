import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  parseSalesConversationsCsv,
  parseServiceAppointmentsCsv,
  resolveAratakiTenantForUser,
} from '@/lib/arataki/service-match';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JsonSchema = z.object({
  tenantId: z.string().uuid().optional(),
  fileType: z.enum(['service_appointments', 'sales_history']),
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
  let fileType: 'service_appointments' | 'sales_history';
  let csv = '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    tenantId = String(form.get('tenantId') ?? '') || undefined;
    fileType = String(form.get('fileType') ?? '') === 'sales_history' ? 'sales_history' : 'service_appointments';
    const file = form.get('file');
    if (file instanceof File) csv = await file.text();
  } else {
    const parsed = JsonSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    tenantId = parsed.data.tenantId;
    fileType = parsed.data.fileType;
    csv = parsed.data.csv;
  }

  if (!csv.trim()) return NextResponse.json({ error: 'CSV content is required.' }, { status: 400 });

  const service = getServiceClient();
  const tenant = await resolveAratakiTenantForUser(service, user.id, tenantId);
  if (!tenant) return NextResponse.json({ error: 'Tenant access required.' }, { status: 403 });

  let inserted = 0;
  let insertError: { message: string } | null = null;

  if (fileType === 'service_appointments') {
    const rows = parseServiceAppointmentsCsv(csv).map((row) => ({ ...row, tenant_id: tenant.id }));
    if (rows.length === 0) return NextResponse.json({ error: 'No valid rows found in CSV.' }, { status: 400 });
    inserted = rows.length;
    const { error } = await service.from('arataki_service_appointments').insert(rows);
    insertError = error;
  } else {
    const rows = parseSalesConversationsCsv(csv).map((row) => ({ ...row, tenant_id: tenant.id }));
    if (rows.length === 0) return NextResponse.json({ error: 'No valid rows found in CSV.' }, { status: 400 });
    inserted = rows.length;
    const { error } = await service.from('arataki_sales_conversations').insert(rows);
    insertError = error;
  }

  const error = insertError;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_log').insert({
    user_id: user.id,
    tenant_id: tenant.id,
    agent_code: 'service-to-sales-matcher',
    agent_name: 'Service-to-Sales Matcher',
    pack_id: 'arataki',
    model_used: 'deterministic-csv-import',
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    cost_nzd: 0,
    compliance_passed: true,
    data_classification: 'CONFIDENTIAL',
    pii_detected: true,
    pii_masked: false,
    policies_checked: ['Privacy Act 2020', 'Fair Trading Act 1986', 'Draft-only human review'],
    request_summary: `Imported ${inserted} ${fileType.replace('_', ' ')} row${inserted === 1 ? '' : 's'} for ${tenant.name}.`,
    response_summary: 'Rows stored for service-to-sales scoring. No external action taken.',
  });

  return NextResponse.json({ inserted, tenantId: tenant.id, fileType });
}
