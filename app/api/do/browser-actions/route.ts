import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { browserActionRequest } from '@/apps/do/browser/contract';
import { browserActionCapability } from '@/apps/do/browser/capability';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
export async function GET() {
  if (!await doOwner()) return json({ error: 'sign_in_required' }, 401);
  return json(browserActionCapability());
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
  if (!await doOwner()) return json({ error: 'sign_in_required' }, 401);
  try {
    if (!browserActionRequest.safeParse(await readDoJson(request)).success) return json({ error: 'invalid_request' }, 400);
  } catch { return json({ error: 'invalid_request' }, 400); }
  // No production store/pairing/retailer adapter is bound. Never route into action-stub.
  return json({ error: 'browser_actions_unavailable', capability: browserActionCapability() }, 503);
}
