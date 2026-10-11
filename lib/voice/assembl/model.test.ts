import { expect,it } from 'vitest';
import { voiceRequestSchema } from './model';
const good={text:'Hello',presets:['warm','clear'],language:'en-NZ',consent:true};
it('accepts original voice designs with explicit permission',()=>{expect(voiceRequestSchema.parse(good).presets).toHaveLength(2);});
it.each([{consent:false},{language:'mi-NZ'},{text:'x'.repeat(301)},{presets:['warm','warm']},{presets:['unknown']},{presets:[]},{voiceId:'celebrity'},{text:'\u0000'}])('rejects invalid or unsupported generation %j',change=>{expect(voiceRequestSchema.safeParse({...good,...change}).success).toBe(false);});
