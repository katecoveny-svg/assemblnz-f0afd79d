import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('@/lib/public-nz/server',()=>({retrieveVerifiedPublicNzKnowledge:vi.fn(async()=>null)}));
vi.mock('@/lib/typesafe/transport',()=>({evaluateTypeSafe:vi.fn()}));
import {runPublicResearch} from './public-research';
import {createPublicTestAdmission} from './public-cost-admission';
import {PublicSourceError} from './public-contract';
const draft={company:'assembl',title:'A public source proposal',summary:'An independent source-based brief for human review.',evidence:[{claim:'This source describes a public company service.',url:'https://example.com/service?version=1'}],opportunity:'Propose a service explanation to validate with the company.',proposedWork:'Prepare a small independent demonstrator for review.',deliverables:['Source brief','Small demonstrator'],nextSteps:['Review sources','Ask about demand'],unknowns:['Budget and buying intent are unknown.']};
const input={requestId:'00000000-0000-4000-8000-000000000001',company:'assembl.co.nz',goal:'Research one useful consultancy proposal from public sources.',consent:true as const,useTypeSafe:false};
function provider(value:unknown){return vi.fn<typeof fetch>(async()=>Response.json({content:[{type:'server_tool_use',name:'web_search'},{type:'web_search_tool_result',content:[{type:'web_search_result',url:draft.evidence[0].url,title:'Returned source'}]},{type:'text',text:JSON.stringify(value)}],stop_reason:'end_turn',usage:{input_tokens:10,output_tokens:20}}));}
beforeEach(()=>{vi.stubEnv('ANTHROPIC_API_KEY','test-only');});
describe('general research source validation stage',()=>{
 it('rejects a schema-valid guessed homepage after one call without formatting or another search',async()=>{
  const fetcher=provider({...draft,evidence:[{...draft.evidence[0],url:'https://example.com/'}]});
  await expect(runPublicResearch(input,false,fetcher)).rejects.toMatchObject({message:'untraced_source',field:'draft.evidence.url',index:0,category:'not_returned'});
  expect(fetcher).toHaveBeenCalledTimes(1);
  const body=JSON.parse(fetcher.mock.calls[0][1]!.body as string);
  expect(body.tools[0].max_uses).toBe(3);expect(body.max_tokens).toBe(2400);
  expect(body.system).toContain('its URLs are not citation permission');
 });
 it('retains the exact returned path and meaningful query in validated output',async()=>{
  const fetcher=provider(draft);const result=await runPublicResearch(input,false,fetcher);
  expect(result.draft.evidence[0].url).toBe(draft.evidence[0].url);
  expect(result.trace.sources[0].url).toBe(draft.evidence[0].url);
  expect(result.trace).toMatchObject({providerCalls:1,webSearches:1});expect(fetcher).toHaveBeenCalledTimes(1);
 });
 it('keeps rejected model content outside diagnostic properties',()=>{
  expect(JSON.parse(JSON.stringify(new PublicSourceError(0,'not_returned')))).toEqual({index:0,category:'not_returned',field:'draft.evidence.url',name:'PublicSourceError'});
 });
});

it('approved one-dollar admission blocks current managed search before any billable fetch',async()=>{
 const paid=vi.fn<typeof fetch>();const admission=createPublicTestAdmission(1,paid);
 await expect(runPublicResearch(input,false,admission.fetcher)).rejects.toThrow('research_search_cost_bound_unverified');
 expect(paid).not.toHaveBeenCalled();expect(admission.receipt().calls).toBe(0);
});
