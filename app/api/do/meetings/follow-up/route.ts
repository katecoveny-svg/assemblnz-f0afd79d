import { z } from 'zod';
import { doOwner, sameDoOrigin, privateDoHeaders as headers } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
import { meetingFollowupSchema } from '@/apps/do/shared/meeting-followthrough';
import { queueMeetingFollowup, readMeetingFollowup } from '@/apps/do/services/meeting-followup';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
export async function GET(request: Request) {
  const owner = await doOwner();
  if (!owner) return json({ message: 'Sign in to check your follow-up.' }, 401);
  const id = z.string().uuid().safeParse(new URL(request.url).searchParams.get('requestId'));
  if (!id.success) return json({ message: 'Choose a valid follow-up request.' }, 400);
  try {
    const receipt = await readMeetingFollowup(owner.id, id.data);
    return receipt ? json({ receipt }) : json({ message: 'No saved follow-up was found for this account.' }, 404);
  } catch { return json({ message: 'The follow-up status is unavailable. Keep your draft and check again.' }, 503); }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ message: 'Open Meeting DO to review your follow-up.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ message: 'Sign in before requesting email review.' }, 401);
  let raw: unknown;
  try { raw = await readDoJson(request, 64_000); }
  catch (error) { return json({ message: 'Use a valid follow-up smaller than 64 KB.' }, error instanceof Error && error.message === 'too_large' ? 413 : 400); }
  const input = meetingFollowupSchema.safeParse(raw);
  if (!input.success) return json({ message: 'Check the recipient, subject, message and review permission.' }, 400);
  if (!(await checkChatRateLimit(owner.id, 'do-meeting-followup')).allowed) return json({ message: 'Please wait before requesting another follow-up.' }, 429);
  try { return json({ receipt: await queueMeetingFollowup(owner.id, input.data) }); }
  catch { return json({ message: 'The follow-up could not be confirmed. Keep this draft and check its status before retrying.' }, 503); }
}
