/**
 * Pilot step-1 identity suggestions.
 *
 * POST { name, description } → { icon, teReo, slug }. Deterministic (no model
 * call) so it is instant and respects tikanga — te reo is only ever suggested
 * from a small curated set of everyday words, never invented, and skipped when
 * nothing fits. The client may override any of it.
 */
import { suggestIcon, suggestTeReo, slugify, inferCategory } from '@/lib/pilot/identity';

export async function POST(req: Request): Promise<Response> {
  let body: { name?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = (body.name ?? '').toString();
  const description = (body.description ?? '').toString();
  const text = `${name} ${description}`;

  return Response.json({
    icon: suggestIcon(text),
    teReo: suggestTeReo(text),
    slug: slugify(name) || 'my-agent',
    category: inferCategory(text),
  });
}
