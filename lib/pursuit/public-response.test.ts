import {describe,it,expect} from 'vitest';
import {readPublicDraftJson,publicFailureCode} from './public-response';
const draft={company:'Example',title:'A proposal with {braces} and "quotes"',evidence:[{claim:'A claim',url:'https://example.com'}]};
describe('public provider response extraction',()=>{
 it('accepts direct JSON and a server-search preamble',()=>{expect(readPublicDraftJson(JSON.stringify(draft))).toEqual(draft);expect(readPublicDraftJson('I will search public sources.\n```json\n'+JSON.stringify(draft)+'\n```')).toEqual(draft);});
 it('does not silently select between competing drafts',()=>{expect(()=>readPublicDraftJson(JSON.stringify(draft)+'\n'+JSON.stringify(draft))).toThrow('research_ambiguous_json');});
 it('rejects incomplete output and bounds work',()=>{expect(()=>readPublicDraftJson('{"company":"Incomplete"')).toThrow('research_invalid_json');expect(()=>readPublicDraftJson('x'.repeat(50001))).toThrow('research_output_too_large');});
 it('does not leak arbitrary exception text in diagnostics',()=>{expect(publicFailureCode(new Error('private provider response'))).toBe('research_unavailable');expect(publicFailureCode(new Error('research_provider_http_401'))).toBe('research_provider_http_401');expect(publicFailureCode(new Error('research_invalid_json'))).toBe('research_invalid_json');});
});
