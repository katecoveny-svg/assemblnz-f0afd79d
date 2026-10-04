import {describe,expect,it,vi} from 'vitest';
import {readPublicFailureReceipt,createPublicTestAdmission,PUBLIC_TEST_MODEL} from './public-cost-admission';
const url='https://api.anthropic.com/v1/messages';
const body={model:'claude-haiku-4-5',max_tokens:2400,system:'Public-source draft',messages:[{role:'user',content:'A fictional consultancy brief.'}]};
function init(extra:Record<string,unknown>={}){return {method:'POST',body:JSON.stringify({...body,...extra})};}
describe('approved public test cost admission',()=>{
 it('rejects the existing managed search before any paid fetch',async()=>{
  const next=vi.fn<typeof fetch>();const admission=createPublicTestAdmission(1,next);
  await expect(admission.fetcher(url,init({tools:[{type:'web_search_20250305',name:'web_search',max_uses:3}]}))).rejects.toThrow('research_search_cost_bound_unverified');
  expect(next).not.toHaveBeenCalled();expect(admission.receipt().calls).toBe(0);
 });
 it('pins the permitted alias and conservatively admits a bounded no-tool call',async()=>{
  const next=vi.fn<typeof fetch>(async()=>Response.json({}));const admission=createPublicTestAdmission(1,next);
  await admission.fetcher(url,init());expect(JSON.parse(next.mock.calls[0][1]!.body as string)).toMatchObject({model:PUBLIC_TEST_MODEL,service_tier:'standard_only'});
  expect(admission.receipt().reservedUpperUsd).toBeCloseTo(0.212);
 });
 it('rejects an unverified model override without reading or changing credentials',async()=>{
  const next=vi.fn<typeof fetch>();const admission=createPublicTestAdmission(1,next);
  await expect(admission.fetcher(url,init({model:'another-model'}))).rejects.toThrow('research_budget_model');expect(next).not.toHaveBeenCalled();
 });
 it('checks the remaining upper bound before sending a second formatter call',async()=>{
  const next=vi.fn<typeof fetch>(async()=>Response.json({}));const admission=createPublicTestAdmission(0.3,next);
  await admission.fetcher(url,init());await expect(admission.fetcher(url,init({max_tokens:2000}))).rejects.toThrow('research_budget_exceeded');expect(next).toHaveBeenCalledTimes(1);
 });
 it('reserves synchronously and does not refund an aborted or failed call',async()=>{
  const next=vi.fn<typeof fetch>(async()=>{throw new DOMException('Aborted','AbortError');});const admission=createPublicTestAdmission(1,next);
  await expect(admission.fetcher(url,init())).rejects.toThrow('Aborted');await expect(admission.fetcher(url,init())).rejects.toThrow('Aborted');
  await expect(admission.fetcher(url,init())).rejects.toThrow('research_budget_call_limit');expect(next).toHaveBeenCalledTimes(2);
 });
 it('rejects caching, thinking, unknown request fields and excessive output budgets',async()=>{
  const next=vi.fn<typeof fetch>();const admission=createPublicTestAdmission(1,next);
  for(const extra of [{thinking:{type:'enabled'}},{cache_control:{type:'ephemeral'}},{messages:[{role:'user',content:[{type:'text',text:'x',cache_control:{type:'ephemeral'}}]}]}])await expect(admission.fetcher(url,init(extra))).rejects.toThrow('research_budget_protocol');
  await expect(admission.fetcher(url,init({max_tokens:5001}))).rejects.toThrow('research_budget_output');expect(next).not.toHaveBeenCalled();
 });
 it('cannot expand approval beyond one USD',()=>{
  for(const limit of [0,-1,1.01,NaN,Infinity])expect(()=>createPublicTestAdmission(limit,vi.fn())).toThrow('research_budget_invalid');
 });
});

describe('safe terminal receipt reconstruction',()=>{
 const budget={model:PUBLIC_TEST_MODEL,currency:'USD',maxUsd:1/1.15,calls:2,reservedUpperUsd:.422,searchAdmitted:false,assumedTaxRate:.15,grossUpperUsd:.4853};
 const receipt={requestId:'id',stage:'formatter',providerCalls:2,webSearches:0,budget};
 it('returns only known fields and binds the receipt to the same request',()=>{
  expect(readPublicFailureReceipt({...receipt,raw:'private',budget:{...budget,secret:'never return'}},'id')).toEqual(receipt);expect(readPublicFailureReceipt(receipt,'different-id')).toBeUndefined();
 });
 it('rejects altered monetary bounds, model, counts and stage',()=>{
  for(const change of [{reservedUpperUsd:2},{maxUsd:NaN},{grossUpperUsd:.01},{model:'different'},{calls:3}])expect(readPublicFailureReceipt({...receipt,budget:{...budget,...change}},'id')).toBeUndefined();
  expect(readPublicFailureReceipt({...receipt,stage:'https://private.invalid/'},'id')).toBeUndefined();expect(readPublicFailureReceipt({...receipt,providerCalls:1},'id')).toBeUndefined();
 });
});
