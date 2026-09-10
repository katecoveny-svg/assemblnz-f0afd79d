import { createHash } from 'node:crypto';
import { tool } from 'ai';
import { z } from 'zod';
import { getVertical } from '@/lib/verticals/config';
import { VERTICAL_DRAFT_REVIEW, verticalChatSchema, verticalSystem } from '@/lib/verticals/prompt';
import { resolveModelLadder, generateWithFallback } from '@/lib/ai/router';
import { searchNZKnowledge, type NZKnowledgeResult } from '@/lib/agents/nz-knowledge';
import { consume } from '@/lib/creative/ratelimit';
import { clientIpFromHeaders } from '@/lib/lead-capture';
import { isSpecialist } from '@/lib/specialists/sources';
import { retrieveSpecialistSources } from '@/lib/specialists/live-sources';
import { specialistSystem, specialistRole, SPECIALIST_REVIEW } from '@/lib/specialists/prompt';

export const runtime = 'nodejs';
export const maxDuration = 90;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const v = getVertical((await params).slug);
  if (!v) return Response.json({ error: 'Unknown app.' }, { status: 404, headers });
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) return Response.json({ error: 'Open this app to chat.' }, { status: 403, headers });
  const raw = await req.text().catch(() => '');
  if (raw.length > 48000) return Response.json({ error: 'Please shorten the conversation.' }, { status: 413, headers });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = null; }
  const parsed = verticalChatSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'Send a message of up to 1,000 characters.' }, { status: 400, headers });
  const ladder = resolveModelLadder('claude-sonnet-4-6', ['claude-haiku-4-5-20251001']);
  if (!ladder.length) return Response.json({ error: `${v.agentName} is unavailable here. Please try again later.`, mode: 'unavailable' }, { status: 503, headers });
  // The shared limiter records usage only, not chat text. Ignore client-chosen IDs/cookies.
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown';
  const key = createHash('sha256').update(`vertical-app:${ip}`).digest('hex');
  const rate = await consume(`vertical:${key}`, 'copy');
  if (!rate.ok) return Response.json({ error: 'The demo message limit has been reached. Please try again later.' }, { status: 429, headers: { ...headers, 'Retry-After': String(Math.ceil(rate.resetMs / 1000)) } });
  const checks: NZKnowledgeResult[] = [];
  const abortSignal = AbortSignal.any([req.signal, AbortSignal.timeout(isSpecialist(v.slug) ? 75000 : 45000)]);
  if (isSpecialist(v.slug)) {
    // Retrieval is compulsory and server-selected; the model cannot skip it.
    // Only topic words select public pages. Visitor text is never sent to a search engine.
    const sources = await retrieveSpecialistSources(v.slug, `${parsed.data.history.filter(m => m.role === 'user').map(m => m.content).join(' ')} ${parsed.data.message}`, abortSignal);
    const generated = await generateWithFallback({ ladder, system: specialistSystem(v.slug, sources), agentSlug: v.agent, tenant: 'assembl-public-specialist', messages: [...parsed.data.history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: parsed.data.message }], maxOutputTokens: 1600, abortSignal });
    if (!generated.ok || !generated.text.trim()) return Response.json({ error: 'The specialist could not finish that reply. Please try again.', mode: 'unavailable' }, { status: 503, headers });
    const review = await generateWithFallback({ ladder: v.slug === 'flux' ? resolveModelLadder('claude-haiku-4-5-20251001', ['claude-sonnet-4-6']) : ladder, system: `${SPECIALIST_REVIEW}\nSPECIFIC ROLE AND CAPABILITIES: ${specialistRole(v.slug)}`, agentSlug: `${v.agent}-review`, tenant: 'assembl-public-specialist', messages: [{ role: 'user', content: JSON.stringify({ task: parsed.data.message, history: parsed.data.history, draft: generated.text, sources }) }], maxOutputTokens: 1600, abortSignal });
    if (!review.ok || !review.text.trim()) return Response.json({ error: 'The specialist could not finish checking that reply. Please try again.', mode: 'unavailable' }, { status: 503, headers });
    const verified = sources.filter(s => s.status === 'retrieved');
    return Response.json({ reply: review.text, mode: 'live', agent: v.agent, agentName: v.agentName, sourceStatus: verified.length ? 'retrieved' : sources.length ? 'unavailable' : 'not-requested', sources: verified.map(s => ({ title: s.title, url: s.url, retrievedAt: s.retrievedAt, hash: s.hash, sourceDate: s.sourceDate, ...(s.dataUrl ? { dataUrl: s.dataUrl } : {}) })), sourceFailures: sources.filter(s => s.status === 'unavailable').map(s => s.title), createdAt: new Date().toISOString(), status: 'draft' }, { headers });
  }
  const result = await generateWithFallback({
    ladder, system: verticalSystem(v), agentSlug: v.agent, tenant: 'assembl-public-vertical',
    messages: [...parsed.data.history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: parsed.data.message }],
    maxOutputTokens: 1000, abortSignal,
    tools: { searchNZKnowledge: tool({
      description: 'Read-only search of NZ official knowledge. Call before claims about laws, building codes, tariff or government guidance. Never invent a citation.',
      inputSchema: z.object({ query: z.string().min(1).max(1000) }),
      execute: async ({ query }) => { const check = await searchNZKnowledge(query); checks.push(check); return check; },
    }) }, maxToolSteps: 3,
  });
  if (!result.ok || !result.text.trim()) return Response.json({ error: `${v.agentName} could not finish that reply. Please try again.`, mode: 'unavailable' }, { status: 503, headers });
  // A separate edit catches status/amenity inventions inside quoted draft copy.
  // It receives actual tool results and user facts, not a new tool belt or permissions.
  const reviewed = await generateWithFallback({
    ladder, system: VERTICAL_DRAFT_REVIEW, agentSlug: `${v.agent}-draft-review`, tenant: 'assembl-public-vertical',
    messages: [{ role: 'user', content: JSON.stringify({ task: parsed.data.message, history: parsed.data.history, draft: result.text, sources: checks, reviewer: v.reviewer }) }],
    maxOutputTokens: 1000, abortSignal,
  });
  if (!reviewed.ok || !reviewed.text.trim()) return Response.json({ error: `${v.agentName} could not finish checking that draft. Please try again.`, mode: 'unavailable' }, { status: 503, headers });
  const successful = checks.filter((c): c is Extract<NZKnowledgeResult, { status: 'ok' }> => c.status === 'ok');
  return Response.json({
    reply: reviewed.text, mode: 'live', agent: v.agent, agentName: v.agentName,
    sourceStatus: successful.length ? 'retrieved' : checks.length ? 'unavailable' : 'not-requested',
    sources: successful.flatMap(c => c.sources.map(s => ({ title: s.title, url: s.url, retrievedAt: c.retrievedAt }))),
    createdAt: new Date().toISOString(), status: 'draft',
  }, { headers });
}
