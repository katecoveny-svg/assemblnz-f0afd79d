import {describe,it,expect} from 'vitest';
import {TrialInput,containsCredential,parseGroundedDraft,safeSourceUrl} from './public-contract';
import {searchPublicKnowledge,PUBLIC_KNOWLEDGE} from './public-knowledge';
const sample={company:'Example company',title:'A useful opportunity',summary:'A source-based brief for human review.',evidence:[{claim:'This page describes the company service.',url:'https://example.com/'}],opportunity:'A proposed service improvement to validate.',proposedWork:'Prepare a small demonstrator for review.',deliverables:['A source-linked brief','An independent demonstrator'],nextSteps:['Review the sources','Ask about the customer need'],unknowns:['Budget has not been established.']};
describe('public pursuit boundaries',()=>{
 it('requires explicit public-research consent',()=>{expect(TrialInput.safeParse({requestId:'72b1797b-420a-4c56-a6bf-cf74832c948e',company:'Example',goal:'Research a customer journey',consent:false}).success).toBe(false);});
 it('rejects credential-like input',()=>expect(containsCredential('api_key=1234567890123456')).toBe(true));
 it('only accepts citations returned by the search',()=>{expect(()=>parseGroundedDraft(sample,[])).toThrow('untraced_source');expect(parseGroundedDraft(sample,[{url:'https://example.com/',title:'Example',retrievedAt:'2026-09-18'}]).title).toBe(sample.title);});
 it('rejects dangerous or local source links',()=>{for(const url of ['javascript:alert(1)','http://example.com','https://127.0.0.1/','https://user:pw@example.com/','https://local/'])expect(safeSourceUrl(url)).toBeNull();});
 it('searches only the owned public collection',()=>{const found=searchPublicKnowledge('studio demonstrator pitch');expect(found.length).toBeGreaterThan(0);expect(found[0].scope).toBe('owned_public');expect(PUBLIC_KNOWLEDGE.every(r=>r.url.startsWith('https://www.assembl.co.nz/'))).toBe(true);});
});
