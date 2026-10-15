import { afterEach, describe, expect, it, vi } from 'vitest';
import { selectedText } from './dom';
function selectedFixture() {
  const doc: any = {contentType:'text/html',activeElement:null,querySelectorAll:()=>[],createTreeWalker:()=>({nextNode:()=>null})};
  const element: any={closest:()=>null,ownerDocument:doc,parentElement:null,getBoundingClientRect:()=>({top:1,bottom:20,left:1,right:80})};
  const text={nodeType:3,parentElement:element,textContent:'private before / reviewed text / private after'};
  const range={commonAncestorContainer:text,startContainer:text,endContainer:text,startOffset:17,endOffset:30,intersectsNode:()=>true};
  vi.stubGlobal('document',doc);vi.stubGlobal('Node',{TEXT_NODE:3});vi.stubGlobal('NodeFilter',{SHOW_TEXT:4});vi.stubGlobal('innerWidth',800);vi.stubGlobal('innerHeight',600);vi.stubGlobal('getComputedStyle',()=>({display:'block',visibility:'visible',opacity:'1'}));vi.stubGlobal('window',{getSelection:()=>({rangeCount:1,isCollapsed:false,getRangeAt:()=>range})});
  return {doc,element,text,range};
}
afterEach(()=>vi.unstubAllGlobals());
describe('fixed selection reader',()=>{
  it('returns only exact selected offsets, never surrounding text',()=>{selectedFixture();expect(selectedText()).toEqual({text:'reviewed text',completeness:'partial'});});
  it.each(['private','hidden','offscreen','form','nonhtml'] as const)('rejects %s',kind=>{
    const f=selectedFixture();if(kind==='private')f.element.closest=()=>({});if(kind==='hidden')vi.stubGlobal('getComputedStyle',()=>({display:'none'}));if(kind==='offscreen')f.element.getBoundingClientRect=()=>({top:700,bottom:720,left:0,right:20});if(kind==='form')f.doc.activeElement={closest:()=>({})};if(kind==='nonhtml')f.doc.contentType='application/pdf';expect(()=>selectedText()).toThrow();
  });
});
