import {describe,it,expect,vi} from 'vitest';
import {formatPublicDraft,PUBLIC_DRAFT_SCHEMA,sourcePreservingOutreachSchema} from './public-format';
const draft={company:'Example company',title:'A specific opportunity',summary:'A public-source proposal for a customer journey.',evidence:[{claim:'The official source describes a customer service.',url:'https://example.com/'}],opportunity:'Propose testing the next customer step in a small demonstration.',proposedWork:'Prepare a source-linked brief and prototype for review.',deliverables:['An opportunity brief','A demonstration'],nextSteps:['Review the evidence','Check the proposed need'],unknowns:['Demand and budget are unknown.']};
const sources=[{url:'https://example.com/',title:'Test',retrievedAt:'2026-09-18'}];
describe('formatting-only repair',()=>{
 it('constrains required and nullable outreach URL fields to exact original strings',()=>{
  const original = {draft, campaign:{seller:{website:'https://seller.example.com/path?version=1'},prospects:[{website:'https://buyer.example.com/',signal:{url:'https://buyer.example.com/news'},contactUrl:null}]}};
  const schema = sourcePreservingOutreachSchema(original) as any;
  const expected = ['https://example.com/','https://seller.example.com/path?version=1','https://buyer.example.com/','https://buyer.example.com/news'];
  expect(schema.properties.draft.properties.evidence.items.properties.url.enum).toEqual(expected);
  expect(schema.properties.campaign.properties.seller.properties.website.enum).toEqual(expected);
  const prospect = schema.properties.campaign.properties.prospects.items.properties;
  expect(prospect.signal.properties.url.enum).toEqual(expected);
  expect(prospect.contactUrl.anyOf.find((entry:any)=>entry.type==='string').enum).toEqual(expected);
  expect(prospect.contactUrl.anyOf.some((entry:any)=>entry.type==='null')).toBe(true);
  expect(prospect.company.enum).toBeUndefined();
 });
 it('fails closed when the original response contains no URL',()=>{
  expect(()=>sourcePreservingOutreachSchema({draft:{summary:'No sources'}})).toThrow('untraced_source');
 });
 it('does not leak URL constraints between requests',()=>{
  sourcePreservingOutreachSchema({url:'https://first.example.com/'});
  const schema = sourcePreservingOutreachSchema({url:'https://second.example.com/'}) as any;
  expect(schema.properties.draft.properties.evidence.items.properties.url.enum).toEqual(['https://second.example.com/']);
 });
 it('uses structured output without web tools and retains original validation',async()=>{const fetcher=vi.fn(async(_url:unknown,init?:RequestInit)=>{const body=JSON.parse(String(init?.body));expect(body.tools).toBeUndefined();expect(body.output_config.format.schema).toEqual(PUBLIC_DRAFT_SCHEMA);expect(body.max_tokens).toBe(2000);return Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(draft)}],usage:{input_tokens:12,output_tokens:20}});});const out=await formatPublicDraft({...draft,summary:'x'.repeat(500)},sources,'test','not-a-real-key',fetcher as typeof fetch);expect(out.draft).toEqual(draft);expect(fetcher).toHaveBeenCalledTimes(1);});
 it('does not waive local length limits for structured replies',async()=>{const fetcher=vi.fn(async()=>Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify({...draft,title:'x'.repeat(101)})}]}));await expect(formatPublicDraft(draft,sources,'test','test',fetcher as typeof fetch)).rejects.toThrow();});
 it('does not accept a new source introduced by the editor',async()=>{const fetcher=vi.fn(async()=>Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify({...draft,evidence:[{...draft.evidence[0],url:'https://other.example/'}]})}]}));await expect(formatPublicDraft(draft,[...sources,{url:'https://other.example/',title:'Other',retrievedAt:'2026-09-18'}],'test','test',fetcher as typeof fetch)).rejects.toThrow('untraced_source');});
});
