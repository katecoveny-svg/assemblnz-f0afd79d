import { createClient } from '@/lib/supabase/server';
import { decodeLead, encodeLead, leadInput } from '@/lib/specialists/crm';
import { z } from 'zod';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers });
async function identity() {
  try {
    const db = await createClient(); const { data, error } = await db.auth.getUser();
    return !error && data.user && !data.user.is_anonymous ? { db, user: data.user } : null;
  } catch { return null; }
}
export async function GET() {
  const auth = await identity(); if (!auth) return reply({ error: 'Sign in to open your private CRM.' }, 401);
  const { data, error } = await auth.db.from('leads').select('id,name,company,email,phone,value,stage,source,notes,created_at,updated_at').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(500);
  if (error) return reply({ error: 'Your pipeline could not be loaded.' }, 503);
  return reply({ leads: (data ?? []).map(decodeLead), storage: 'private-account', limit: 500 });
}
async function mutate(req: Request, update: boolean) {
  if (req.headers.get('origin') !== new URL(req.url).origin) return reply({ error: 'Open Flux to change your pipeline.' }, 403);
  const auth = await identity(); if (!auth) return reply({ error: 'Sign in to save to your private CRM.' }, 401);
  const raw = await req.text(); if (raw.length > 20000) return reply({ error: 'Please shorten this record.' }, 413);
  let body: unknown; try { body = JSON.parse(raw); } catch { return reply({ error: 'Invalid record.' }, 400); }
  const schema = z.object({ id: update ? z.uuid() : z.uuid().optional(), lead: leadInput });
  const result = schema.safeParse(body); if (!result.success) return reply({ error: 'Check the name, email, value and date fields.' }, 400);
  const record = encodeLead(result.data.lead);
  const query = update
    ? auth.db.from('leads').update({ ...record, updated_at: new Date().toISOString() }).eq('id', result.data.id!).eq('user_id', auth.user.id)
    : auth.db.from('leads').insert({ ...record, user_id: auth.user.id });
  const { data, error } = await query.select('id,name,company,email,phone,value,stage,source,notes,created_at,updated_at').maybeSingle();
  if (error) return reply({ error: 'The record was not saved. Your draft is still here.' }, 503);
  if (!data) return reply({ error: 'That record is not available in your account.' }, 404);
  return reply({ lead: decodeLead(data), saved: true });
}
export const POST = (req: Request) => mutate(req, false);
export const PUT = (req: Request) => mutate(req, true);
