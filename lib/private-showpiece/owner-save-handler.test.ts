import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {describe,it,expect,vi} from 'vitest';
import {hubSchema,type HubRecord} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {emptyOwnerHub} from '@/lib/client-hub-migration/owner-policy';
import {OwnerSaveFlow,awaitOwnerSaveResponse} from './owner-save-flow';
import {promoteStudioCheckpoints,retainStudioCheckpoint,restoreStudioCheckpoint} from './section-controls';
const source=readFileSync('components/client-hub-migration/original/app/hub/concept-studio.tsx','utf8');
const ast=ts.createSourceFile('studio.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function handler(name:string){let result='';function visit(node:ts.Node){if(ts.isFunctionDeclaration(node)&&node.name?.text===name)result=node.getText(ast);ts.forEachChild(node,visit);}visit(ast);if(!result)throw Error('Missing actual handler');return result;}
const id='00000000-0000-4000-8000-000000000001';
function setup(){
 const hub=emptyOwnerHub(),current={current:hub},workspaceRef={current:`fresh:${id}`},savedIdentity:{current:{id?:string;revision:number}}={current:{revision:0}};
 const posts:unknown[]=[];let calls=0,release!:(response:Response)=>void,dirty=true,notice='',uncertain=false;
 let checkpoints=retainStudioCheckpoint([],hub,`fresh:${id}`);const epoch={current:0};const flow=new OwnerSaveFlow(),reloadUnresolved:{current:string|undefined}={current:undefined};let routed='';
 const scope={hubSchema,OwnerSaveFlow,awaitOwnerSaveResponse,saveFlow:{current:flow},saveLock:{current:false},current,workspaceRef,savedIdentity,reloadUnresolved,epoch,localPreview:false,ownerMode:true,studioPath:'/studio/workspace',showpiece:false,canonical:(value:unknown)=>JSON.stringify(value),promoteStudioCheckpoints,
  setBusy:()=>{},setError:()=>{},setNotice:(value:string)=>{notice=value;},setSaveUncertain:(value:boolean)=>{uncertain=value;},setPanel:()=>{},setId:()=>{},setRevision:()=>{},setDirty:(value:boolean)=>{dirty=value;},setSectionCheckpoints:(update:(old:typeof checkpoints)=>typeof checkpoints)=>{checkpoints=update(checkpoints);},setRecoveryAttempt:()=>{},list:async()=>{},history:{replaceState:(_state:unknown,_unused:string,path:string)=>{routed=path;}},
  post:(_url:string,body:unknown)=>{posts.push(body);calls++;return new Promise<Response>(resolve=>{release=resolve;});},read:async(response:Response)=>{const data=await response.json();if(!response.ok)throw Error('Rejected');return data;},
 };
 const loaded=runInNewContext(ts.transpile(`${handler('adoptSave')}\n${handler('save')}\n${handler('retryOriginalCreate')}\n({save,adoptSave,retryOriginalCreate})`,{target:ts.ScriptTarget.ES2022}),scope) as {save:()=>Promise<boolean>;retryOriginalCreate:()=>Promise<boolean>;adoptSave:(attempt:NonNullable<ReturnType<OwnerSaveFlow['pending']>>['attempt'],item:HubRecord)=>boolean};
 return {hub,current,workspaceRef,flow,loaded,posts,epoch,checkpoints:()=>checkpoints,reloadUnresolved,routed:()=>routed,calls:()=>calls,dirty:()=>dirty,notice:()=>notice,uncertain:()=>uncertain,release:(response:Response)=>release(response)};
}
describe('actual Studio owner save handlers, synthetic deferred transport',()=>{
 it('bounded client timeout becomes uncertain while server work may continue; late ACK is not adopted',async()=>{vi.useFakeTimers();try{const f=setup(),saving=f.loaded.save();await vi.advanceTimersByTimeAsync(20000);expect(await saving).toBe(false);expect(f.uncertain()).toBe(true);expect(f.calls()).toBe(1);f.release(Response.json({item:{id,revision:1,updatedAt:1,payload:f.hub}}));await Promise.resolve();expect(f.workspaceRef.current).toBe(`fresh:${id}`);expect(f.notice()).toBe('');}finally{vi.useRealTimers();}});
 it('explicitly replays only the frozen first create, retaining newer edits and blocking concurrent replay',async()=>{const f=setup(),first=f.loaded.save();f.release(Response.json({error:'Unknown'}, {status:503}));expect(await first).toBe(false);f.current.current={...f.hub,name:'Newer unsaved edit'};f.epoch.current=4;const retry=f.loaded.retryOriginalCreate();expect(await f.loaded.retryOriginalCreate()).toBe(false);expect(f.calls()).toBe(2);expect(f.posts[1]).toEqual(f.posts[0]);f.release(Response.json({item:{id,revision:1,updatedAt:1,payload:f.hub}}));expect(await retry).toBe(true);expect(f.current.current.name).toBe('Newer unsaved edit');expect(f.dirty()).toBe(true);expect(f.checkpoints()[0].workspaceKey).toBe(`hub:${id}`);expect(restoreStudioCheckpoint(f.current.current,f.checkpoints(),f.checkpoints()[0].id,`hub:${id}`).hub).toEqual(f.hub);});
 it('cannot reconstruct a replay after reload loses the captured payload',async()=>{const f=setup();f.reloadUnresolved.current=id;expect(await f.loaded.retryOriginalCreate()).toBe(false);expect(f.calls()).toBe(0);});
 it('never creates from an unresolved reload route',async()=>{const f=setup();f.reloadUnresolved.current=id;expect(await f.loaded.save()).toBe(false);expect(f.calls()).toBe(0);});
 it('dispatches once despite repeated invocation and preserves newer edits after exact ACK',async()=>{
  const f=setup(),saving=f.loaded.save();expect(await f.loaded.save()).toBe(false);expect(f.calls()).toBe(1);expect(f.routed()).toBe(`/studio/workspace?id=${id}`);expect(f.flow.pending(`fresh:${id}`)?.attempt.id).toBe(id);
  f.current.current={...f.hub,name:'Newer manual edit'};
  f.release(Response.json({item:{id,revision:1,updatedAt:1,payload:f.hub}}));expect(await saving).toBe(true);
  expect(f.current.current.name).toBe('Newer manual edit');expect(f.dirty()).toBe(true);expect(f.workspaceRef.current).toBe(`hub:${id}`);
 });
 it('locks after missing ACK and preserves latest edits through explicit exact reconciliation',async()=>{
  const f=setup(),saving=f.loaded.save();f.release(Response.json({error:'Generic RPC failure'}, {status:503}));expect(await saving).toBe(false);
  expect(f.uncertain()).toBe(true);expect(await f.loaded.save()).toBe(false);expect(f.calls()).toBe(1);
  const attempt=f.flow.pending(`fresh:${id}`)!.attempt;f.current.current={...f.hub,name:'Latest retained edit'};
  const item={id,revision:1,updatedAt:1,payload:f.hub};f.flow.reconcile(`fresh:${id}`,item);expect(f.loaded.adoptSave(attempt,item)).toBe(true);
  expect(f.current.current.name).toBe('Latest retained edit');expect(f.dirty()).toBe(true);expect(f.uncertain()).toBe(false);
 });
 it('never adopts a response into another selected workspace or accepts mismatched ACK',async()=>{
  const f=setup(),saving=f.loaded.save();f.workspaceRef.current='hub:another';f.release(Response.json({item:{id,revision:1,updatedAt:1,payload:f.hub}}));expect(await saving).toBe(false);expect(f.notice()).toBe('');expect(f.dirty()).toBe(true);
  const g=setup(),bad=g.loaded.save();g.release(Response.json({item:{id,revision:1,updatedAt:1,payload:{...g.hub,name:'Wrong payload'}}}));expect(await bad).toBe(false);expect(g.uncertain()).toBe(true);expect(await g.loaded.save()).toBe(false);expect(g.calls()).toBe(1);
 });
});
