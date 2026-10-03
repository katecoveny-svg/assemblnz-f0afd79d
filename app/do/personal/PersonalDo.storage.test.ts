import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {personalStorageReceiptSchema,personalSaveSchema} from '@/apps/do/personal/contract';
const source=readFileSync(new URL('./PersonalDo.tsx',import.meta.url),'utf8');
it('storage controls remain separate from the disabled provider controls',()=>{
 expect(source).toContain('disabled={busy || !state.storage?.available || state.responsibilities.length >= 5}');
 expect(source).toContain('disabled={!consent || busy || saveUncertain || !state?.storage?.available}');
 expect(source).toContain('!state.worker.configured');
 expect(source).toContain('Saved · preparation off.');
 expect(source).not.toContain('Save & start seven days');
});
it('does not accept an interrupted/malformed response as a saved paused responsibility',()=>{
 const id='11111111-1111-4111-8111-111111111111';
 expect(personalStorageReceiptSchema.safeParse({id,saved:true,preparation:'off'}).success).toBe(true);
 for(const receipt of [null,{}, {id}, {id,saved:true,preparation:'scheduled'}])expect(personalStorageReceiptSchema.safeParse(receipt).success).toBe(false);
 expect(source).toContain('if (!(await load()))');
 expect(source).toContain('your editor notes are retained privately');

});
it('requires a reopened revision and separate storage acknowledgement',()=>{
 const input={action:'save',id:'11111111-1111-4111-8111-111111111111',title:'Synthetic responsibility',goal:'Review fictional notes',notes:'Synthetic only',timezone:'Pacific/Auckland',localHour:7,consent:true,expectedRevision:0};
 expect(personalSaveSchema.safeParse(input).success).toBe(true);
 expect(personalSaveSchema.safeParse({...input,id:undefined}).success).toBe(false);
 expect(personalSaveSchema.safeParse({...input,consent:false}).success).toBe(false);
});
