import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const fixture='http://127.0.0.1:4198/cart-fixture.html';
function harness() {
 let action:((tab:unknown)=>void)|undefined,listener:((m:unknown,s:unknown,r:(v:unknown)=>void)=>void)|undefined;
 let grant=false,selected:{id:number;windowId:number;url?:string}={id:17,windowId:8};
 const behavior:unknown[]=[],opens:unknown[]=[];let effects=0;
 class Broker {async companionStatus(){return{connected:false};}}
 const chrome={runtime:{id:'pilot',getURL:(s:string)=>'chrome-extension://pilot/'+s,onMessage:{addListener:(f:typeof listener)=>{listener=f;}}},
 action:{onClicked:{addListener:(f:typeof action)=>{action=f;}}},
 sidePanel:{setPanelBehavior:async(v:unknown)=>{behavior.push(v);},open:async(v:unknown)=>{opens.push(v);}},
 tabs:{query:async(q:{active?:boolean})=>q.active?[{...selected,...(grant?{url:fixture}:{})}]:[{id:19,url:'https://www.assembl.co.nz/do/personal'}],onUpdated:{addListener:()=>{}},onRemoved:{addListener:()=>{}}},
 scripting:{executeScript:async()=>{effects++;throw new Error('No read expected');}}};
 const context=vm.createContext({chrome,Number,globalThis:null,importScripts:()=>{}});context.globalThis=context;
 context.DoTaskConnection={ConnectionBroker:Broker,isFixtureUrl:(s:string)=>s===fixture,isWorkspaceUrl:(s:string)=>s==='https://www.assembl.co.nz/do/personal'};
 vm.runInContext(readFileSync('apps/do/extension/browser-task-worker.js','utf8'),context);
 vm.runInContext(readFileSync('apps/do/extension/pilot/worker.js','utf8'),context);
 return{behavior,opens,get effects(){return effects;},select:(v:typeof selected)=>{selected=v;},click:()=>{grant=true;action?.({...selected,url:fixture});},
 inspect:(sender='chrome-extension://pilot/browser-connection.html')=>new Promise<any>(resolve=>listener!({type:'do:browser-companion',action:'inspect'},{id:'pilot',url:sender},resolve))};
}
it('requires the native action grant, then recognises the exact fixture without reading products',async()=>{
 const h=harness();const before=await h.inspect();expect(before.data.selected).toBeNull();expect(before.data.selectionIssue).toContain('Tab access is unavailable');
 expect(h.behavior).toEqual([{openPanelOnActionClick:false}]);h.click();
 expect(h.opens).toEqual([{windowId:8}]);const after=await h.inspect();expect(after.data.selected).toEqual({id:17,url:fixture});expect(after.data.selectionIssue).toBeNull();expect(h.effects).toBe(0);
});
it('does not treat a sidepanel click or a page sender as a tab grant',async()=>{
 const h=harness();expect((await h.inspect()).data.selected).toBeNull();expect((await h.inspect('https://www.assembl.co.nz/do/personal')).ok).toBe(false);expect(h.opens).toEqual([]);expect(h.effects).toBe(0);
});
it('distinguishes an exact URL mismatch without broadening the allowlist',async()=>{
 const h=harness();h.select({id:17,windowId:8,url:fixture+'?different=1'});const result=await h.inspect();expect(result.data.selected).toBeNull();expect(result.data.selectionIssue).toContain('exact supported');
});
