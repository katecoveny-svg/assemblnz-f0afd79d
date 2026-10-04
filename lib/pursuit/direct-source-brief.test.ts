import {completeTrial} from './public-store';
import { describe, expect, it, vi } from 'vitest';
import { runDirectSourceBrief, runPublicDirectBrief, directProviderTransport } from './direct-source-brief';
import { DIRECT_SOURCE_URLS } from './direct-sources';
import { PUBLIC_TEST_MODEL } from './public-cost-admission';
import { DIRECT_SOURCE_DEFAULT_GOAL } from './direct-proposal';
import { ASSEMBL_PUBLIC_OFFER } from './public-knowledge';
const quote = 'This public page describes governed work with human review.';
const plan = { version: 1, goalEcho: DIRECT_SOURCE_DEFAULT_GOAL, focus: 'goal-led', action: 'map-task', evidence: DIRECT_SOURCE_URLS.map(url => ({ url, claim: quote })) };
function source(url: string, fact = quote) { const response = new Response(`<title>Fictional source</title><main><p>${fact}</p><p>A second complete fictional sentence provides enough context for this source receipt.</p></main>`, { headers: { 'content-type': 'text/html' } }); Object.defineProperty(response, 'url', { value: url }); return response; }
function provider(value: unknown) { return Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(value) }], usage: { input_tokens: 100, output_tokens: 100 } }); }
const sourceFetch: typeof fetch = async url => source(String(url));
describe('one-call scoped observations and plan', () => {
  it('uses pinned standard-only inference with no tools/retries and projects source-traced proposals', async () => {
    const inference = vi.fn<typeof fetch>(async () => provider(plan)); const result = await runDirectSourceBrief({ requestId: 'fixture', sourceFetch, inferenceFetch: inference, now: () => 1000 });
    const body = JSON.parse(inference.mock.calls[0][1]!.body as string), input = JSON.parse(body.messages[0].content);
    expect(body).toMatchObject({ model: PUBLIC_TEST_MODEL, service_tier: 'standard_only', max_tokens: 2400 }); expect(body.tools).toBeUndefined(); expect(body.thinking).toBeUndefined(); expect(body.cache_control).toBeUndefined();
    expect(input.userGoal).toBe(DIRECT_SOURCE_DEFAULT_GOAL); expect(input.currentOwnedOffer).toBe(ASSEMBL_PUBLIC_OFFER); expect(input.selectedFocus).toBe('goal-led');
    expect(input.sourceRoles).toEqual({ companyOffer: DIRECT_SOURCE_URLS[0], deliveryGuidance: DIRECT_SOURCE_URLS[1] });
    expect(result).toMatchObject({ mode: 'direct_source_brief', trace: { webSearches: 0, providerCalls: 1, persisted: false } });
    expect(result.trace.budget.reservedUpperUsd).toBeCloseTo(.212); expect(result.trace.budget.grossUpperUsd).toBeCloseTo(.2438); expect(result.draft.evidence).toEqual(plan.evidence); expect(inference).toHaveBeenCalledTimes(1);
  });
  it.each([
    { ...plan, summary: 'Many New Zealand firms lack structured approaches to safe AI implementation.' },
    { ...plan, opportunity: 'Explore whether a service would help because New Zealand businesses lack useful systems.' },
    { ...plan, title: 'AI Workflow Safety and Adoption Readiness Review' },
    { ...plan, action: 'arbitrary-market-audit' },
  ])('rejects protocol drift once, without a repair call or substitute result', async value => {
    const inference = vi.fn<typeof fetch>(async () => provider(value));
    await expect(runDirectSourceBrief({ requestId: 'fixture', sourceFetch, inferenceFetch: inference, now: () => 1000 })).rejects.toMatchObject({ message: 'direct_proposal_unsupported', receipt: { stage: 'validation', providerCalls: 1, webSearches: 0 } });
    expect(inference).toHaveBeenCalledTimes(1);
  });
  it('retains even a market observation only as a verified exact quotation, not invented narrative', async () => {
    const fact = 'Many New Zealand firms lack this fictional fixture capability.';
    const grounded = { ...plan, evidence: DIRECT_SOURCE_URLS.map(url => ({ url, claim: fact })) };
    const inference = vi.fn<typeof fetch>(async () => provider(grounded));
    const result = await runDirectSourceBrief({ requestId: 'fixture', sourceFetch: async url => source(String(url), fact), inferenceFetch: inference, now: () => 1000 });
    expect(result.draft.evidence).toEqual(grounded.evidence); expect(result.draft.summary).not.toContain(fact); expect(result.draft.opportunity).not.toContain(fact); expect(inference).toHaveBeenCalledTimes(1);
  });
  it('binds a custom goal and explicit privacy focus to the same one-call projection', async () => {
    const goal = 'Review how information moves across the customer handoff.';
    const inference = vi.fn<typeof fetch>(async () => provider({ ...plan, goalEcho: goal, focus: 'privacy-review', action: 'review-information-flow' }));
    const result = await runDirectSourceBrief({ requestId: 'fixture', goal, focus: 'privacy-review', sourceFetch, inferenceFetch: inference, now: () => 1000 });
    expect(result.planKind).toBe('authored_starter_plan'); expect(result).not.toHaveProperty('scopedPlan'); expect(JSON.stringify(result)).not.toContain(goal); expect(result.draft.proposedWork).toContain('information flow'); expect(JSON.parse(JSON.parse(inference.mock.calls[0][1]!.body as string).messages[0].content).userGoal).toBe(goal);
  });
  it('does not infer when either required source is unavailable', async () => {
    const inference = vi.fn<typeof fetch>(); await expect(runDirectSourceBrief({ requestId: 'fixture', sourceFetch: async () => new Response('challenge'), inferenceFetch: inference })).rejects.toThrow('direct_sources_unavailable'); expect(inference).not.toHaveBeenCalled();
  });
  for (const value of [{ ...plan, evidence: [{ ...plan.evidence[0], url: 'https://www.assembl.co.nz/?guessed=1' }, plan.evidence[1]] }, { ...plan, evidence: [{ ...plan.evidence[0], claim: 'This unsupported quotation was never returned by the source.' }, plan.evidence[1]] }]) it('rejects URL/quote drift before projection without another call', async () => {
    const inference = vi.fn<typeof fetch>(async () => provider(value)); await expect(runDirectSourceBrief({ requestId: 'fixture', sourceFetch, inferenceFetch: inference, now: () => 1000 })).rejects.toThrow('direct_quote_untraced'); expect(inference).toHaveBeenCalledTimes(1);
  });
  it('retains one reservation on transport failure without leaking exception content', async () => {
    const inference = vi.fn<typeof fetch>(async () => { throw new Error('private fixture response'); });
    await expect(runDirectSourceBrief({ requestId: 'fixture', sourceFetch, inferenceFetch: inference, now: () => 1000 })).rejects.toMatchObject({ message: 'direct_brief_failed', receipt: { stage: 'draft', providerCalls: 1, webSearches: 0, budget: { reservedUpperUsd: expect.closeTo(.212) } } }); expect(inference).toHaveBeenCalledTimes(1);
  });
});
describe('native existing-key transport', () => {
  it('adds only the existing server key with one native request and redirects forbidden', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'fixture-only'); try {
      const native = vi.fn<typeof fetch>(async () => new Response('fixture')); const transport = directProviderTransport(native);
      await transport('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      expect(native).toHaveBeenCalledTimes(1); expect(new Headers(native.mock.calls[0][1]?.headers).get('x-api-key')).toBe('fixture-only'); expect(native.mock.calls[0][1]).toMatchObject({ redirect: 'error', credentials: 'omit', cache: 'no-store' });
      await expect(transport('https://elsewhere.example', { method: 'POST', body: '{}' })).rejects.toThrow('direct_inference_protocol'); expect(native).toHaveBeenCalledTimes(1);
    } finally { vi.unstubAllEnvs(); }
  });
});

it('never includes the original prompt in the server result or completeTrial write',async()=>{
 const goal='Make the precise visitor-only purple website handoff fixture.';
 const input={requestId:'72b1797b-420a-4c56-a6bf-cf74832c948e',company:'assembl.co.nz',goal,consent:true as const,useTypeSafe:false,sourceMode:'direct_source_brief' as const,directFocus:'creative' as const};
 const fetcher=vi.fn<typeof fetch>(async url=>String(url).startsWith('https://storage.example')?Response.json([{}]):DIRECT_SOURCE_URLS.includes(String(url) as typeof DIRECT_SOURCE_URLS[number])?source(String(url)):provider({...plan,goalEcho:goal,focus:'creative',action:'create-experience'}));
 vi.stubEnv('ANTHROPIC_API_KEY','fixture-only');vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://storage.example');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','fixture-only');vi.stubGlobal('fetch',fetcher);
 try{
  const result=await runPublicDirectBrief(input);expect(result.planKind).toBe('authored_starter_plan');expect(result).not.toHaveProperty('scopedPlan');expect(JSON.stringify(result)).not.toContain(goal);
  await completeTrial(input.requestId,'fixture-owner',result);const writes=fetcher.mock.calls.filter(([url])=>String(url).startsWith('https://storage.example'));expect(writes).toHaveLength(1);const body=JSON.parse(String(writes[0][1]?.body));expect(body.result).toEqual(result);expect(body.result).not.toHaveProperty('scopedPlan');expect(JSON.stringify(body)).not.toContain(goal);
 }finally{vi.unstubAllGlobals();vi.unstubAllEnvs();}
});
