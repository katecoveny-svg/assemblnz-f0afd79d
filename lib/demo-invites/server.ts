import 'server-only';

import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase/service';
import {
  INVITE_COOKIE,
  buildInviteSlug,
  getInviteSecret,
  inviteToken,
  sha256Hex,
  verifyInviteCookieValue,
} from './crypto';

/**
 * Server-side invite helpers.
 *
 * Reads/writes go through the service-role client — demo_invites has RLS
 * enabled with zero policies, so nothing else can see it. Callers are
 * responsible for their own gate: the ops pages only ever read the invite
 * bound to THIS browser's signed cookie, and the /admin actions sit behind
 * ensureAdmin().
 */

export type DemoInvite = {
  id: string;
  slug: string;
  demo: string;
  recipient_name: string;
  recipient_company: string;
  recipient_email: string | null;
  greeting_mode: 'name' | 'company';
  notes: string | null;
  created_at: string;
  last_opened_at: string | null;
  open_count: number;
  revoked_at: string | null;
};

export type InviteContext = {
  slug: string;
  demo: string;
  recipientName: string;
  recipientCompany: string;
  greetingMode: 'name' | 'company';
};

/**
 * The invite bound to the current browser session, or null.
 *
 * Verifies the signed cookie, then re-reads the row so a revoke lands
 * immediately (the middleware also enforces this before the page renders —
 * this is belt-and-braces plus the source of the greeting fields).
 */
export async function getInviteContext(): Promise<InviteContext | null> {
  const secret = getInviteSecret();
  if (!secret) return null;

  const jar = await cookies();
  const payload = await verifyInviteCookieValue(jar.get(INVITE_COOKIE)?.value, secret);
  if (!payload) return null;

  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('demo_invites')
      .select('slug, demo, recipient_name, recipient_company, greeting_mode, revoked_at')
      .eq('slug', payload.slug)
      .maybeSingle();
    if (error || !data || data.revoked_at) return null;
    if (data.demo !== payload.demo) return null;
    return {
      slug: data.slug,
      demo: data.demo,
      recipientName: data.recipient_name,
      recipientCompany: data.recipient_company,
      greetingMode: data.greeting_mode === 'company' ? 'company' : 'name',
    };
  } catch {
    // Table not migrated in this environment — demos just render unpersonalised.
    return null;
  }
}

export async function listInvites(): Promise<DemoInvite[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from('demo_invites')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`demo_invites read failed: ${error.message}`);
  return (data ?? []) as DemoInvite[];
}

const SHORTNAME_MAX = 24;

/** `Liana (demo)` → `liana-demo`; keeps slugs readable and URL-safe. */
export function toShortname(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, SHORTNAME_MAX)
      .replace(/-+$/g, '') || 'guest'
  );
}

export async function createInvite(input: {
  demo: string;
  recipientName: string;
  recipientCompany: string;
  recipientEmail?: string | null;
  greetingMode?: 'name' | 'company';
  notes?: string | null;
}): Promise<DemoInvite> {
  const secret = getInviteSecret();
  if (!secret) {
    throw new Error('DEMO_INVITE_SECRET is not configured — set it before minting invites.');
  }

  const shortname = toShortname(input.recipientName);
  const sb = getServiceClient();

  // The token is derived from the prefix, so two invites for the same
  // demo+shortname would collide — suffix the prefix until the slug is free.
  for (let attempt = 0; attempt < 20; attempt++) {
    const prefix =
      attempt === 0
        ? `${input.demo}-${shortname}`
        : `${input.demo}-${shortname}${attempt + 1}`;
    const slug = await buildInviteSlug(prefix, secret);
    const token = await inviteToken(prefix, secret);

    const { data, error } = await sb
      .from('demo_invites')
      .insert({
        slug,
        demo: input.demo,
        recipient_name: input.recipientName.trim(),
        recipient_company: input.recipientCompany.trim(),
        recipient_email: input.recipientEmail?.trim() || null,
        greeting_mode: input.greetingMode === 'company' ? 'company' : 'name',
        notes: input.notes?.trim() || null,
        token_hash: await sha256Hex(token),
      })
      .select('*')
      .single();

    if (!error && data) return data as DemoInvite;
    // 23505 = unique violation on slug — try the next suffix.
    if (error && error.code !== '23505') {
      throw new Error(`demo_invites insert failed: ${error.message}`);
    }
  }
  throw new Error('Could not find a free invite slug — try a different recipient name.');
}

export async function revokeInvite(slug: string): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb
    .from('demo_invites')
    .update({ revoked_at: new Date().toISOString() })
    .eq('slug', slug)
    .is('revoked_at', null);
  if (error) throw new Error(`demo_invites revoke failed: ${error.message}`);
}

export async function reinstateInvite(slug: string): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb
    .from('demo_invites')
    .update({ revoked_at: null })
    .eq('slug', slug);
  if (error) throw new Error(`demo_invites reinstate failed: ${error.message}`);
}
