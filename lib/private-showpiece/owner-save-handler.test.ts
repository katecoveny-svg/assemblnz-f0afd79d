import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {describe,it,expect} from 'vitest';
import {hubSchema,type HubRecord} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {emptyOwnerHub} from '@/lib/client-hub-migration/owner-policy';
import {OwnerSaveFlow} from './owner-save-flow';
import {promoteStudioCheckpoints} from './section-controls';
const source=readFileSync('components/client-hub-migration/original/app/hub/concept-studio.tsx','utf8');
const ast=ts.createSourceFile('studio.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function handler(name:string){let result='';function visit(node:ts.Node){if(ts.isFunctionDeclaration(node)&&node.name?.text===name)result=node.getText(ast);ts.forEachChild(node,visit);}visit(ast);if(!result)throw Error('Missing actual handler');return result;}
const id='00000000-0000-4000-8000-000000000001';
function setup(){
 const hub=emptyOwnerHub(),current={current:hub},workspaceRef={current:`fresh:${id}`},savedIdentity:{current:{id?:string;revision:number}}={current:{revision:0}};
 let calls=0,release!:(response:Response)=>void,dirty=true,notice='',uncertain=false;
 const flow=new OwnerSaveFlow(),reloadUnresolved:{current:string|undefined}={current:undefined};let routed='';
 const scope={hubSchema,OwnerSaveFlow,saveFlow:{current:flow},saveLock:{current:false},current,workspaceRef,savedIdentity,reloadUnresolved,epoch:{current:0},localPreview:false,ownerMode:true,studioPath:'/studio/workspace',showpiece:false,canonical:(value:unknown)=>JSON.stringify(value),promoteStudioCheckpoints,
  setBusy:()=>{},setError:()=>{},setNotice:(value:string)=>{notice=value;},setSaveUncertain:(value:boolean)=>{uncertain=value;},setPanel:()=>{},setId:()=>{},setRevision:()=>{},setDirty:(value:boolean)=>{dirty=value;},setSectionCheckpoints:()=>{},list:async()=>{},history:{replaceState:(_state:unknown,_unused:string,path:string)=>{routed=path;}},
  post:()=>{calls++;return new Promise<Response>(resolve=>{release=resolve;});},read:async(response:Response)=>{const data=await response.json();if(!response.ok)throw Error('Rejected');return data;},
 };
 const loaded=runInNewContext(ts.transpile(`${handler('adoptSave')}\n${handler('save')}\n({save,adoptSave})`,{target:ts.ScriptTarget.ES2022}),scope) as {save:()=>Promise<boolean>;adoptSave:(attempt:NonNullable<ReturnType<OwnerSaveFlow['pending']>>['attempt'],item:HubRecord)=>boolean};
 return {hub,current,workspaceRef,flow,loaded,reloadUnresolved,routed:()=>routed,calls:()=>calls,dirty:()=>dirty,notice:()=>notice,uncertain:()=>uncertain,release:(response:Response)=>release(response)};
}
describe('actual Studio owner save handlers, synthetic deferred transport',()=>{
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
