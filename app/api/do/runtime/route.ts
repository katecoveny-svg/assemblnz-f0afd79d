import { readDoTrial } from '@/apps/do/shared/trial';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { getDoAvailability } from '@/apps/do/shared/preparation-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return Response.json({ availability: getDoAvailability(), trial: await readDoTrial(chatClientIp(request.headers)).catch(() => null) }, { headers: { 'Cache-Control': 'no-store' } });
}
