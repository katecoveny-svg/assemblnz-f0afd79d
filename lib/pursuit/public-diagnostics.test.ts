import {describe,it,expect} from 'vitest';
import {PublicResearchProviderError,publicFailureCode} from './public-diagnostics';
describe('public research safe diagnostics',()=>{
 it('records HTTP status without provider payloads',()=>{expect(publicFailureCode(new PublicResearchProviderError(401))).toBe('provider_http_401');expect(publicFailureCode(new PublicResearchProviderError(999))).toBe('research_provider_unavailable');});
 it('does not leak raw errors, prompts or keys',()=>{expect(publicFailureCode(new Error('api_key=SECRET; private prompt'))).toBe('research_failed');expect(publicFailureCode({message:'secret'})).toBe('research_failed');});
 it('distinguishes safe validation and timeout categories',()=>{expect(publicFailureCode(new SyntaxError('raw model output'))).toBe('draft_json_invalid');const e=new Error('private data');e.name='ZodError';expect(publicFailureCode(e)).toBe('draft_schema_invalid');e.name='TimeoutError';expect(publicFailureCode(e)).toBe('research_timeout');});
});
