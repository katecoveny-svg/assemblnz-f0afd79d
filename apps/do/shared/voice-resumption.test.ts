import { describe, expect, it } from 'vitest';
import { VoiceResumption } from './voice-resumption';
describe('bounded same-token voice resumption',()=>{
  const approved = async()=>({resumeAllowed:true,reuseExistingToken:true,expiresAt:100});
  it('requires server approval and a fresh provider handle; consumes once',async()=>{
    const r=new VoiceResumption(100,()=>0);expect(await r.take(approved)).toBeNull();r.update({resumable:true,newHandle:'memory-only'});expect(await r.take(approved)).toBe('memory-only');r.update({resumable:true,newHandle:'memory-only'});expect(await r.take(approved)).toBeNull();
  });
  it.each(['revoked','expired','deadline extension','new token'] as const)('refuses %s',async reason=>{
    let now=0;const r=new VoiceResumption(100,()=>now);r.update({resumable:true,newHandle:'handle'});
    const pending=r.take(async()=>{if(reason==='revoked')r.revoke();if(reason==='expired')now=100;return {resumeAllowed:true,reuseExistingToken:reason!=='new token',expiresAt:reason==='deadline extension'?200:100};});expect(await pending).toBeNull();
  });
  it('respects provider not-resumable and caps repeated connections',async()=>{
    const r=new VoiceResumption(100,()=>0);r.update({resumable:true,newHandle:'h'});r.update({resumable:false});expect(await r.take(approved)).toBeNull();for(let i=0;i<3;i++){r.update({resumable:true,newHandle:String(i)});expect(await r.take(approved)).toBe(i<2?String(i):null);}
  });
});
