/* React hooks + browser-resource fixtures. No browser, microphone or provider calls. */
import { writeFileSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const hooks = vi.hoisted(()=>({slots:[] as any[],index:0,effects:[] as (()=>any)[], cleanups:[] as (()=>void)[]}));
vi.mock('react',async()=>{
  const actual=await vi.importActual<any>('react');
  const memo=(fn:any,deps:any[])=>{const i=hooks.index++;const old=hooks.slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))hooks.slots[i]={value:fn,deps};return hooks.slots[i].value;};
  return {...actual,useState:(initial:any)=>{const i=hooks.index++;if(!(i in hooks.slots))hooks.slots[i]=typeof initial==='function'?initial():initial;return [hooks.slots[i],(v:any)=>{hooks.slots[i]=typeof v==='function'?v(hooks.slots[i]):v;}];},useRef:(value:any)=>{const i=hooks.index++;return hooks.slots[i]??(hooks.slots[i]={current:value});},useId:()=> 'fixture',useCallback:memo,useEffect:(fn:any,deps:any[])=>{const i=hooks.index++;const old=hooks.slots[i];if(!old||deps.some((v,j)=>v!==old[j])){hooks.slots[i]=deps;hooks.effects.push(fn);}}};
});
vi.mock('./personal/PersonalDoSettings',()=>({PersonalDoSettings:()=>null}));
vi.mock('@/apps/do/shared/audio-exclusion',()=>({claimDoAudio:()=>()=>{}}));
import { DoCompanionHandoff } from '@/components/do/DoCompanionHandoff';
import { DoGeminiLive } from './DoGeminiLive';
class Socket {
  static OPEN=1; static instances:Socket[]=[];readyState=1;bufferedAmount=0;binaryType='';
  onopen:any;onmessage:any;onclose:any;onerror:any;sent:string[]=[];
  constructor(readonly url:string){Socket.instances.push(this);}
  send(s:string){this.sent.push(s);}close(){this.readyState=3;}
  message(value:any){return this.onmessage?.({data:JSON.stringify(value)});}
}
let track:any, media:any, request:any, mic:any, recorderCount=0;
const listeners:Record<string,()=>void>={};
const revision='a'.repeat(64), leaseId='11111111-1111-4111-8111-111111111111';
const config={responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Kore'}}},systemInstruction:'Frozen style',sessionResumption:{},contextWindowCompression:{slidingWindow:{}}};
let deadline:number;
function render(){hooks.index=0;return DoGeminiLive({onCallStart:vi.fn(),context:'reviewed context'});}
function nodes(tree:any):any[]{if(!tree||typeof tree!=='object')return [];return [tree,...(Array.isArray(tree.props?.children)?tree.props.children:[tree.props?.children]).flatMap((c:any)=>Array.isArray(c)?c.flatMap(nodes):nodes(c))];}
function button(tree:any,label:string){return nodes(tree).find(n=>n.type==='button'&&n.props.children===label);}
async function flush(){for(const effect of hooks.effects.splice(0)){const cleanup=effect();if(cleanup)hooks.cleanups.push(cleanup);}await vi.advanceTimersByTimeAsync(0);}
function preview(name:string, tree:any){
  if(process.env.DO_WRITE_REVIEW_PREVIEW !== '1')return;
  const css=readFileSync('app/do/do-live.css','utf8')+readFileSync('components/do/do-companion-board.css','utf8');
  writeFileSync(`docs/reviews/do-companion-local/${name}.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DO call · local fixture review</title><style>${css}body{max-width:430px;margin:24px auto;padding:16px;background:#fffdfb;color:#492b3e;font:16px/1.5 system-ui}button,input,select,textarea{max-width:100%;font:inherit}textarea{box-sizing:border-box;width:100%}</style><p><strong>Static fixture review.</strong> Actual call component with mocked account/transport. Controls inactive. No real call, microphone, sound or charge.</p>${renderToStaticMarkup(tree)}</html>`);
}
async function begin(){let tree=render();await flush();tree=render();button(tree,'Call DO').props.onClick();await flush();tree=render();await button(tree,'Review included time').props.onClick();await flush();tree=render();const checkbox=nodes(tree).filter(n=>n.type==='input'&&n.props.type==='checkbox').at(-1);checkbox.props.onChange({target:{checked:true}});tree=render();preview('voice-options',tree);button(tree,'Start call').props.onClick();await flush();const ws=Socket.instances[0];ws.onopen();await ws.message({setupComplete:{}});return ws;}
beforeEach(()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-15T00:00:00Z'));deadline=Date.now()+300000;hooks.slots=[];hooks.effects=[];hooks.cleanups=[];Socket.instances=[];recorderCount=0;
  track={enabled:true,stop:vi.fn(),addEventListener:vi.fn()};media={getTracks:()=>[track],getAudioTracks:()=>[track]};mic=vi.fn(async()=>media);
  class Audio {currentTime=0;destination={};audioWorklet={addModule:vi.fn(async()=>{})};resume=vi.fn(async()=>{});close=vi.fn(async()=>{});createMediaStreamSource=()=>({connect:vi.fn(),disconnect:vi.fn()});}
  vi.stubGlobal('WebSocket',Socket);vi.stubGlobal('AudioContext',Audio);vi.stubGlobal('AudioWorkletNode',class{port={onmessage:null,close:vi.fn()};connect=vi.fn();disconnect=vi.fn();constructor(){recorderCount++;}});
  vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:mic}});vi.stubGlobal('document',{hidden:false,addEventListener:(name:string,fn:any)=>{listeners[name]=fn;},removeEventListener:vi.fn()});
  const win:any={AudioContext:Audio,setTimeout,clearTimeout,addEventListener:(name:string,fn:any)=>{listeners[name]=fn;},removeEventListener:vi.fn()};win.parent=win;vi.stubGlobal('window',win);
  request=vi.fn(async(url:string,options:any)=>{
    const body=options?.body?JSON.parse(options.body):null;
    if(url==='/api/do/live-token')return {ok:true,json:async()=>({enabled:true,configured:true,signedIn:true,remaining:3,dailyLimit:3,leaseEnabled:true,voiceName:'Kore',voiceRevision:revision})};
    if(body?.action==='quote')return {ok:true,json:async()=>({quote:{quoteId:'quote-fixture',expiresAt:Date.now()+60000,requestedSeconds:300,voiceRevision:revision,provider:'google',model:'fixture-model',voiceName:'Kore',funding:'assembl_included',planRevision:'v1',dailyReservedSecondsLimit:900,additionalChargeCents:0,usageBasis:'reserved_connection_seconds'}})};
    if(body?.action==='start')return {ok:true,json:async()=>({leaseId,token:'session-secret',model:'fixture-model',config,expiresAt:deadline,sessionSeconds:300})};
    if(body?.action==='resume')return {ok:true,json:async()=>({leaseId,resumeAllowed:true,expiresAt:deadline,reuseExistingToken:true})};
    return {ok:true,json:async()=>({revoked:true})};
  });vi.stubGlobal('fetch',request);
});
afterEach(()=>{for(const cleanup of hooks.cleanups)cleanup();vi.useRealTimers();vi.unstubAllGlobals();});
describe('actual call component with mocked transport',()=>{
  it('resumes same token/config, keeps mute, sends typed input once and acquires mic once',async()=>{
    const first=await begin();let tree=render();button(tree,'Mute microphone').props.onClick();tree=render();const typed=nodes(tree).find(n=>n.type==='textarea'&&n.props.id==='fixture-typed');typed.props.onChange({target:{value:'Continue by typing'}});tree=render();nodes(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
    await first.message({sessionResumptionUpdate:{resumable:true,newHandle:'private-handle'}});await first.message({goAway:{timeLeft:'1s'}});await flush();const second=Socket.instances[1];expect(second.url).toBe(first.url);second.onopen();await second.message({setupComplete:{}});
    expect(mic).toHaveBeenCalledTimes(1);expect(recorderCount).toBe(1);expect(track.enabled).toBe(false);expect(second.sent).toHaveLength(1);expect(JSON.parse(second.sent[0]).setup.sessionResumption.handle).toBe('private-handle');expect(JSON.parse(second.sent[0]).setup.contextWindowCompression).toEqual({slidingWindow:{}});expect(first.sent.filter(s=>s.includes('Continue by typing'))).toHaveLength(1);
    tree=render();preview('voice-connected',tree);button(tree,'End call').props.onClick();expect(track.stop).toHaveBeenCalled();expect(request.mock.calls.filter((c:any)=>c[1]?.body?.includes('"action":"start"'))).toHaveLength(1);
  });
  it('hidden page revokes pending resume and never reacquires audio',async()=>{
    const first=await begin();let resolve:any;request.mockImplementationOnce(()=>new Promise(r=>{resolve=r;}));await first.message({sessionResumptionUpdate:{resumable:true,newHandle:'h'}});await first.message({goAway:{}});(document as any).hidden=true;listeners.visibilitychange();resolve({ok:true,json:async()=>({leaseId,resumeAllowed:true,expiresAt:deadline,reuseExistingToken:true})});await flush();expect(Socket.instances).toHaveLength(1);expect(track.stop).toHaveBeenCalled();expect(mic).toHaveBeenCalledTimes(1);
  });
  it('ends at original expiry after reconnect',async()=>{const first=await begin();await first.message({sessionResumptionUpdate:{resumable:true,newHandle:'h'}});await first.message({goAway:{}});await flush();const second=Socket.instances[1];second.onopen();await second.message({setupComplete:{}});await vi.advanceTimersByTimeAsync(300000);expect(track.stop).toHaveBeenCalled();expect(second.readyState).toBe(3);});
});

describe('shared board component against mocked existing Office API',()=>{
  it('sends only reviewed task, waits for receipt, and adds correlated result once',async()=>{
    const result=vi.fn((_text:string)=>true);const board=()=>{hooks.index=0;return DoCompanionHandoff({context:'Chosen context',disabled:false,onResult:result});};
    let tree=board();await flush();expect(request).not.toHaveBeenCalled();
    nodes(tree).find(n=>n.type==='textarea').props.onChange({target:{value:'Prepare a shared project plan'}});tree=board();button(tree,'Prepare handoff').props.onClick();tree=board();expect(request).not.toHaveBeenCalled();expect(button(tree,'Send to Builder review').props.disabled).toBe(true);
    nodes(tree).find(n=>n.type==='input'&&n.props.type==='checkbox').props.onChange({target:{checked:true}});tree=board();
    request.mockImplementation(async(_url:string,options:any)=>{const payload=JSON.parse(options.body);expect(payload.job.authority).toBe('plan_only');return {ok:true,json:async()=>({job:payload.job,durable:true,receipt:{id:'receipt',kind:'job_accepted',summary:'Plan received'}})};});
    button(tree,'Send to Builder review').props.onClick();await flush();tree=board();expect(result).toHaveBeenCalledTimes(1);expect(result.mock.calls[0][0]).toContain('execution not started');expect(button(tree,'Send to Builder review').props.disabled).toBe(true);preview('shared-board',tree);
  });
});
