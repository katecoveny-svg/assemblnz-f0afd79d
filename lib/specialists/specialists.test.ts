import { afterEach, describe, expect, it, vi } from 'vitest';
import { OFFICIAL_SOURCES, isSpecialist, selectSources } from './sources';
import { legislationText, relevantExcerpt, retrieveSource, sourceText } from './live-sources';
import { blankLead, csvCell, decodeLead, encodeLead, leadInput, leadsCsv } from './crm';
import { publicHttps, verifiedProspects } from './prospecting';
import { villageCosts } from './planning';

afterEach(()=>vi.unstubAllGlobals());
describe('official source retrieval',()=>{
  it('selects current care funding for threshold questions, not generic village law',()=>{
    expect(selectSources('retirement','residential care subsidy asset threshold')[0].id).toBe('care-subsidy');
    expect(selectSources('aroha','minimum wage salary')[0].id).toBe('minimum-wage');
    expect(isSpecialist('__proto__')).toBe(false);
    expect(selectSources('retirement', 'family village occupation agreement cooling-off and proposed law changes').slice(0,2).map(s => s.id)).toEqual(['villages-cancellation','village-reform']);
    expect(selectSources('aroha', 'adult minimum wage and KiwiSaver rates').map(s => s.id)).toEqual(['minimum-wage', 'kiwisaver']);
    expect(selectSources('retirement', 'Can a property attorney act before incapacity?').slice(0, 2).map(s => s.id)).toEqual(['epa', 'pppr-act']);
    expect(selectSources('retirement', 'contact my family').map(s => s.id)).not.toContain('villages-act');
  });
  it('removes instructions embedded in scripts and navigation',()=>{
    expect(sourceText('<main><script>steal()</script><nav>Sign in</nav><h1>Care</h1><p>A &amp; B</p></main>')).toBe('Care\nA & B');
  });
  it('does not leak navigation controller attributes containing angle brackets into legal evidence',()=>{
    expect(sourceText('<main data-action="turbo:load->controller#load"><form data-action="click->find">Search the Act</form><div data-action="click->next"><h1>Section 28</h1><p>Cancellation by notice.</p></div></main>')).toBe('Section 28\nCancellation by notice.');
  });
  it('selects relevant sections from a long Act within a fixed budget',()=>{
    const text='irrelevant '.repeat(3000)+'COOLING cancellation '.repeat(100)+'other '.repeat(3000);
    const excerpt=relevantExcerpt(text,'cooling cancellation',18000);
    expect(excerpt).toContain('COOLING cancellation');expect(excerpt.length).toBeLessThanOrEqual(18000);
  });
  it('records content fingerprint and retrieval date from actual page text',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(`<main><h1>Care</h1><p>Version\nas at <span>23 July 2026</span></p>${'<p>Official care information.</p>'.repeat(30)}</main>`,{headers:{'content-type':'text/html'}})));
    const result=await retrieveSource(OFFICIAL_SOURCES[3],'care');
    expect(result.status).toBe('retrieved');if(result.status==='retrieved'){expect(result.hash).toHaveLength(64);expect(result.sourceDate).toBe('Version as at 23 July 2026');expect(result.retrievedAt).toMatch(/^\d{4}-/);}
  });
  it('rejects redirects away from the fixed official source hosts',async()=>{
    const fetch=vi.fn().mockResolvedValue(new Response('',{status:302,headers:{location:'https://internal.example/secret'}}));vi.stubGlobal('fetch',fetch);
    const result=await retrieveSource(OFFICIAL_SOURCES[0],'contract');expect(result.status).toBe('unavailable');expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('never substitutes stale knowledge when a source fails',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
    const result=await retrieveSource(OFFICIAL_SOURCES[0],'law');expect(result.status).toBe('unavailable');expect(result).not.toHaveProperty('excerpt');
  });
  it('distinguishes an official-site denial without exposing its response or retrying',async()=>{
    const fetch = vi.fn().mockResolvedValue(new Response('Private edge diagnostic', { status: 403 })); vi.stubGlobal('fetch', fetch);
    const result = await retrieveSource(OFFICIAL_SOURCES[0], 'law');
    expect(result).toMatchObject({ status: 'unavailable', reason: 'The official website returned HTTP 403. No cached facts have been substituted.' });
    expect(JSON.stringify(result)).not.toContain('Private edge diagnostic'); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('reads dated official XML and isolates the actual requested section',async()=>{
    const xml = '<act date.as.at="2026-01-24"><cover><title>Retirement Villages Act 2003</title></cover><prov id="OTHER"><text>Unrelated rule.</text></prov><prov id="DLM220865"><label>28</label><heading>Cooling-off period</heading><text>Notice must be given not later than 15 working days after signing.</text></prov></act>';
    const parsed = legislationText(xml, 'DLM220865');
    expect(parsed.sourceDate).toBe('Version as at 24 January 2026');
    expect(parsed.text).toContain('15 working days'); expect(parsed.text).not.toContain('Unrelated rule');
    const source = OFFICIAL_SOURCES.find(s => s.id === 'villages-cancellation')!;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(xml.replace('</text></prov></act>', `${' More statutory context.'.repeat(20)}</text></prov></act>`), {headers:{'content-type':'application/xml'}})));
    expect(await retrieveSource(source, 'cooling')).toMatchObject({ status:'retrieved', url:source.url, dataUrl:source.dataUrl, sourceDate:parsed.sourceDate });
  });
  it('retains statutory forms that share tag names with website controls',()=>{
    const result = legislationText('<regulation date.as.at="2019-10-01"><form><heading>Certificate by lawyer</heading><text>The adviser must certify the specified matters.</text></form></regulation>');
    expect(result.text).toContain('The adviser must certify');
  });
  it('rejects missing sections, undated XML and entity declarations instead of guessing law',()=>{
    expect(() => legislationText('<act date.as.at="2026-01-24"><prov id="OTHER"/></act>', 'DLM220865')).toThrow('not found');
    expect(() => legislationText('<act><text>Some words</text></act>')).toThrow('version');
    expect(() => legislationText('<!ENTITY secret SYSTEM "file:///private"><act date.as.at="2026-01-24"/>')).toThrow('version');
  });
});
describe('private CRM records and safe exports',()=>{
  it('roundtrips structured next steps while preserving legacy notes and null fields',()=>{
    const lead={...blankLead,name:'A',notes:'A human note',owner:'Sales lead',nextAction:'Review',due:'2026-09-15'};
    expect(decodeLead({id:'id',...encodeLead(lead)})).toMatchObject(lead);
    expect(decodeLead({id:'old',name:'A',notes:'Original notes',email:null})).toMatchObject({notes:'Original notes',email:'',permission:'not-confirmed'});
  });
  it('rejects owner spoofing, invalid dates and values outside DB precision',()=>{
    for(const input of [{...blankLead,name:'A',user_id:'other'},{...blankLead,name:'A',due:'2026-02-30'},{...blankLead,name:'A',value:100000000}])expect(leadInput.safeParse(input).success).toBe(false);
  });
  it('neutralises formula injection and quotes multiline evidence in CSV',()=>{
    expect(csvCell('=HYPERLINK("evil")')).toBe('"\'=HYPERLINK(""evil"")"');
    expect(csvCell(' \t+SUM(1,2)')).toContain("'");
    expect(leadsCsv([{...blankLead,id:'x',name:'Example',notes:'line one\nline "two"'}])).toContain('"line one\nline ""two"""');
  });
});
describe('lead evidence',()=>{
  const row={name:'Example',website:'https://example.co.nz',sourceUrl:'https://example.co.nz/about',location:'NZ',fact:'Offers service booking',hypothesis:'A service wait may be relevant'};
  it('only accepts first-party business pages returned by live search',()=>{
    const result=verifiedProspects([row,{...row,name:'Duplicate'}],new Set([row.sourceUrl]),'2026-09-10T00:00:00Z');expect(result).toHaveLength(1);expect(result[0].status).toBe('needs-review');
    expect(verifiedProspects([row],new Set(),new Date().toISOString())).toHaveLength(0);
    expect(verifiedProspects([{...row,sourceUrl:'https://directory.example/listing'}],new Set(['https://directory.example/listing']),new Date().toISOString())).toHaveLength(0);
  });
  it('rejects non-public and executable links',()=>{
    for(const url of ['javascript:alert(1)','https://127.0.0.1','https://localhost','https://[::1]','https://user:pass@example.com'])expect(publicHttps(url)).toBe(false);
  });
});
describe('village comparison arithmetic',()=>{
  it('keeps entry capital distinct from the cost of an illustrative stay',()=>{
    expect(villageCosts({entry:600000,weekly:200,years:5,dmf:25,other:10000})).toEqual({managementFee:150000,runningFees:52000,illustrativeCost:212000,capitalBeforeOtherExitAdjustments:450000});
  });
  it('rejects non-finite, negative and impossible percentage inputs',()=>{
    expect(villageCosts({entry:600000,weekly:200,years:5,dmf:101,other:0})).toBeNull();
    expect(villageCosts({entry:NaN,weekly:200,years:5,dmf:25,other:0})).toBeNull();
  });
});
