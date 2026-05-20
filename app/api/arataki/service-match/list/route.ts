import { NextResponse } from 'next/server';
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId');
  const days = Math.min(30, Math.max(1, Number(url.searchParams.get('days') ?? 14)));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const service = getServiceClient();
  const tenant = await resolveAratakiTenantForUser(service, user.id, tenantId);
  if (!tenant) return NextResponse.json({ error: 'Tenant access required.' }, { status: 403 });

  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const [{ data: appointments, error: appointmentError }, { data: conversations, error: conversationError }] =
    await Promise.all([
      service
        .from('arataki_service_appointments')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('appointment_at', now.toISOString())
        .lte('appointment_at', until.toISOString())
        .order('appointment_at', { ascending: true }),
      service
        .from('arataki_sales_conversations')
        .select('*')
        .eq('tenant_id', tenant.id),
    ]);

  if (appointmentError) return NextResponse.json({ error: appointmentError.message }, { status: 500 });
  if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 500 });

  const salesRows = (conversations ?? []) as SalesConversationRow[];
  const matches = ((appointments ?? []) as ServiceAppointmentRow[])
    .map((appointment) => buildServiceSalesMatch(appointment, findSalesConversation(appointment, salesRows), now))
    .sort((a, b) => b.score - a.score || new Date(a.appointment.appointment_at).getTime() - new Date(b.appointment.appointment_at).getTime());
  const visibleMatches = matches.filter((match) => match.tier !== 'routine');

  return NextResponse.json({ tenant, summary: summariseMatches(matches), matches: visibleMatches });
}
