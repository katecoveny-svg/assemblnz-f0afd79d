import {beforeEach,expect,it,vi} from 'vitest';
// Execute the real component and its handlers through controlled hook state.
// Child components and DOM effects are outside this integration harness.
const h=vi.hoisted(()=>({cells:[] as unknown[],cursor:0,effect:undefined as undefined|(()=>unknown),effects:0}));
vi.mock('react',async original=>({...await original<typeof import('react')>(),
 useState:(init:unknown)=>{const i=h.cursor++;if(!(i in h.cells))h.cells[i]=typeof init==='function'?(init as ()=>unknown)():init;return[h.cells[i],(v:unknown)=>{h.cells[i]=typeof v==='function'?(v as (p:unknown)=>unknown)(h.cells[i]):v;}];},
 useRef:(init:unknown)=>{const i=h.cursor++;if(!(i in h.cells))h.cells[i]={current:init};return h.cells[i];},
 useCallback:(fn:unknown)=>{const i=h.cursor++;if(!(i in h.cells))h.cells[i]=fn;return h.cells[i];},
 useEffect:(fn:()=>unknown)=>{if(h.effects++===0&&!h.effect)h.effect=fn;},
}));
vi.mock('@/lib/supabase/client',()=>({createClient:()=>{throw new Error('No browser auth fixture');}}));
vi.mock('@/components/do/DoBrand',()=>({DoBrand:()=>null}));
vi.mock('@/components/do/DoPresence',()=>({DoPresence:()=>null}));
vi.mock('@/components/do/DoShareButton',()=>({DoShareButton:()=>null}));
vi.mock('@/components/do/DoReadAloud',()=>({DoReadAloud:()=>null}));
vi.mock('@/app/do/DoGeminiLive',()=>({DoGeminiLive:()=>null}));
vi.mock('./PersonalDoSettings',()=>({PersonalDoSettings:()=>null}));
vi.mock('./LifeAdmin',()=>({LifeAdmin:()=>null}));
vi.mock('./PersonalDoAssistant',()=>({PersonalDoAssistant:()=>null}));
vi.mock('./NzCareNavigation',()=>({NzCareNavigation:()=>null}));
vi.mock('./LifeAdminLocalUpdates',()=>({LifeAdminLocalUpdates:()=>null}));
vi.mock('@/apps/do/shared/share-intake',()=>({readDoShareForWorkspace:()=>null}));
import {PersonalDo} from './PersonalDo';
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const state=(owner=a)=>({workspaceKey:owner,responsibilities:[],runs:[],storage:{available:true},worker:{configured:false,lastSeenAt:null}});
type ElementNode={type:unknown;props:Record<string,unknown>};
let tree:unknown;
function render(){h.cursor=0;h.effects=0;tree=PersonalDo();}
function nodes(value:unknown):ElementNode[]{if(Array.isArray(value))return value.flatMap(v=>nodes(v));if(!value||typeof value!=='object'||!('props' in value))return[];const n=value as ElementNode;return[n,...nodes(n.props.children)];}
function text(v:unknown):string{if(Array.isArray(v))return v.map(text).join('');if(v&&typeof v==='object'&&'props'in v)return text((v as ElementNode).props.children);return typeof v==='string'?v:'';}
function button(label:string){const n=nodes(tree).find(n=>n.type==='button'&&text(n.props.children).includes(label));if(!n)throw new Error('Missing button '+label);return n;}
const call=(n:ElementNode,key:string,arg?:unknown)=>(n.props[key] as (x:unknown)=>unknown)(arg);
const settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve();render();};
const fetcher=vi.fn();
beforeEach(async()=>{h.cells=[];h.cursor=0;h.effects=0;h.effect=undefined;vi.stubGlobal('window',{addEventListener:vi.fn(),removeEventListener:vi.fn(),sessionStorage:{},matchMedia:()=>({matches:true})});vi.stubGlobal('fetch',fetcher);fetcher.mockReset();fetcher.mockResolvedValue({ok:true,status:200,json:async()=>state()});render();(h.effect as undefined|(()=>unknown))?.();await settle();});
function edit(){call(button('Give DO a responsibility'),'onClick');render();const input=nodes(tree).find(n=>n.type==='input'&&n.props.maxLength===100)!;call(input,'onChange',{target:{value:'Synthetic retained title'}});render();const check=nodes(tree).filter(n=>n.type==='input'&&n.props.type==='checkbox').at(-1)!;call(check,'onChange',{target:{checked:true}});render();}
async function submit(){const form=nodes(tree).find(n=>n.type==='form')!;await call(form,'onSubmit',{preventDefault:vi.fn()});render();}
it.each(['lost','malformed'])('blocks a second create after %s response',async mode=>{edit();fetcher.mockImplementation(async(_url:string,options?:{method?:string})=>{if(options?.method==='POST'){if(mode==='lost')throw new Error('Synthetic lost response');return{ok:true,status:200,json:async()=>({})};}return{ok:true,status:200,json:async()=>state()};});await submit();expect(button('Save responsibility').props.disabled).toBe(true);await submit();expect(fetcher.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);});
it('retains editor fields behind failed identity verification, reopens only for the same owner and clears for a different owner',async()=>{edit();fetcher.mockImplementation(async(_url:string,options?:{method?:string})=>{if(options?.method==='POST')return{ok:true,status:200,json:async()=>({id:'11111111-1111-4111-8111-111111111111',saved:true,preparation:'off'})};throw new Error('Synthetic GET outage');});await submit();expect(nodes(tree).some(n=>n.type==='form')).toBe(false);fetcher.mockResolvedValue({ok:true,status:200,json:async()=>state(a)});call(button('Try loading again'),'onClick');await settle();expect(nodes(tree).find(n=>n.type==='input'&&n.props.maxLength===100)?.props.value).toBe('Synthetic retained title');expect(button('Save responsibility').props.disabled).toBe(true);fetcher.mockResolvedValue({ok:true,status:200,json:async()=>state(b)});call(nodes(tree).find(n=>n.props['aria-label']==='Refresh workspace')!,'onClick');await settle();expect(nodes(tree).some(n=>n.type==='form')).toBe(false);call(button('Give DO a responsibility'),'onClick');render();expect(nodes(tree).find(n=>n.type==='input'&&n.props.maxLength===100)?.props.value).toBe('');});

it.each(['POST','GET'])('keeps newer unsent edits made during %s',async stage=>{
 edit();let resolvePost!:(x:unknown)=>void,resolveGet!:(x:unknown)=>void;
 const post=new Promise(r=>{resolvePost=r;}),get=new Promise(r=>{resolveGet=r;});
 fetcher.mockImplementation((_url:string,options?:{method?:string})=>options?.method==='POST'?post:get);
 const pending=call(nodes(tree).find(n=>n.type==='form')!,'onSubmit',{preventDefault:vi.fn()}) as Promise<unknown>;
 await settle();
 const receipt={ok:true,status:200,json:async()=>({id:'11111111-1111-4111-8111-111111111111',saved:true,preparation:'off'})};
 if(stage==='GET'){resolvePost(receipt);await settle();}
 const input=nodes(tree).find(n=>n.type==='input'&&n.props.maxLength===100)!;
 call(input,'onChange',{target:{value:'Newer unsent '+stage}});render();
 if(stage==='POST')resolvePost(receipt);
 resolveGet({ok:true,status:200,json:async()=>state(a)});await pending;render();
 expect(nodes(tree).find(n=>n.type==='input'&&n.props.maxLength===100)?.props.value).toBe('Newer unsent '+stage);
 expect(text(tree)).toContain('Your newer edits remain unsaved');
 expect(button('Save responsibility').props.disabled).toBe(true); // changed fields revoke checkbox acknowledgement
});
it('first-ever unknown create can explicitly retry the exact request with no existing items',async()=>{
 edit();fetcher.mockRejectedValueOnce(new Error('Synthetic precommit outage'));await submit();
 const first=JSON.parse(fetcher.mock.calls.find(c=>c[1]?.method==='POST')![1].body);
 expect(button('Save responsibility').props.disabled).toBe(true);
 fetcher.mockImplementation(async(_u:string,o?:{method?:string})=>o?.method==='POST'?{ok:true,status:200,json:async()=>({id:first.id,saved:true,preparation:'off'})}:{ok:true,status:200,json:async()=>state(a)});
 await call(button('Retry original saved request'),'onClick');await settle();
 const sent=fetcher.mock.calls.filter(c=>c[1]?.method==='POST').map(c=>JSON.parse(c[1].body));expect(sent).toEqual([first,first]);expect(nodes(tree).some(n=>n.type==='form')).toBe(false);
});
it('a definite validation rejection permits correction with the same create ID',async()=>{
 edit();fetcher.mockResolvedValueOnce({ok:false,status:400,json:async()=>({error:'Synthetic invalid request'})});await submit();expect(button('Save responsibility').props.disabled).toBe(false);
 const first=JSON.parse(fetcher.mock.calls.find(c=>c[1]?.method==='POST')![1].body);
 fetcher.mockImplementation(async(_u:string,o?:{method?:string})=>o?.method==='POST'?{ok:true,status:200,json:async()=>({id:first.id,saved:true,preparation:'off'})}:{ok:true,status:200,json:async()=>state(a)});
 await submit();const sent=fetcher.mock.calls.filter(c=>c[1]?.method==='POST').map(c=>JSON.parse(c[1].body));expect(sent).toHaveLength(2);expect(sent[1].id).toBe(first.id);
});
it('opening an existing item does not replace retained unsaved editor fields',async()=>{
 const existing={id:'33333333-3333-4333-8333-333333333333',title:'Other synthetic task',goal:'Review fictional notes',notes:'Other fictional notes',timezone:'Pacific/Auckland',local_hour:7,active:false,consent_until:'-infinity',next_run_at:'infinity',revision:1,updated_at:'2026-10-01T00:00:00Z'};
 fetcher.mockResolvedValue({ok:true,status:200,json:async()=>({...state(a),responsibilities:[existing]})});call(nodes(tree).find(n=>n.props['aria-label']==='Refresh workspace')!,'onClick');await settle();edit();
 call(button('Edit notes'),'onClick');render();expect(nodes(tree).find(n=>n.type==='input'&&n.props.maxLength===100)?.props.value).toBe('Synthetic retained title');expect(text(tree)).toContain('Your unsaved editor notes are retained');
});
it('reload recovery retains only the owner-scoped request ID and reuses it rather than creating a new identity',async()=>{
 const cache=new Map<string,string>();(window as unknown as {sessionStorage:unknown}).sessionStorage={getItem:(k:string)=>cache.get(k)??null,setItem:(k:string,v:string)=>cache.set(k,v),removeItem:(k:string)=>cache.delete(k)};
 edit();fetcher.mockRejectedValueOnce(new Error('Synthetic unknown commit'));await submit();const first=JSON.parse(fetcher.mock.calls.find(c=>c[1]?.method==='POST')![1].body);
 expect([...cache.values()]).toEqual([first.id]);expect([...cache.values()].join()).not.toContain('Synthetic retained title');
 h.cells=[];h.cursor=0;h.effects=0;h.effect=undefined;fetcher.mockResolvedValue({ok:true,status:200,json:async()=>state(a)});render();(h.effect as undefined|(()=>unknown))?.();await settle();edit();
 fetcher.mockRejectedValueOnce(new Error('Synthetic unknown commit'));await submit();const sent=fetcher.mock.calls.filter(c=>c[1]?.method==='POST').map(c=>JSON.parse(c[1].body));expect(sent.at(-1).id).toBe(first.id);
});
