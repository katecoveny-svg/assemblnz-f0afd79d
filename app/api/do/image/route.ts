import { z } from 'zod';
import { generateImages } from '@/lib/creative/generate';
import { reserveDoTrial, DoTrialError } from '@/apps/do/shared/trial';
import { allowedDoOrigin, doHeaders, readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
export const runtime = 'nodejs';
export const maxDuration = 60;
const input = z.object({ prompt: z.string().trim().min(10).max(4000), consent: z.literal(true), aspectRatio: z.enum(['1:1', '16:9', '9:16']).default('1:1') }).strict();
export function OPTIONS(req: Request) { return new Response(null, { status: allowedDoOrigin(req) ? 204 : 403, headers: doHeaders(req) }); }
export async function POST(req: Request) {
  const headers = doHeaders(req);
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (!allowedDoOrigin(req)) return json({ message: 'Open DO to generate an image.' }, 403);
  const parsed = input.safeParse(await readDoJson(req).catch(() => null));
  if (!parsed.success) return json({ message: 'Add a brief of 10–4,000 characters and confirm permission.' }, 400);
  const ip = chatClientIp(req.headers);
  if (!admitDoRequest(ip)) return json({ message: 'Please wait a minute before trying again.' }, 429);
  let reservation: Awaited<ReturnType<typeof reserveDoTrial>>;
  try { reservation = await reserveDoTrial(ip); }
  catch (error) { const e = error as DoTrialError; return json({ error: e.code, message: e.message }, e.code === 'trial_exhausted' ? 402 : 503); }
  try {
    // Leave enough headroom for Vercel to return our own graceful response
    // instead of a platform-level 504 on slower creative providers.
    const result = await generateImages(parsed.data.prompt, { count: 1, aspectRatio: parsed.data.aspectRatio, signal: AbortSignal.timeout(48_000) });
    return json({ images: result.images, model: result.model.startsWith('generate-image edge') ? 'assembl image service' : result.model, status: 'draft' });
  } catch {
    await reservation.release().catch(() => {});
    return json({ message: 'The image provider could not complete this task. Your brief is still here. Please try again later.' }, 503);
  }
}
