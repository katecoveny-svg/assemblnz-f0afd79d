import {describe,it,expect} from 'vitest';
import {finalSearchText,parseResearchJson} from './public-output';
describe('native search response framing',()=>{
 it('drops only progress before the final search result',()=>{
 const blocks=[{type:'text',text:'I will research this company.'},{type:'server_tool_use',name:'web_search'},{type:'web_search_tool_result',content:[]},{type:'text',text:'{"title":"The draft"}'}];
 expect(parseResearchJson(finalSearchText(blocks))).toEqual({title:'The draft'});
 });
 it('joins citation-split strings without inserting invalid newlines',()=>expect(parseResearchJson(finalSearchText([{type:'text',text:'{"claim":"A source '},{type:'text',text:'with evidence"}']))).toEqual({claim:'A source with evidence'}));
 it('handles prose preamble and JSON fences, but does not invent fields',()=>expect(parseResearchJson('Here is the draft:\n```json\n{"title":"Test"}\n```')).toEqual({title:'Test'}));
 it('handles braces and escaped quotes inside strings',()=>expect(parseResearchJson('{"value":"{ok} and \\"quote\\""}'.replaceAll('\\\\','\\'))).toHaveProperty('value'));
 it('rejects truncation, multiple objects and trailing prose',()=>{for(const text of ['No research available','{"title":','{} {}','{} warning','[{}]'])expect(()=>parseResearchJson(text)).toThrow();});
});
