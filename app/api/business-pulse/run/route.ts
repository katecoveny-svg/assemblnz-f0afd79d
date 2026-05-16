import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { runBusinessPulse } from '@/lib/business-pulse/run';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  tenantId: z.string().uuid().optional(),
  tenantSlug: z.string().min(1).optional(),
  asOf: z.string().datetime().optional(),
});

async function userCanRun(userId: string, tenantId: string): Promise<boolean> {
  const service = getServiceClient();
  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .in('role', ['operator', 'admin', 'manager'])
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
  ]);
  return Boolean(member || admin);
}

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const service = getServiceClient();
  let tenantId = parsed.data.tenantId ?? null;
  if (!tenantId && parsed.data.tenantSlug) {
    const { data: tenant, error } = await service
      .from('tenants')
      .select('id')
      .eq('slug', parsed.data.tenantSlug)
      .maybeSingle();
    if (error || !tenant) {
      return NextResponse.json({ error: error?.message ?? 'Tenant not found' }, { status: 404 });
    }
    tenantId = (tenant as { id: string }).id;
  }
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId or tenantSlug is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const serviceToken = process.env.BUSINESS_PULSE_RUN_TOKEN || process.env.CRON_SECRET;
  const serviceAllowed = Boolean(serviceToken && bearer === serviceToken);

  if (!serviceAllowed) {
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const allowed = await userCanRun(user.id, tenantId);
    if (!allowed) return NextResponse.json({ error: 'Tenant access required' }, { status: 403 });
  }

  const brief = await runBusinessPulse({
    supabase: service,
    tenantId,
    actorUserId: user?.id ?? null,
    asOf: parsed.data.asOf ? new Date(parsed.data.asOf) : undefined,
    manual: true,
  });

  return NextResponse.json({
    id: brief.id,
    tenantId,
    briefDate: brief.briefDate,
    drivePath: brief.drivePath,
    threeThings: brief.threeThings,
    checks: brief.checks,
    sourceStatus: brief.sourceStatus,
  });
}
