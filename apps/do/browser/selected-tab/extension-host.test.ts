import { afterEach, describe, expect, it, vi } from 'vitest';
import { SelectedTabExtension, type BrowserPort, type Identity } from './extension-host';
import { selectedTextOffer } from './attachment';
const owner = '00112233-4455-6677-8899-aabbccddeeff';
function fixture() {
  let active = 1, account = owner;
  const docs: Record<number, Identity> = {1:{tabId:1,documentId:'workspace',url:'https://www.assembl.co.nz/do/widget'},2:{tabId:2,documentId:'page',url:'https://example.org/story?private=omitted'}};
  const port: BrowserPort = {active:async()=>({id:active,windowId:1}),identify:async id=>({...docs[id]}),owner:async()=>account,read:vi.fn(async()=>({text:'Selected reference',completeness:'partial'})),show:vi.fn()};
  const host = new SelectedTabExtension(port);
  return {host,port,docs,select:(id:number)=>{active=id;},owner:(id:string)=>{account=id;},async activate(){await host.toolbar({id:1,windowId:1});active=2;await host.toolbar({id:2,windowId:1});}};
}
afterEach(()=>vi.useRealTimers());
describe('actual extension host with controlled browser port',()=>{
  it('requires toolbar activation and verified owner, releases only reviewed selected text',async()=>{
    const f=fixture(); await expect(f.host.capture()).rejects.toThrow(); await f.activate();
    const evidence=await f.host.capture(); expect(evidence.source).toBe('https://example.org'); expect(evidence.completeness).toBe('partial');
    expect(selectedTextOffer(await f.host.attach(),owner)).toContain('Selected reference'); await expect(f.host.attach()).rejects.toThrow(); f.host.invalidate();
  });
  it.each(['owner','document','tab','navigation'] as const)('rejects %s change before attachment',async change=>{
    const f=fixture();await f.activate();await f.host.capture();
    if(change==='owner')f.owner('other');if(change==='document')f.docs[2].documentId='replacement';if(change==='tab')f.select(1);if(change==='navigation')f.docs[2].url='https://example.org/other';
    await expect(f.host.attach()).rejects.toThrow();f.host.invalidate();
  });
  it('drops late capture after cancellation',async()=>{
    const f=fixture();await f.activate(); let resolve!:(v:unknown)=>void;
    f.port.read=()=>new Promise(r=>{resolve=r;});const capture=f.host.capture();
    await vi.waitFor(()=>expect(resolve).toBeTypeOf('function'));f.host.invalidate();resolve({text:'late',completeness:'partial'});await expect(capture).rejects.toThrow();
  });
  it('expires grants and refuses stale attachment',async()=>{
    vi.useFakeTimers();const f=fixture();await f.activate();await f.host.capture();await vi.advanceTimersByTimeAsync(60001);await expect(f.host.attach()).rejects.toThrow();
  });
  it('requires visible status and rejects extra adapter fields',async()=>{
    const f=fixture();await f.activate();f.port.read=async()=>({text:'reference',completeness:'partial',cookie:'bad'});await expect(f.host.capture()).rejects.toThrow();
    f.port.show=()=>{throw Error('closed');};await expect(f.host.toolbar({id:2,windowId:1})).rejects.toThrow();
  });
  it('offer rejects another owner, future/stale time and unsanitized URL',async()=>{
    const f=fixture();await f.activate();const e=await f.host.capture();
    expect(selectedTextOffer(e,'other')).toBeNull();expect(selectedTextOffer(e,owner,e.observedAt+60001)).toBeNull();expect(selectedTextOffer(e,owner,e.observedAt-1)).toBeNull();expect(selectedTextOffer({...e,source:'https://example.org/private'},owner)).toBeNull();f.host.invalidate();
  });
});
describe('visible image snapshot',()=>{
  it('uses the same owner/document/expiry guard and separate evidence kind',async()=>{
    const f=fixture();const imageHost=new SelectedTabExtension(f.port,Date.now,'image');
    f.port.read=vi.fn(async(_target,format)=>{expect(format).toBe('image');return {image:'data:image/jpeg;base64,YQ==',completeness:'partial'};});
    await imageHost.toolbar({id:1,windowId:1});f.select(2);await imageHost.toolbar({id:2,windowId:1});
    expect((await imageHost.capture()).adapter).toBe('visible-page-image.v1');f.docs[2].documentId='new';await expect(imageHost.attach()).rejects.toThrow();imageHost.invalidate();
  });
});
