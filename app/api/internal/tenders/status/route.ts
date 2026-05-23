/**
 * POST /api/internal/tenders/status
 *
 * Form-posted from the tender detail page. Updates the entry's status.
 * Email-allowlisted to the same set as the page itself.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateEntryStatus } from '@/lib/live-feed/storage';
import type { LiveFeedEntryStatus } from '@/lib/live-feed/types';

const ALLOWED_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

const ALLOWED_STATUSES: LiveFeedEntryStatus[] = [
  'new',
  'reviewing',
  'go',
  'no_go',
  'drafted',
  'submitted',
  'archived',
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return NextResponse.redirect(new URL('/login?redirect=/internal/tenders', request.url));
  }

  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    return NextResponse.json({ ok: false, error: 'not authorised' }, { status: 403 });
  }

  const form = await request.formData();
  const entryId = String(form.get('entry_id') ?? '');
  const status = String(form.get('status') ?? '') as LiveFeedEntryStatus;

  if (!entryId) {
    return NextResponse.json({ ok: false, error: 'entry_id missing' }, { status: 400 });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: `unknown status: ${status}` }, { status: 400 });
  }

  await updateEntryStatus(entryId, status);

  // Redirect back to the detail page so the user sees the new status.
  const dest = new URL(`/internal/tenders/${entryId}`, request.url);
  return NextResponse.redirect(dest, { status: 303 });
}
