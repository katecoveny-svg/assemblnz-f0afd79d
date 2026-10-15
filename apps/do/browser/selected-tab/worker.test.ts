import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import * as DoSelectedTab from './extension-host';
function fixture(){
  const event=()=>({listeners:[] as any[],addListener(fn:any){this.listeners.push(fn);},fire(...args:any[]){return Promise.all(this.listeners.map(fn=>fn(...args)));}});
  let active=1;const docs:any={1:{id:1,windowId:1,url:'https://www.assembl.co.nz/do/widget',documentId:'workspace'},2:{id:2,windowId:1,url:'https://example.org/path',documentId:'target'}};
  const chrome:any={action:{onClicked:event()},sidePanel:{open:vi.fn(async()=>{})},runtime:{id:'a'.repeat(32),getURL:(p:string)=>`chrome-extension://${'a'.repeat(32)}/${p}`,onConnect:event()},tabs:{query:vi.fn(async(q:any)=>{expect(q).toEqual({active:true,lastFocusedWindow:true});return [docs[active]];}),get:vi.fn(async(id:number)=>docs[id]),captureVisibleTab:vi.fn(async()=> 'data:image/jpeg;base64,YQ=='),onActivated:event(),onUpdated:event(),onRemoved:event()},windows:{onFocusChanged:event()},scripting:{executeScript:vi.fn(async(request:any)=>{const doc=docs[request.target.tabId];return [{frameId:0,documentId:doc.documentId,result:request.func.name==='workspaceOwner'?'00112233-4455-6677-8899-aabbccddeeff':request.func.name==='documentUrl'?doc.url:{text:'selected reference',completeness:'partial'}}];})}};
  runInNewContext(readFileSync('apps/do/extension/selected-tab/worker.js','utf8'),{chrome,DoSelectedTab,importScripts:vi.fn(),Date});
  const messages:any[]=[];const port:any={name:'do-selected-tab',sender:{id:chrome.runtime.id,url:chrome.runtime.getURL('panel.html')},onMessage:event(),onDisconnect:event(),postMessage:(m:any)=>messages.push(m),disconnect:vi.fn()};
  return {chrome,port,messages,select:(id:number)=>{active=id;},async activate(id:number){active=id;await chrome.action.onClicked.fire(docs[id]);await vi.waitFor(()=>expect(messages.at(-1)?.status?.message).toMatch(id===1?/account connected/:/access active/));}};
}
describe('actual extension worker with browser API fixtures',()=>{
  it('binds browser toolbar to selected image capture; panel cannot mint access',async()=>{
    const f=fixture();await f.chrome.runtime.onConnect.fire(f.port);await f.port.onMessage.fire({type:'activate'});expect(f.chrome.scripting.executeScript).not.toHaveBeenCalled();
    await f.activate(1);await f.activate(2);await f.port.onMessage.fire({type:'capture-image'});expect(f.chrome.tabs.captureVisibleTab).toHaveBeenCalledWith(1,{format:'jpeg',quality:80});
    expect(f.messages.at(-1).evidence.adapter).toBe('visible-page-image.v1');await f.port.onMessage.fire({type:'attach-image'});expect(f.messages.at(-1).type).toBe('attachment');await f.chrome.tabs.onActivated.fire({tabId:1});await f.port.onMessage.fire({type:'capture-image'});expect(f.chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(1);await f.port.onDisconnect.fire();
  });
  it.each(['cancel', 'switch-tab'] as const)('does not invoke image capture after %s during native lookup',async interruption=>{
    const f=fixture();await f.chrome.runtime.onConnect.fire(f.port);await f.activate(1);await f.activate(2);
    const original=f.chrome.tabs.get.getMockImplementation();
    let release!:()=>void;let entered!:()=>void;
    const paused=new Promise<void>(resolve=>{entered=resolve;});
    // Two reader guards identify the document before the image adapter lookup.
    f.chrome.tabs.get.mockImplementationOnce(original).mockImplementationOnce(original).mockImplementationOnce(async(id:number)=>{
      entered();await new Promise<void>(resolve=>{release=resolve;});return original(id);
    });
    const reading=f.port.onMessage.fire({type:'capture-image'});await paused;
    if(interruption==='cancel')await f.port.onMessage.fire({type:'cancel'});
    else f.select(1); // Event delivery may lag behind the native active-tab change.
    release();await reading;
    expect(f.chrome.tabs.captureVisibleTab).not.toHaveBeenCalled();
    expect(f.messages.some((message:any)=>message.type==='evidence')).toBe(false);
    await f.port.onDisconnect.fire();
  });
  it('rejects page ports and preserves the existing permission footprint',async()=>{
    const f=fixture();f.port.sender.url='https://example.org';await f.chrome.runtime.onConnect.fire(f.port);expect(f.port.disconnect).toHaveBeenCalled();
    const candidate=JSON.parse(readFileSync('docs/reviews/do-companion-local/selected-tab-extension/manifest.json','utf8'));const pilot=JSON.parse(readFileSync('apps/do/extension/pilot/manifest.json','utf8'));expect(candidate.permissions).toEqual(pilot.permissions);expect(candidate.host_permissions).toEqual(pilot.host_permissions);
  });
});
