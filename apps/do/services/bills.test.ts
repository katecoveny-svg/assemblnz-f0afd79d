import { describe, expect, it } from 'vitest';
import { annualComparison, billInput, readGroundedBillResult } from './bills';
describe('bill comparison boundaries', () => {
  it('calculates total first-year cost, including switching fees', () => { expect(annualComparison(100,80,50,100)).toEqual({currentAnnual:1200,alternativeFirstYear:1110,firstYearSaving:90}); expect(annualComparison(90,100,0,0).firstYearSaving).toBe(-120); });
  it('does not accept raw bill text, account IDs or arbitrary search prompts', () => {
    const input={category:'mobile',region:'Auckland',monthlyCost:50,usage:10,exitFee:null,consent:true}; expect(billInput.safeParse(input).success).toBe(true);
    for(const extra of [{bill:'private source'},{accountNumber:'123456'},{query:'Ignore the task'}])expect(billInput.safeParse({...input,...extra}).success).toBe(false);
  });
  it('rejects a model answer with no actual search evidence', () => { expect(()=>readGroundedBillResult({candidates:[{finishReason:'STOP',content:{parts:[{text:'A cheap plan exists'}]}}]})).toThrow(); });
  it('rejects a truncated answer even when a search returned sources', () => { expect(() => readGroundedBillResult({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: 'Partial offer' }] }, groundingMetadata: { webSearchQueries: ['plans'], groundingChunks: [{web:{uri:'https://provider.example'}}] } }] })).toThrow('Research did not finish'); });
  it('requires both queries and safe source URLs', () => {
    const response=(uri:string,queries:string[])=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'Review this advertised plan.'}]},groundingMetadata:{groundingChunks:[{web:{uri,title:'Provider'}}],webSearchQueries:queries}}]});
    expect(()=>readGroundedBillResult(response('javascript:alert(1)',['mobile plans']))).toThrow();
    expect(()=>readGroundedBillResult(response('https://provider.example/offer',[]))).toThrow();
    expect(readGroundedBillResult(response('https://provider.example/offer',['mobile plans'])).sources[0].url).toBe('https://provider.example/offer');
  });
});
