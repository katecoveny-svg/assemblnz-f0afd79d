import {describe,it,expect} from 'vitest';
import {TrialInput,PublicSourceError,containsCredential,parseGroundedDraft,safeSourceUrl} from './public-contract';
import {searchPublicKnowledge,PUBLIC_KNOWLEDGE} from './public-knowledge';
const sample={company:'Example company',title:'A useful opportunity',summary:'A source-based brief for human review.',evidence:[{claim:'This page describes the company service.',url:'https://example.com/'}],opportunity:'A proposed service improvement to validate.',proposedWork:'Prepare a small demonstrator for review.',deliverables:['A source-linked brief','An independent demonstrator'],nextSteps:['Review the sources','Ask about the customer need'],unknowns:['Budget has not been established.']};
describe('public pursuit boundaries',()=>{
 it('requires explicit public-research consent',()=>{expect(TrialInput.safeParse({requestId:'72b1797b-420a-4c56-a6bf-cf74832c948e',company:'Example',goal:'Research a customer journey',consent:false}).success).toBe(false);});
 it('rejects credential-like input',()=>expect(containsCredential('api_key=1234567890123456')).toBe(true));
 it('only accepts citations returned by the search',()=>{expect(()=>parseGroundedDraft(sample,[])).toThrow('untraced_source');expect(parseGroundedDraft(sample,[{url:'https://example.com/',title:'Example',retrievedAt:'2026-09-18'}]).title).toBe(sample.title);});
 it('rejects dangerous or local source links',()=>{for(const url of ['javascript:alert(1)','http://example.com','https://127.0.0.1/','https://user:pw@example.com/','https://local/'])expect(safeSourceUrl(url)).toBeNull();});
 it('searches only the owned public collection',()=>{const found=searchPublicKnowledge('studio demonstrator pitch');expect(found.length).toBeGreaterThan(0);expect(found[0].scope).toBe('owned_public');expect(PUBLIC_KNOWLEDGE.every(r=>r.url.startsWith('https://www.assembl.co.nz/'))).toBe(true);});
});

describe('general draft provenance diagnostics',()=>{
 it('rejects canonical URL drift without guessing source equivalence',()=>{
  for(const url of ['https://www.example.com/','https://example.com/about','https://example.com/?date=2026-10-01']){
   expect(()=>parseGroundedDraft({...sample,evidence:[{...sample.evidence[0],url}]},[{url:'https://example.com/',title:'Example',retrievedAt:'2026-10-01'}])).toThrow('untraced_source');
  }
 });
 it('retains source association and reports only field/index/category',()=>{
  const value={...sample,evidence:[sample.evidence[0],{claim:'Unsupported second factual statement.',url:'https://private-example.com/private'}]};
  try{parseGroundedDraft(value,[{url:'https://example.com/',title:'Example',retrievedAt:'2026-10-01'}]);throw new Error('expected rejection');}catch(error){
   expect(error).toBeInstanceOf(PublicSourceError);
   expect(error).toMatchObject({message:'untraced_source',field:'draft.evidence.url',index:1,category:'not_returned'});
   expect(JSON.stringify(error)).not.toContain('private-example');
  }
 });
 it('does not grant citation permission to published capability context',()=>{
  expect(()=>parseGroundedDraft({...sample,evidence:[{...sample.evidence[0],url:PUBLIC_KNOWLEDGE[0].url}]},[])).toThrow('untraced_source');
 });
 it('accepts fragment normalization without changing source identity',()=>{
  expect(parseGroundedDraft({...sample,evidence:[{...sample.evidence[0],url:'https://example.com/#section'}]},[{url:'https://example.com/',title:'Example',retrievedAt:'2026-10-01'}]).evidence[0].url).toBe('https://example.com/');
 });
});
