import { familyRequest } from '@/apps/do/services/family';
import { collectFamilyMail, organiseFamilyMail } from '@/apps/do/services/family-server';
import { doOwner, privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { DoTrialError, reserveDoTrial } from '@/apps/do/shared/trial';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
export const runtime = 'nodejs';
export const maxDuration = 180;
export async function POST(req: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (!sameDoOrigin(req)) return json({ message: 'Open the private family DO page.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ message: 'Sign in before reading your school emails.' }, 401);
  const parsed = familyRequest.safeParse(await readDoJson(req).catch(() => null));
  if (!parsed.success) return json({ message: 'Choose 1–8 school email addresses, a time range and permission to prepare your list.' }, 400);
  const ip = chatClientIp(req.headers);
  if (!admitDoRequest(ip)) return json({ message: 'Please wait a minute before checking again.' }, 429);
  let reservation: Awaited<ReturnType<typeof reserveDoTrial>> | null = null;
  try {
    reservation = await reserveDoTrial(ip, { signedInOwnerId: owner.id });
    const { messages, moreAvailable } = await collectFamilyMail(owner.externalId, parsed.data.senders, parsed.data.days);
    if (!messages.some(m => m.text.trim())) {
      await reservation.release(); reservation = null;
      return json({ empty: true, message: 'No readable messages matched these senders in this time range. No free task was used.' });
    }
    const result = await organiseFamilyMail(messages, req.signal);
    return json({ result, sources: messages.map(source => ({ id: source.id, subject: source.subject, from: source.from, date: source.date, truncated: source.truncated, hasAttachments: source.hasAttachments, url: `https://mail.google.com/mail/u/0/#all/${source.id}` })), checkedAt: new Date().toISOString(), moreAvailable, status: 'review', stored: false });
  } catch (error) {
    if (reservation) await reservation.release().catch(() => {});
    if (error instanceof DoTrialError) return json({ message: error.message, error: error.code }, error.code === 'trial_exhausted' ? 402 : 503);
    return json({ message: 'DO could not complete a source-checked school-admin list. Check your Gmail connection and try again. No free task was retained for this failed run.' }, 503);
  }
}
