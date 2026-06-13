/**
 * POST /api/wishlist/claim — a business leaves their email to claim a spec.
 * Writes a row to public.wishlist_requests. Fail-closed; never blocks the tool.
 *
 * Body: { email, business, wish, spec?, consent? }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  email: z.string().email('A valid email is required').max(254),
  business: z.string().min(1).max(200),
  wish: z.string().min(1).max(600),
  spec: z.record(z.string(), z.unknown()).optional(),
  consent: z.boolean().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }
  const { email, business, wish, spec, consent } = parsed.data;

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch (error) {
    console.error('wishlist claim service client unavailable', error);
    return NextResponse.json({ error: 'Capture is unavailable right now' }, { status: 503 });
  }

  const { data, error } = await service
    .from('wishlist_requests')
    .insert({
      email: email.trim().toLowerCase(),
      business,
      wish,
      spec: spec ?? {},
      consent: consent ?? false,
      source: 'hapai-wishlist',
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('wishlist claim insert failed', error?.message);
    return NextResponse.json({ error: 'Capture failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
