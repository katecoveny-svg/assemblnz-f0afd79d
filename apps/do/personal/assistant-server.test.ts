import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/public-nz/server', () => ({ retrieveVerifiedPublicNzKnowledge: vi.fn() }));
vi.mock('ai', async original => ({ ...(await original<typeof import('ai')>()), generateText: vi.fn() }));
vi.mock('@/lib/ai/router', () => ({ openaiResponsesRung: vi.fn() }));
vi.mock('@/lib/typesafe/transport', () => ({ evaluateTypeSafePayload: vi.fn() }));
vi.mock('@/lib/billing/personal-do-access', () => ({ admitPersonalDoUsage: vi.fn(), hasPersonalDoEntitlement: vi.fn() }));
vi.mock('./profile-service', () => ({ getPersonalDoProfile: vi.fn() }));
import { retrieveVerifiedPublicNzKnowledge } from '@/lib/public-nz/server';
import { admitPersonalDoUsage, hasPersonalDoEntitlement } from '@/lib/billing/personal-do-access';
import { generateText } from 'ai';
import { openaiResponsesRung } from '@/lib/ai/router';
import { evaluateTypeSafePayload } from '@/lib/typesafe/transport';
import { getPersonalDoProfile } from './profile-service';
import { DEFAULT_PERSONAL_DO_PROFILE } from './profile';
import { personalAssistantInputSchema } from './assistant';
import { personalAssistantAvailability, checkedPersonalAssistantAvailability, runPersonalAssistant } from './assistant-server';

const owner = 'test-owner';
const input = personalAssistantInputSchema.parse({ message: 'Help me plan the house move.', consent: true });
const output = { reply: 'Start with the moving date.', rationale: 'The date determines the order of work.', evidence: [{ source: 'message', quote: 'house move' }], missingInformation: ['Moving date'], nextStep: { kind: 'review_draft', label: 'Review this plan', draft: '1. Confirm the moving date.\n2. List the rooms to pack.' } };
const evaluation = (choice: 'prepare' | 'clarify' | 'unsupported' = 'prepare', confidence = 0.9) => ({ evaluation: { model: 'jev-1.13.0', action: { type: 'choice' as const, choice, confidence, probabilities: { prepare: 0.9, clarify: 0.08, unsupported: 0.02 } }, usage: { input_tokens: 100, output_tokens: 10 } }, elapsedMs: 50, attempts: 1 });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('OPENAI_API_KEY', 'TEST_ONLY_NOT_REAL'); vi.stubEnv('TYPESAFE_API_KEY', 'TEST_ONLY_NOT_REAL');
  vi.stubEnv('TYPESAFE_ENABLED', 'true'); vi.stubEnv('TYPESAFE_PILOT_USER_IDS', owner); vi.stubEnv('TYPESAFE_REVIEW_THRESHOLD', '0.75');
  vi.mocked(openaiResponsesRung).mockReturnValue({ id: 'gpt-6-astra', label: 'gpt-6-astra', isPrimary: true, model: 'test-model' });
  vi.mocked(evaluateTypeSafePayload).mockResolvedValue(evaluation());
  vi.mocked(generateText).mockResolvedValue({ output, response: { modelId: 'gpt-6-astra' }, finishReason: 'stop' } as unknown as Awaited<ReturnType<typeof generateText>>);
  vi.mocked(getPersonalDoProfile).mockResolvedValue({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
});
afterEach(() => vi.unstubAllEnvs());

describe('Personal DO live-provider orchestration (mocked providers)', () => {
  it('reports configuration rather than claiming a live model was proved', () => {
    expect(personalAssistantAvailability(owner)).toMatchObject({ ready: true, model: 'gpt-6-astra' });
    expect(personalAssistantAvailability(null)).toMatchObject({ ready: false, signedIn: false });
    expect(JSON.stringify(personalAssistantAvailability(null))).not.toContain('TEST_ONLY');
    vi.stubEnv('OPENAI_API_KEY', ''); expect(personalAssistantAvailability(owner).reason).toBe('astra_unavailable');
    vi.stubEnv('TYPESAFE_ENABLED', 'false'); expect(personalAssistantAvailability(owner).reason).toBe('typesafe_unavailable');
    expect(personalAssistantAvailability('other').reason).toBe('pilot_access_required');
  });
  it('runs TypeSafe then only Astra, with bounded structured output and no tools', async () => {
    const result = await runPersonalAssistant(input, owner);
    expect(evaluateTypeSafePayload).toHaveBeenCalledOnce(); expect(generateText).toHaveBeenCalledOnce();
    expect(vi.mocked(evaluateTypeSafePayload).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(generateText).mock.invocationCallOrder[0]);
    expect(openaiResponsesRung).toHaveBeenCalledWith('gpt-6-astra');
    const options = vi.mocked(generateText).mock.calls[0][0];
    expect(options).toMatchObject({ maxRetries: 0, maxOutputTokens: 6000, providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'medium', reasoningSummary: null, store: false } } });
    expect(options).not.toHaveProperty('tools'); expect(options.system).toContain('hidden chain of thought');
    expect(result).toMatchObject({ state: 'draft', externalActions: false, persisted: false, reviewRequired: true, generation: { actualModel: 'gpt-6-astra' }, reasoning: { provider: 'typesafe' } });
    expect(getPersonalDoProfile).not.toHaveBeenCalled();
  });
  it('holds existing pilot access and consent boundaries before calls', async () => {
    await expect(runPersonalAssistant(input, 'other')).rejects.toMatchObject({ code: 'pilot_access_required' });
    await expect(runPersonalAssistant({ ...input, consent: false } as never, owner)).rejects.toThrow();
    vi.stubEnv('TYPESAFE_ENABLED', 'false'); await expect(runPersonalAssistant(input, owner)).rejects.toMatchObject({ code: 'pilot_not_configured' });
    expect(generateText).not.toHaveBeenCalled(); expect(evaluateTypeSafePayload).not.toHaveBeenCalled();
  });
  it('does not fall back if either provider is absent or fails', async () => {
    vi.mocked(openaiResponsesRung).mockReturnValue(null);
    await expect(runPersonalAssistant(input, owner)).rejects.toMatchObject({ code: 'astra_unavailable' });
    expect(evaluateTypeSafePayload).not.toHaveBeenCalled();
    vi.mocked(openaiResponsesRung).mockReturnValue({ id: 'gpt-6-astra', label: 'gpt-6-astra', isPrimary: true, model: 'test-model' });
    vi.mocked(evaluateTypeSafePayload).mockRejectedValue(new Error('provider rejected request'));
    await expect(runPersonalAssistant(input, owner)).rejects.toThrow(); expect(generateText).not.toHaveBeenCalled();
  });
  it('stops unsupported routes without labelling a template as Astra output', async () => {
    vi.mocked(evaluateTypeSafePayload).mockResolvedValue(evaluation('unsupported'));
    expect(await runPersonalAssistant(input, owner)).toMatchObject({ state: 'unsupported', generation: null, nextStep: { kind: 'answer_question', draft: null } });
    expect(generateText).not.toHaveBeenCalled();
  });
  it('low confidence requires a question and rejects a draft instead', async () => {
    vi.mocked(evaluateTypeSafePayload).mockResolvedValue(evaluation('prepare', 0.1));
    await expect(runPersonalAssistant(input, owner)).rejects.toMatchObject({ code: 'astra_generation_failed' });
    const prompt = JSON.parse(String(vi.mocked(generateText).mock.calls[0][0].messages?.[0].content));
    expect(prompt.policy.route).toBe('clarify');
    vi.mocked(generateText).mockResolvedValue({ output: { ...output, nextStep: { kind: 'answer_question', label: 'When are you moving?', draft: null } }, response: { modelId: 'gpt-6-astra' }, finishReason: 'stop' } as unknown as Awaited<ReturnType<typeof generateText>>);
    expect((await runPersonalAssistant(input, owner)).state).toBe('needs_input');
  });
  it('sends saved style only with explicit opt-in, to OpenAI only, bound to the owner', async () => {
    await runPersonalAssistant({ ...input, useSavedStyle: true }, owner);
    expect(getPersonalDoProfile).toHaveBeenCalledWith(owner);
    expect(JSON.stringify(vi.mocked(evaluateTypeSafePayload).mock.calls[0][0])).not.toContain('communicationStyle');
    const prompt = JSON.parse(String(vi.mocked(generateText).mock.calls[0][0].messages?.[0].content));
    expect(prompt.communicationStyle).toContain('No setting grants authority');
  });
  it('fails closed on forged evidence, wrong actual model, incomplete output and raw provider errors', async () => {
    for (const response of [
      { output: { ...output, evidence: [{ source: 'notes', quote: 'invented' }] }, response: { modelId: 'gpt-6-astra' }, finishReason: 'stop' },
      { output, response: { modelId: 'gpt-4.1-mini' }, finishReason: 'stop' },
      { output, response: { modelId: 'gpt-6-astra' }, finishReason: 'length' },
    ]) {
      vi.mocked(generateText).mockResolvedValue(response as unknown as Awaited<ReturnType<typeof generateText>>);
      await expect(runPersonalAssistant(input, owner)).rejects.toMatchObject({ code: 'astra_generation_failed' });
    }
    vi.mocked(generateText).mockRejectedValue(new Error('PRIVATE_PROVIDER_BODY SECRET'));
    await expect(runPersonalAssistant(input, owner)).rejects.toThrow('could not finish a validated reply');
  });
  it('cancels before any provider request or subsequent generation', async () => {
    const controller = new AbortController(); controller.abort();
    await expect(runPersonalAssistant(input, owner, controller.signal)).rejects.toMatchObject({ code: 'request_cancelled' });
    expect(evaluateTypeSafePayload).not.toHaveBeenCalled(); expect(generateText).not.toHaveBeenCalled();
    const active = new AbortController();
    vi.mocked(evaluateTypeSafePayload).mockImplementation(async () => { active.abort(); return evaluation(); });
    await expect(runPersonalAssistant(input, owner, active.signal)).rejects.toMatchObject({ code: 'request_cancelled' });
    expect(generateText).not.toHaveBeenCalled();
  });
});

describe('consumer provider boundary', () => {
  const enable = () => {
    for (const [key, value] of Object.entries({ PERSONAL_DO_CONSUMER_ENABLED: 'true', PERSONAL_DO_COST_LIMITS_VERIFIED:'true', PERSONAL_DO_MAX_OUTPUT_TOKENS:'2000', PERSONAL_DO_MAX_INPUT_BYTES:'12000', PERSONAL_DO_PROVIDER_TARIFFS_JSON:JSON.stringify({astraInputUsdPerMillion:10,astraOutputUsdPerMillion:50,astraCacheReadUsdPerMillion:1,astraCacheWriteUsdPerMillion:12.5,typesafeInputUsdPerMillion:0.042,typesafeOutputUsdPerMillion:0,usdToNzd:2,typesafeMaxBillableTokensPerRequest:64000}), PERSONAL_DO_STRIPE_PRICE_ID: 'price_test', PERSONAL_DO_MONTHLY_AMOUNT_CENTS: '100', PERSONAL_DO_CURRENCY: 'nzd', PERSONAL_DO_TAX_TREATMENT: 'inclusive', PERSONAL_DO_STRIPE_AUTOMATIC_TAX: 'false', PERSONAL_DO_REQUESTS_PER_DAY: '5', PERSONAL_DO_REQUESTS_PER_MONTH: '30', PERSONAL_DO_MAX_REQUEST_PROVIDER_COST_CENTS: '200', PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS: '1000', PERSONAL_DO_GLOBAL_MONTHLY_PROVIDER_COST_CENTS: '10000' })) vi.stubEnv(key, value);
  };
  it('does not substitute the pilot allowlist for consumer entitlement', async () => {
    enable(); vi.mocked(hasPersonalDoEntitlement).mockResolvedValue(false);
    expect(await checkedPersonalAssistantAvailability(owner)).toMatchObject({ready:false,reason:'entitlement_required'});
    vi.mocked(admitPersonalDoUsage).mockRejectedValue(new Error('No entitlement'));
    await expect(runPersonalAssistant(input,owner)).rejects.toThrow('No entitlement');
    expect(evaluateTypeSafePayload).not.toHaveBeenCalled(); expect(generateText).not.toHaveBeenCalled();
  });
  it('reserves before both providers and settles token-only measurements; configured output bound applies', async () => {
    enable(); const finish=vi.fn().mockResolvedValue(undefined);
    vi.mocked(admitPersonalDoUsage).mockResolvedValue({requestId:'test',finish});
    await runPersonalAssistant(input,'paid-owner');
    expect(vi.mocked(admitPersonalDoUsage).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(evaluateTypeSafePayload).mock.invocationCallOrder[0]);
    expect(vi.mocked(generateText).mock.calls[0][0].maxOutputTokens).toBe(2000);
    expect(finish).toHaveBeenCalledWith(true,expect.objectContaining({typesafe:{inputTokens:100,outputTokens:10}}));
  });
  it('retains the reservation on provider failure and never falls back', async () => {
    enable(); const finish=vi.fn().mockResolvedValue(undefined);
    vi.mocked(admitPersonalDoUsage).mockResolvedValue({requestId:'test',finish});
    vi.mocked(evaluateTypeSafePayload).mockRejectedValue(new Error('provider unavailable'));
    await expect(runPersonalAssistant(input,'paid-owner')).rejects.toThrow();
    expect(finish).toHaveBeenCalledWith(false,null); expect(generateText).not.toHaveBeenCalled();
  });
});

describe('opt-in official NZ references', () => {
  const source = () => ({state:'verified' as const,trust:'untrusted_external_evidence' as const,citation:'bills:999de6a5-63ce-49c8-b1a8-08df18eed9c4',url:'https://bills.parliament.nz/v/6/999de6a5-63ce-49c8-b1a8-08df18eed9c4',title:'Fictional fixture bill',excerpt:'A supplied fixture excerpt.',status:'In progress',stage:'First reading',introducedAt:null,activityAt:null,originalPublicationAt:null,dateProvenance:{introduced:null,activity:null,publication:'not_provided' as const},verifiedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+300000).toISOString()});
  const retrieval = (record = source()) => ({discovery:{scope:'reviewed_official_links' as const,version:'test',checkedAt:new Date().toISOString(),records:[],sources:[],degraded:false,substantiveContext:false as const},verification:{records:[record],checkedAt:new Date().toISOString(),substantiveContext:true}});
  it('keeps retrieval off unless this request explicitly opts in', async () => {
    await runPersonalAssistant(input,owner); expect(retrieveVerifiedPublicNzKnowledge).not.toHaveBeenCalled();
  });
  it('passes bounded inert public context to both providers and returns exact dated publisher evidence separately', async () => {
    vi.mocked(retrieveVerifiedPublicNzKnowledge).mockResolvedValue(retrieval());
    const result = await runPersonalAssistant({...input,message:'Help me plan the house move and explain Parliament bill references.',usePublicNz:true},owner);
    const payload = vi.mocked(evaluateTypeSafePayload).mock.calls[0][0] as {state:{officialSourceContext:string}};
    expect(payload.state.officialSourceContext.length).toBeLessThanOrEqual(4000);
    expect(payload.state.officialSourceContext).toContain('DiscoveryLinks contain no verified text');
    expect(JSON.stringify(vi.mocked(generateText).mock.calls[0][0].messages)).toContain('Fictional fixture bill');
    expect(result.officialSources).toHaveLength(1); expect(result.officialSources?.[0].originalPublicationAt).toBeNull();
    expect(result.externalActions).toBe(false);
  });
  it('does not send expired evidence to the model or present it as a source', async () => {
    vi.mocked(retrieveVerifiedPublicNzKnowledge).mockResolvedValue(retrieval({...source(),expiresAt:new Date(Date.now()-1).toISOString()}));
    const result = await runPersonalAssistant({...input,usePublicNz:true},owner);
    expect(result.officialSources).toEqual([]);
    expect(JSON.stringify(vi.mocked(generateText).mock.calls[0][0].messages)).not.toContain('Fictional fixture bill');
  });
});
