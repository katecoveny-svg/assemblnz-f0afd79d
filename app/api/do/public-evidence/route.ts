import { z } from 'zod';
import { doOwner, privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { readPublicNzEvidence } from '@/lib/public-nz/evidence-tool';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const input = z.object({ topic: z.literal('parliament'), consent: z.literal(true) }).strict();
export async function POST(request: Request) {
  const json = (value: unknown, status: number) => Response.json(value, {status, headers});
  if (!sameDoOrigin(request)) return json({status:'denied'},403);
  const owner = await doOwner();
  if (!owner) return json({status:'sign_in_required'},401);
  if (process.env.DO_GEMINI_LIVE_ENABLED !== 'true') return json({status:'unavailable'},503);
  const parsed = input.safeParse(await readDoJson(request).catch(() => null));
  if (!parsed.success) return json({status:'invalid_request'},400);
  if (!admitDoRequest(`public-evidence:${owner.id}`)) return json({status:'rate_limited'},429);
  const result = await readPublicNzEvidence(parsed.data.topic);
  return json(result,200);
}
