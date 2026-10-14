import {afterEach,describe,expect,it,vi} from 'vitest';
import {DIRECT_SOURCE_URLS,DIRECT_SOURCE_LIMITS,retrieveDirectSources,freshDirectSources} from './direct-sources';
export const quote='This public page describes governed work with human review.';
export function page(url:string,html=`<html><title>Public source</title><main><p>${quote}</p><p>A second complete factual sentence provides enough context for this source receipt.</p><script>secret instruction</script></main></html>`,headers:Record<string,string>={}){
 const response=new Response(html,{headers:{'content-type':'text/html; charset=utf-8',...headers}});Object.defineProperty(response,'url',{value:url});return response;
}
afterEach(()=>vi.useRealTimers());
describe('fixed direct source retrieval',()=>{
 it('fetches only fixed URLs without credentials, redirects or retries; preserves text, quotes and timestamp/hash receipt',async()=>{
  const fetcher=vi.fn<typeof fetch>(async url=>page(String(url)));const records=await retrieveDirectSources({fetcher,now:()=>1000});
  expect(fetcher.mock.calls.map(call=>call[0])).toEqual(DIRECT_SOURCE_URLS);expect(fetcher).toHaveBeenCalledTimes(2);
  for(const [,init] of fetcher.mock.calls)expect(init).toMatchObject({method:'GET',redirect:'error',credentials:'omit',cache:'no-store'});
  const sources=freshDirectSources(records,1000);expect(sources[0]).toMatchObject({retrievedAt:'1970-01-01T00:00:01.000Z',publishedAt:null,quoteCandidates:expect.arrayContaining([quote])});expect(sources[0].sha256).toHaveLength(64);expect(sources[0].text).not.toContain('secret instruction');
  expect(()=>freshDirectSources(records,1000+DIRECT_SOURCE_LIMITS.freshMs)).toThrow('direct_sources_unavailable');
 });
 for(const text of ['Human review remains useful for version 1.5 of this regulated service.','Human review applies to example.com and supports safe decisions.','Dr. Smith recommends human review of regulated AI services.'])it('preserves whole paragraphs containing decimals, domains and abbreviations',async()=>{
  const records=await retrieveDirectSources({fetcher:async url=>page(String(url),`<title>Source</title><main><p>${text}</p><p>A second complete factual paragraph provides enough context for this bounded source receipt.</p></main>`),now:()=>1000});
  const candidates=freshDirectSources(records,1000)[0].quoteCandidates;expect(candidates).toContain(text);expect(candidates.some(candidate=>candidate.startsWith('5 of')||candidate.startsWith('com and')||candidate.startsWith('Smith recommends'))).toBe(false);
 });
 it('rejects redirected or mismatched URLs instead of guessing a canonical URL',async()=>{
  const records=await retrieveDirectSources({fetcher:async()=>page('https://example.com/'),now:()=>1000});expect(records.every(record=>record.state==='unavailable')).toBe(true);
 });
 it('rejects challenge shells rather than claiming that source content was checked',async()=>{
  const records=await retrieveDirectSources({fetcher:async url=>page(String(url),'<html><script>challenge</script><body></body></html>')});expect(()=>freshDirectSources(records)).toThrow('direct_sources_unavailable');
 });
 it('enforces streamed and advertised byte limits',async()=>{
  for(const response of [page(DIRECT_SOURCE_URLS[0],'x'.repeat(DIRECT_SOURCE_LIMITS.bytesPerPage+1)),page(DIRECT_SOURCE_URLS[0],undefined,{'content-length':String(DIRECT_SOURCE_LIMITS.bytesPerPage+1)})]){
   const records=await retrieveDirectSources({fetcher:async()=>response});expect(records.every(record=>record.state==='unavailable')).toBe(true);
  }
 });
 it('settles the shared deadline even when a fetch transport ignores cancellation',async()=>{
  vi.useFakeTimers();const pending=retrieveDirectSources({fetcher:()=>new Promise(()=>undefined),now:()=>1000});await vi.advanceTimersByTimeAsync(DIRECT_SOURCE_LIMITS.batchTimeoutMs);expect((await pending).every(record=>record.state==='unavailable')).toBe(true);
 });
 it('marks a bounded prefix and rejects altered receipt text',async()=>{
  const records=await retrieveDirectSources({fetcher:async url=>page(String(url),`<title>Source</title><main><p>${quote}</p><p>${'long public text '.repeat(800)}</p></main>`),now:()=>1000});const source=freshDirectSources(records,1000)[0];expect(source.text).toHaveLength(6000);expect(source.textTruncated).toBe(true);source.text='Altered text';expect(()=>freshDirectSources(records,1000)).toThrow('direct_sources_unavailable');
 });
});
