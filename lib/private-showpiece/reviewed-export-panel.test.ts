import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {describe,it,expect} from 'vitest';
// Actual TSX module with controlled hook/JSX scheduler; not native DOM/Next proof.
const source=readFileSync('components/private-showpiece/ReviewedExport.tsx','utf8');
function fixture(){
 const slots:any[]=[],effects:any[]=[];let cursor=0,changed=false,tree:any;
 const state={hub:{sources:[{include:true}]},scope:{workspaceKey:'fresh:A',epoch:1,revision:0},busy:false};
 const React={useState:(initial:any)=>{const i=cursor++;if(!slots[i])slots[i]={value:typeof initial==='function'?initial():initial};return [slots[i].value,(value:any)=>{slots[i].value=value;changed=true;}];},useRef:(initial:any)=>{const i=cursor++;if(!slots[i])slots[i]={current:initial};return slots[i];},useCallback:(fn:any)=>{const i=cursor++;if(!slots[i])slots[i]={fn};return slots[i].fn;},useLayoutEffect:(fn:any,deps:any[])=>{const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j])){effects.push(()=>{old?.cleanup?.();slots[i]={deps,cleanup:fn()};});}}};
 const loaded={exports:{} as any};const jsx=(type:any,props:any)=>({type,props});
 runInNewContext(ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:loaded,exports:loaded.exports,require:(name:string)=>name==='react'?React:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name.includes('reviewed-export')?{reviewedExportMaxBytes:60000,previewReviewedExport:async()=>({content:'Fictional draft bytes',bytes:21,bytesFingerprint:'fake',filename:'draft.txt'}),admitReviewedExport:async()=>{throw Error('No download in these fixtures');}}:{},JSON,Blob,TextEncoder,URL,setTimeout});
 function render(){do{changed=false;cursor=0;tree=loaded.exports.default(state);}while(changed);while(effects.length)effects.shift()();return tree;}
 function find(predicate:(node:any)=>boolean){let result:any;function walk(node:any){if(!node||typeof node!=='object')return;if(predicate(node))result=node;const c=node.props?.children;(Array.isArray(c)?c:[c]).flat(Infinity).forEach(walk);}walk(tree);return result;}
 function label(name:string){return find(n=>n.props?.['aria-label']===name);}
 function button(text:string){return find(n=>n.type==='button'&&n.props.children===text);}
 async function prepare(){await button('Preview exact draft bytes').props.onClick();render();}
 function review(){label('I reviewed these exact bytes for this audience').props.onChange({target:{checked:true}});render();}
 render();return {state,render,label,button,prepare,review};
}
describe('actual reviewed-export panel invalidation',()=>{
 it('does not resurrect a reviewed preview after source selection changes and returns to the same content',async()=>{const f=fixture();await f.prepare();f.review();expect(f.button('Download reviewed draft').props.disabled).toBe(false);f.state.hub={sources:[{include:false}]};f.render();expect(f.label('Exact draft bytes')).toBeUndefined();f.state.hub={sources:[{include:true}]};f.render();expect(f.label('Exact draft bytes')).toBeUndefined();await f.prepare();expect(f.label('I reviewed these exact bytes for this audience').props.checked).toBe(false);});
 it('does not resurrect review when leaving and returning to the same workspace/revision',async()=>{const f=fixture();await f.prepare();f.review();f.state.scope={workspaceKey:'fresh:B',epoch:1,revision:0};f.render();f.state.scope={workspaceKey:'fresh:A',epoch:1,revision:0};f.render();expect(f.label('Exact draft bytes')).toBeUndefined();await f.prepare();expect(f.button('Download reviewed draft').props.disabled).toBe(true);});
});
