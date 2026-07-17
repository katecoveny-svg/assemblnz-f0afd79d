/**
 * POST /api/a/share {agentId} — publish a signed-in Pilot build as a public
 * community page.
 *
 * Auth required: getOwner() resolves the Supabase session and getDraft() is
 * RLS-scoped, so only the owner's own pilot_agents rows can be shared (a
 * foreign id reads as absent → 404). The row is COPIED into community_agents
 * — pilot_agents itself is never touched, and the /agents/mine flow stays
 * exactly as it was. Re-sharing the same agent returns the existing link.
 */
import { getOwner, getDraft } from '@/lib/pilot/store';
import {
  creatorHash,
  findExistingShare,
  insertCommunityAgent,
} from '@/lib/agents/community';

export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  const owner = await getOwner();
  if (!owner) {
    return Response.json({ error: 'Sign in to share your agent.' }, { status: 401 });
  }

  let body: { agentId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const agentId = typeof body.agentId === 'string' ? body.agentId : '';
  if (!agentId) {
    return Response.json({ error: 'agentId is required.' }, { status: 400 });
  }

  // RLS scopes this read to the signed-in owner.
  const draft = await getDraft(agentId);
  if (!draft) {
    return Response.json({ error: 'Agent not found.' }, { status: 404 });
  }
  if (!draft.name.trim() || !draft.pack?.systemPrompt?.trim()) {
    return Response.json(
      { error: 'This agent has no drafted pack yet — finish it in Pilot first.' },
      { status: 409 },
    );
  }

  const createdByHash = creatorHash(`user:${owner}`);

  // Idempotent: same owner + same name → the existing public link.
  const existing = await findExistingShare(draft.name, createdByHash);
  if (existing) {
    return Response.json({ slug: existing, url: `/a/${existing}` });
  }

  let shareSlug: string | null = null;
  try {
    shareSlug = await insertCommunityAgent({
      name: draft.name,
      description: draft.description,
      icon: draft.icon,
      accent: draft.accent,
      spec: draft.spec,
      pack: draft.pack,
      systemPrompt: draft.pack.systemPrompt,
      createdByHash,
    });
  } catch {
    shareSlug = null;
  }
  if (!shareSlug) {
    return Response.json(
      { error: 'Could not create the public page — try again shortly.' },
      { status: 503 },
    );
  }

  return Response.json({ slug: shareSlug, url: `/a/${shareSlug}` }, { status: 201 });
}
