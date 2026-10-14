import { PilotError } from '@/lib/typesafe/core';
import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { admitDoRequest, readDoJson } from '@/apps/do/shared/http';
import { chatClientIp, checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
import { DoPreparationError, prepareDoDraft } from '@/apps/do/shared/preparation-server';
import { lifeAdminPreparationBrief, lifeAdminPreparationSchema } from '@/apps/do/personal/life-admin/engine';
import { getPersonalDoProfile } from '@/apps/do/personal/profile-service';
import { formatPersonalDoStyle } from '@/apps/do/personal/profile';
import { lifeAdminTemplate } from '@/apps/do/personal/life-admin/templates';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'Open Personal DO on assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'Sign in to DO to prepare a tailored draft. Your local checklist is still available.' }, 401);
  let raw: unknown;
  try { raw = await readDoJson(request); } catch { return json({ error: 'Use a shorter, valid request.' }, 400); }
  const parsed = lifeAdminPreparationSchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? 'Check the details and permission.' }, 400);
  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip) || !(await checkChatRateLimit(ip, 'do-life-admin')).allowed) return json({ error: 'Please wait before preparing another draft.' }, 429);
  try {
    const input = parsed.data;
    const template = lifeAdminTemplate(input.category);
    const source = [input.source, '', 'Details supplied by the user:', ...template.fields.map((field) => `${field.label}: ${input.fields[field.key] || '[Not supplied]'}`)].join('\n');
    // Combined source is capped, never silently truncated after the user's review.
    if (source.length > 12_000) return json({ error: 'Shorten the notes or details to 12,000 characters together.' }, 400);
    let style: string | undefined;
    try { const saved = await getPersonalDoProfile(owner.id); if (saved.saved) style = formatPersonalDoStyle(saved.profile); } catch { /* Optional preferences never block preparation. */ }
    const draft = await prepareDoDraft({ task: 'plan', source, sourceTitle: input.title || template.packTitle, sourceUrl: '', consent: true, providerConsentVersion: input.providerConsentVersion, brief: lifeAdminPreparationBrief(input.category) }, request.signal, style, { ownerId: owner.id, requestId: request.headers.get('Idempotency-Key') ?? undefined });
    if (request.signal.aborted) return json({ error: 'Draft preparation was stopped.' }, 409);
    return json({ draft });
  } catch (error) {
    if (error instanceof PilotError) return json({ error: error.message }, error.status);
    return json({ error: error instanceof DoPreparationError ? error.message : 'The draft could not be prepared. Your local checklist is unchanged.' }, 503);
  }
}
