import {describe,expect,it,vi} from 'vitest';
import {runDirectSourceBrief,directProviderTransport} from './direct-source-brief';
import {DIRECT_SOURCE_URLS} from './direct-sources';
import {PUBLIC_TEST_MODEL} from './public-cost-admission';
const quote='This public page describes governed work with human review.';
function source(url:string){const response=new Response(`<title>Public source</title><main><p>${quote}</p><p>A second complete factual sentence provides enough context for this source receipt.</p></main>`,{headers:{'content-type':'text/html'}});Object.defineProperty(response,'url',{value:url});return response;}
const draft={company:'assembl',title:'A scoped consultancy proposal',summary:'A proposed independent review of one governed work demonstration.',evidence:DIRECT_SOURCE_URLS.map(url=>({url,claim:quote})),opportunity:'Propose checking how a governed demonstration explains human review.',proposedWork:'Prepare an independent source brief and one small demonstration.',deliverables:['A source-linked brief','One reviewed demonstration'],nextSteps:['Review the source quotations','Validate demand with the company'],unknowns:['Buying intent, demand and budget are not established.']};
function provider(value:unknown){return Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(value)}],usage:{input_tokens:100,output_tokens:100}});}
const sourceFetch:typeof fetch=async url=>source(String(url));
describe('unwired scoped direct-source candidate',()=>{
 it('uses one pinned standard-only no-tool call and reports zero searches with exact sources/quotes and budget',async()=>{
  const inference=vi.fn<typeof fetch>(async()=>provider(draft));const result=await runDirectSourceBrief({requestId:'fixture',sourceFetch,inferenceFetch:inference,now:()=>1000});
  const body=JSON.parse(inference.mock.calls[0][1]!.body as string);expect(body).toMatchObject({model:PUBLIC_TEST_MODEL,service_tier:'standard_only',max_tokens:2400});expect(body.tools).toBeUndefined();expect(body.thinking).toBeUndefined();expect(body.cache_control).toBeUndefined();
  expect(result).toMatchObject({mode:'direct_source_brief',trace:{webSearches:0,providerCalls:1,persisted:false}});expect(result.trace.budget.reservedUpperUsd).toBeCloseTo(.212);expect(result.trace.budget.grossUpperUsd).toBeCloseTo(.2438);expect(result.draft.evidence).toEqual(draft.evidence);expect(result.checkedSources.map(s=>s.url)).toEqual(DIRECT_SOURCE_URLS);
 });
 it('shares one admission across the initial draft and optional length formatter',async()=>{
  const inference=vi.fn<typeof fetch>().mockResolvedValueOnce(provider({...draft,title:'x'.repeat(101)})).mockResolvedValueOnce(provider(draft));const result=await runDirectSourceBrief({requestId:'fixture',sourceFetch,inferenceFetch:inference,now:()=>1000});
  expect(result.trace.providerCalls).toBe(2);expect(result.trace.budget.reservedUpperUsd).toBeCloseTo(.422);expect(result.trace.budget.grossUpperUsd).toBeCloseTo(.4853);expect(JSON.parse(inference.mock.calls[1][1]!.body as string).max_tokens).toBe(2000);
 });
 it('does not infer when any required source is unavailable',async()=>{
  const inference=vi.fn<typeof fetch>();await expect(runDirectSourceBrief({requestId:'fixture',sourceFetch:async()=>new Response('challenge'),inferenceFetch:inference})).rejects.toThrow('direct_sources_unavailable');expect(inference).not.toHaveBeenCalled();
 });
 for(const value of [{...draft,evidence:[{...draft.evidence[0],url:'https://www.assembl.co.nz/?guessed=1'},draft.evidence[1]]},{...draft,evidence:[{...draft.evidence[0],claim:'This unsupported quotation was never returned by the source.'},draft.evidence[1]]}])it('rejects URL/quote drift without another call',async()=>{
  const inference=vi.fn<typeof fetch>(async()=>provider(value));await expect(runDirectSourceBrief({requestId:'fixture',sourceFetch,inferenceFetch:inference,now:()=>1000})).rejects.toThrow('direct_quote_untraced');expect(inference).toHaveBeenCalledTimes(1);
 });
 it('does not retry transport failures or invoke TypeSafe',async()=>{
  const inference=vi.fn<typeof fetch>(async()=>{throw new Error('network failure');});await expect(runDirectSourceBrief({requestId:'fixture',sourceFetch,inferenceFetch:inference,now:()=>1000})).rejects.toMatchObject({message:'direct_brief_failed',receipt:{stage:'draft',providerCalls:1,webSearches:0,budget:{reservedUpperUsd:expect.closeTo(.212)}}});expect(inference).toHaveBeenCalledTimes(1);
 });
 it('retains both reservations on formatter transport failure without exposing provider content',async()=>{
  const inference=vi.fn<typeof fetch>().mockResolvedValueOnce(provider({...draft,title:'x'.repeat(101)})).mockRejectedValueOnce(new Error('secret provider payload https://private.invalid/token'));
  try{await runDirectSourceBrief({requestId:'fixture',sourceFetch,inferenceFetch:inference,now:()=>1000});throw new Error('expected failure');}catch(error){expect(error).toMatchObject({message:'direct_brief_failed',receipt:{stage:'formatter',providerCalls:2,budget:{reservedUpperUsd:expect.closeTo(.422),grossUpperUsd:expect.closeTo(.4853)}}});expect(JSON.stringify(error)).not.toMatch(/secret|private|token/);}
  expect(inference).toHaveBeenCalledTimes(2);
 });
 it('cannot make a third call if the one permitted formatter remains invalid',async()=>{
  const inference=vi.fn<typeof fetch>(async()=>provider({...draft,title:'x'.repeat(101)}));await expect(runDirectSourceBrief({requestId:'fixture',sourceFetch,inferenceFetch:inference,now:()=>1000})).rejects.toMatchObject({receipt:{stage:'validation',providerCalls:2,budget:{reservedUpperUsd:expect.closeTo(.422)}}});expect(inference).toHaveBeenCalledTimes(2);
 });
});

describe('native existing-key transport',()=>{
 it('adds only the existing server key and performs exactly one native request with redirects forbidden',async()=>{
  vi.stubEnv('ANTHROPIC_API_KEY','fixture-only');const native=vi.fn<typeof fetch>(async()=>new Response('fixture'));const transport=directProviderTransport(native);
  await transport('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  expect(native).toHaveBeenCalledTimes(1);const [url,init]=native.mock.calls[0];expect(url).toBe('https://api.anthropic.com/v1/messages');expect(new Headers(init?.headers).get('x-api-key')).toBe('fixture-only');expect(init).toMatchObject({redirect:'error',credentials:'omit',cache:'no-store'});
  await expect(transport('https://elsewhere.example',{method:'POST',body:'{}'})).rejects.toThrow('direct_inference_protocol');expect(native).toHaveBeenCalledTimes(1);vi.unstubAllEnvs();
 });
});
