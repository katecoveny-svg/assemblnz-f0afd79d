/**
 * Pilot draft CRUD.
 *
 *   GET  → the current user's drafts (newest first)
 *   POST → upsert a draft { draft }, returns the stored draft with its id
 *
 * Auth required (RLS owner-scoped). 401 when not signed in.
 */
import { getOwner, listDrafts, saveDraft } from '@/lib/pilot/store';
import type { PilotDraft } from '@/lib/pilot/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: 'Sign in to see your agents.' }, { status: 401 });
  const drafts = await listDrafts();
  return Response.json({ drafts });
}

export async function POST(req: Request): Promise<Response> {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: 'Sign in to save your agent.' }, { status: 401 });

  let body: { draft?: PilotDraft };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!body.draft) return Response.json({ error: 'No draft supplied.' }, { status: 400 });

  const stored = await saveDraft(owner, body.draft, 'draft');
  if (!stored) return Response.json({ error: 'Could not save the draft.' }, { status: 500 });

  return Response.json({ draft: stored });
}
