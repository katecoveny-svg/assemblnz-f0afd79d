import { readDoTrial } from '@/apps/do/shared/trial';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { getDoAvailability } from '@/apps/do/shared/preparation-server';
import { doOwner } from '@/apps/do/services/owner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const owner = await doOwner();
  return Response.json({
    signedIn: Boolean(owner),
    availability: getDoAvailability(),
    trial: await readDoTrial(chatClientIp(request.headers), { signedInOwnerId: owner?.id }).catch(() => null),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
