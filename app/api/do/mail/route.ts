import { doOwner, privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { MailError, mailReadiness, readMail } from '@/apps/do/mail/server';
import { mailRequest } from '@/apps/do/mail/contract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

/** Connected-account metadata only. Never tests a mailbox by reading it. */
export async function GET(req: Request) {
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required' }, 401);
  if (new URL(req.url).search) return json({ error: 'invalid_query' }, 400);
  if (!admitDoRequest(`mail-readiness:${owner.id}`)) return json({ error: 'rate_limited' }, 429);
  try {
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(15_000)]);
    const readiness = await mailReadiness(owner, signal);
    const current = await doOwner();
    signal.throwIfAborted();
    if (current?.id !== owner.id || current.externalId !== owner.externalId) return json({ error: 'owner_changed' }, 409);
    return json(readiness);
  } catch { return json({ error: 'readiness_unavailable' }, 503); }
}

export async function POST(req: Request) {
  if (!sameDoOrigin(req)) return json({ error: 'same_origin_required' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required' }, 401);
  const parsed = mailRequest.safeParse(await readDoJson(req, 4000).catch(() => null));
  if (!parsed.success) return json({ error: 'invalid_mail_request' }, 400);
  if (parsed.data.ownerId !== owner.id) return json({ error: 'owner_changed' }, 409);
  if (!admitDoRequest(`mail-read:${owner.id}`)) return json({ error: 'rate_limited' }, 429);
  try {
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(45_000)]);
    return json(await readMail(parsed.data, owner, signal, doOwner));
  } catch (error) {
    if (req.signal.aborted) return json({ error: 'cancelled' }, 499);
    if (error instanceof MailError) return json({ error: error.code }, error.status);
    // Do not log or echo provider errors: they may include private text.
    return json({ error: 'mail_unavailable', message: 'Mail could not be read. Check the selected account and its read permission, then try again.' }, 503);
  }
}
