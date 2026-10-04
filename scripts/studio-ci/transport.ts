/** Imported only by the hosted-CI generated component. Never an auth/provider adapter. */
import {hubSchema,type HubRecord} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {emptyOwnerHub} from '@/lib/client-hub-migration/owner-policy';
import {newOwnerIdea} from '@/lib/client-hub-migration/owner-idea';
import {newIdeaBoard} from '@/components/client-hub-migration/original/lib/idea-board';
const key='FICTIONAL-STUDIO-CI-RECORDS';
type Mode='ack'|'lost'|'missing'|'hang-post'|'hang-get'|'hang-body';
type Control={mode:Mode;requests:{method:string;id?:string;body?:unknown}[];release?:()=>void;seed:(id:string,kind:'legacy'|'quarantine')=>void;records:()=>HubRecord[]};
declare global{interface Window{__studioCi?:Control;}}
function records():HubRecord[]{return JSON.parse(sessionStorage.getItem(key)||'[]');}
function store(items:HubRecord[]){sessionStorage.setItem(key,JSON.stringify(items));}
function control():Control{
 if(window.__studioCi)return window.__studioCi;
 const value:Control={mode:'ack',requests:[],records,seed:(id,kind)=>{
  const h=emptyOwnerHub();h.name='FICTIONAL saved '+kind;h.buyer='FICTIONAL Legacy Company';h.privateNotes='PRIVATE_BACKUP_SENTINEL';
  const idea=newOwnerIdea(h);idea.title='FICTIONAL preserved legacy idea';
  h.engine={...h.engine!,brief:'FICTIONAL original long brief '+'x'.repeat(4700),concepts:[idea],selected:idea.id,board:newIdeaBoard(idea.id,[])};
  h.sources=[{id:'factual',title:'FICTIONAL factual reference',url:'https://example.org/factual',claim:'FICTIONAL supplied public fact',status:'source',include:true,checked:'Unverified CI fixture'}];
  if(kind==='quarantine'){h.sources.push({...h.sources[0],id:'creative-bound',title:'CREATIVE_TITLE_SENTINEL',claim:'CREATIVE_CLAIM_SENTINEL',url:'https://example.org/creative'});h.engine.researchPacket=JSON.stringify({agencyCreativeReferences:[{sourceId:'creative-bound'}]});}
  const payload=hubSchema.parse(h);store([...records().filter(r=>r.id!==id),{id,revision:1,updatedAt:1,payload}]);
 }};window.__studioCi=value;return value;
}
if(typeof window!=='undefined')control();
export async function migrationFetch(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
 const ci=control(),url=new URL(String(input),location.origin),method=init?.method||'GET';
 if(url.origin!==location.origin||url.pathname!=='/api/hub')return Response.json({error:'CI fixture excludes this connection; no external request.'},{status:503});
 const id=url.searchParams.get('id')||undefined;
 if(method==='POST'){
  const body=JSON.parse(String(init?.body));ci.requests.push({method,body:structuredClone(body),id:body.id});
  const payload=hubSchema.parse(body.payload),items=records(),old=items.find(r=>r.id===body.id);
  if(ci.mode==='hang-post')await new Promise<void>(resolve=>{ci.release=resolve;});
  // Synthetic stable-create reconciliation is not a claim about real storage.
  if(old&&body.revision===0){if(old.revision!==1||JSON.stringify(old.payload)!==JSON.stringify(payload))return Response.json({error:'FICTIONAL create conflict'},{status:409});return Response.json({item:old});}
  if(old&&old.revision!==body.revision)return Response.json({error:'FICTIONAL CAS conflict'},{status:409});
  const item={id:body.id,revision:body.revision+1,updatedAt:Date.now(),payload};store([...items.filter(r=>r.id!==body.id),item]);
  if(ci.mode==='missing'){store(items);return Response.json({error:'FICTIONAL lost request, no row'},{status:503});}
  if(ci.mode==='lost')return Response.json({error:'FICTIONAL lost ACK after commit'},{status:503});
  return Response.json({item});
 }
 ci.requests.push({method,id});
 if(id&&ci.mode==='hang-get')await new Promise<void>(resolve=>{ci.release=resolve;});
 const items=records(),item=items.find(r=>r.id===id);
 const response=id?(item?Response.json({item}):Response.json({error:'FICTIONAL missing row'},{status:404})):Response.json({items:items.map(r=>({id:r.id,revision:r.revision,name:r.payload.name,seller:r.payload.seller,buyer:r.payload.buyer}))});
 if(id&&ci.mode==='hang-body'){const json=response.json.bind(response);response.json=async()=>{await new Promise<void>(resolve=>{ci.release=resolve;});return json();};}
 return response;
}
