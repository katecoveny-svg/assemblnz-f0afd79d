import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { CONVERSATION_NOTICE, conversationMutationSchema } from '@/apps/do/personal/conversation';
import { loadConversations, mutateConversation, ConversationConflict } from '@/apps/do/personal/conversation-service';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
export async function GET() {
  const owner = await doOwner();
  if (!owner) return json({ records: [], storage: 'none', saved: false, workspaceKey: 'guest', notice: CONVERSATION_NOTICE });
  try { return json({ records: await loadConversations(owner.id), storage: 'account', saved: true, workspaceKey: owner.id, notice: CONVERSATION_NOTICE }); }
  catch { return json({ error: 'Kept conversations are unavailable.', storage: 'unavailable', saved: false, workspaceKey: owner.id }, 503); }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'Open DO on assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'Sign in to keep a conversation.' }, 401);
  // A transcript reviewed under one signed-in owner is never saved under another after a session switch.
  if (request.headers.get('x-do-workspace') !== owner.id) return json({ error: 'Your signed-in workspace changed. Reopen it before keeping this.', workspaceChanged: true }, 409);
  let raw: unknown;
  try { raw = await readDoJson(request, 131072); } catch { return json({ error: 'Use a bounded valid request.' }, 400); }
  const parsed = conversationMutationSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Confirm the conversation and consent before keeping it.' }, 400);
  try { return json({ record: await mutateConversation(owner.id, parsed.data), saved: true, workspaceKey: owner.id }); }
  catch (error) {
    if (error instanceof ConversationConflict) return json({ error: 'This conversation changed on another device. Reload before continuing.' }, 409);
    if (error instanceof Error && error.message === 'conversation_too_long') return json({ error: 'This conversation is too long to keep. Start a new one.' }, 413);
    return json({ error: 'Conversation storage unavailable. No change was confirmed.' }, 503);
  }
}
