import { NextResponse } from 'next/server';
import { z } from 'zod';
import { normaliseLoanCarStatus, resolveTenantForUser } from '@/lib/arataki/loan-cars';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  tenantId: z.string().uuid(),
  carId: z.string().uuid(),
  status: z.enum(['available', 'on_loan', 'overdue', 'maintenance']),
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

  const status = normaliseLoanCarStatus(parsed.data.status);
  const patch: Record<string, string | null> = { status };
  if (status === 'available') {
    patch.borrower_name = null;
    patch.borrower_phone = null;
  }
  if (status === 'on_loan') {
    patch.loan_started_at = new Date().toISOString();
  }

  const { error } = await service
    .from('loan_cars')
    .update(patch)
    .eq('id', parsed.data.carId)
    .eq('tenant_id', tenant.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
