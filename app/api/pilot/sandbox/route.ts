/**
 * Pilot sandbox chat — step 6, the test drive.
 *
 * Streams a conversation with a DRAFT agent the user is building. The draft's
 * system prompt is user-authored (not locked IP), so it is posted from the
 * client along with the chosen model and the messages. No persistence, no auth
 * — this is a scratch pad. The same Vercel AI SDK streaming shape as the
 * marketplace chat route, so the sandbox UI can reuse useChat().
 *
 * The model is resolved from the draft's model preference (Claude / GPT /
 * Gemini / Llama), falling open to any configured provider.
 */
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { resolveModel } from '@/lib/pilot/models';
import { FALLBACK_DISCLOSURE } from '@/lib/ai/router';
import type { ModelPreference } from '@/lib/pilot/types';

export const maxDuration = 30;

const DRAFT_FOOTER =
  '\n\nYou are a DRAFT agent being tested in a sandbox. Everything you produce is a draft for a human to check. If the user says something is wrong — too formal, missed a date — adjust on the spot.';

export async function POST(req: Request): Promise<Response> {
  let body: { messages?: UIMessage[]; systemPrompt?: string; modelPreference?: ModelPreference };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const systemPrompt = (body.systemPrompt ?? '').toString().trim();
  if (!systemPrompt) {
    return Response.json({ error: 'No draft prompt to test yet.' }, { status: 400 });
  }

  const pref: ModelPreference = body.modelPreference ?? 'claude';
  const resolved = resolveModel(pref);
  if (!resolved) {
    return Response.json(
      { error: 'No model provider is configured. Set ANTHROPIC_API_KEY (or another provider) to test drive.' },
      { status: 503 },
    );
  }

  const system = resolved.asRequested
    ? systemPrompt + DRAFT_FOOTER
    : `${systemPrompt}${DRAFT_FOOTER}\n\n${FALLBACK_DISCLOSURE}`;

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: resolved.model,
    system,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
