import { expect, it } from 'vitest';
import { resolveRememberParam } from './remember';
const outer=(next:string)=>new URL(`https://www.assembl.co.nz/auth/confirm?next=${encodeURIComponent(next)}`);
it('preserves the selected flag inside an older trusted confirmation template',()=>{
 expect(resolveRememberParam(outer('https://www.assembl.co.nz/auth/confirm?next=%2Fdo%2Fwidget&remember=1'))).toBe('1');
 expect(resolveRememberParam(outer('https://www.assembl.co.nz/auth/confirm?next=%2Fdo%2Fwidget&remember=0'))).toBe('0');
});
it('an explicit receiving callback opt-out wins',()=>{
 const url=outer('https://www.assembl.co.nz/auth/confirm?remember=1');url.searchParams.set('remember','0');
 expect(resolveRememberParam(url)).toBe('0');
});
it('does not infer persistence from unknown hosts, ordinary returns or absent consent',()=>{
 for(const next of ['https://attacker.test/auth/confirm?remember=1','https://www.assembl.co.nz/do/widget?remember=1','/do/widget','https://www.assembl.co.nz/auth/confirm'])expect(resolveRememberParam(outer(next))).toBe(null);
});
