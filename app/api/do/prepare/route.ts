import { reserveDoTrial, DoTrialError } from '@/apps/do/shared/trial';
import { preparationInputSchema } from '@/apps/do/shared/preparation';
import { DoPreparationError, prepareDoDraft } from '@/apps/do/shared/preparation-server';
import { admitDoRequest, allowedDoOrigin, doHeaders, readDoJson } from '@/apps/do/shared/http';
import { chatClientIp, checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export function OPTIONS(request: Request) {
  return new Response(null, { status: allowedDoOrigin(request) ? 204 : 403, headers: doHeaders(request) });
}
export async function POST(request: Request) {
  const headers = doHeaders(request);
  const json = (body: unknown, status: number) => Response.json(body, { status, headers });
  if (!allowedDoOrigin(request)) return json({ error: 'origin_not_allowed', message: 'Open DO from its website or installed extension.' }, 403);
  let raw: unknown;
  try { raw = await readDoJson(request); } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'too_large';
    return json({ error: tooLarge ? 'too_large' : 'invalid_request', message: tooLarge ? 'This text is too long. Use an excerpt of up to 12,000 characters.' : 'Send a valid JSON preparation request.' }, tooLarge ? 413 : 400);
  }
  const parsed = preparationInputSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'invalid_input', message: parsed.error.issues[0]?.message || 'Check the preparation fields.' }, 400);
  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip)) { headers.set('Retry-After', '60'); return json({ error: 'rate_limited', message: 'Please wait a minute before preparing another draft.' }, 429); }
  if (parsed.data.task !== 'extract') {
    const rate = await checkChatRateLimit(ip, 'do-preparation');
    if (!rate.allowed) { headers.set('Retry-After', '600'); return json({ error: 'rate_limited', message: 'You have reached the preparation limit for now. Please try again in ten minutes.' }, 429); }
  }
  let reservation: Awaited<ReturnType<typeof reserveDoTrial>>;
  try { reservation = await reserveDoTrial(ip); }
  catch (error) { const e = error as DoTrialError; return json({ error: e.code, message: e.message }, e.code === 'trial_exhausted' ? 402 : 503); }
  try { return json({ draft: await prepareDoDraft(parsed.data, request.signal) }, 200); }
  catch (error) {
    await reservation.release().catch(() => {});
    if (error instanceof DoPreparationError) return json({ error: error.code, message: error.message }, 503);
    return json({ error: 'preparation_failed', message: 'DO could not finish this preparation. Your text is still in the editor. Please try again.' }, 503);
  }
}
