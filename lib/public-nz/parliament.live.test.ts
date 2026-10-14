import { expect, it } from 'vitest';
import { verifyParliamentBills, verifiedBillContext } from './parliament';
it.skipIf(process.env.PUBLIC_NZ_LIVE_PROOF !== '1')('read-only fixed Parliament endpoint proof (explicit opt-in)', async()=>{
 const started=Date.now();
 const result=await verifyParliamentBills(['999de6a5-63ce-49c8-b1a8-08df18eed9c4']);
 console.info('public_nz_live_proof',JSON.stringify({elapsedMs:Date.now()-started,records:result.records,contextChars:verifiedBillContext(result).length}));
 expect(result.records[0].state).toBe('verified');expect(Date.now()-started).toBeLessThan(2500);
},5000);
