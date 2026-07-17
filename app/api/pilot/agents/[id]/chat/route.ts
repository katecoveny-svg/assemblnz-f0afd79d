/**
 * Run a SAVED Pilot agent — the shipped-agent chat.
 *
 * Unlike the sandbox (step 6, where the in-progress draft's prompt is posted
 * from the client), a saved agent's system prompt is resolved SERVER-SIDE
 * from its pilot_agents row — the browser only ever sends the user's
 * messages. Authorisation is RLS: the cookie-aware client can only read rows
 * where owner_id = auth.uid(), so running someone else's agent 404s.
 *
 * The model comes from the agent's saved preference through the same
 * fail-open resolver as the sandbox. Outputs stay drafts — the agent runs
 * for its owner; it never sends anything anywhere.
 */
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { getOwner, getDraft } from '@/lib/pilot/store';
import { resolveModel } from '@/lib/pilot/models';
import { FALLBACK_DISCLOSURE } from '@/lib/ai/router';

export const maxDuration = 60;

const SAVED_FOOTER =
  '\n\nYou are running for the person who built you. Everything you produce is a draft for them to check before it goes anywhere — you never send, post, or run anything yourself, and you say so plainly if asked.';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const owner = await getOwner();
  if (!owner) {
    return Response.json({ error: 'Sign in to run your agent.' }, { status: 401 });
  }

  const { id } = await params;
  // RLS scopes this read to the signed-in owner — a foreign id reads as absent.
  const draft = await getDraft(id);
  if (!draft) {
    return Response.json({ error: 'Agent not found.' }, { status: 404 });
  }

  const systemPrompt = draft.pack?.systemPrompt?.trim() ?? '';
  if (!systemPrompt) {
    return Response.json(
      { error: 'This agent has no drafted pack yet — finish it in Pilot first.' },
      { status: 409 },
    );
  }

  const resolved = resolveModel(draft.modelPreference);
  if (!resolved) {
    return Response.json(
      { error: 'No model provider is configured. Set ANTHROPIC_API_KEY (or another provider) to run agents.' },
      { status: 503 },
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const system = resolved.asRequested
    ? systemPrompt + SAVED_FOOTER
    : `${systemPrompt}${SAVED_FOOTER}\n\n${FALLBACK_DISCLOSURE}`;

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: resolved.model,
    system,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
