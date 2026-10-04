import {describe,it,expect} from 'vitest';
import {emptyOwnerHub} from '@/lib/client-hub-migration/owner-policy';
import {newOwnerIdea} from '@/lib/client-hub-migration/owner-idea';
import {newIdeaBoard} from '@/components/client-hub-migration/original/lib/idea-board';
import {hubSchema} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {OwnerSaveFlow} from './owner-save-flow';
const id='893f40dc-2b51-4f10-bcfe-91fa6e952f32';
describe('manual owner Hub save dispatch ledger (synthetic, no account writes)',()=>{
 it('rejects exhausted, fractional and out-of-range revisions before reserving or dispatching',()=>{
  const flow=new OwnerSaveFlow(),hub=emptyOwnerHub();
  for(const revision of [-1,0.5,2147483647,2147483648,Number.NaN])expect(()=>flow.begin('hub:fixture',id,revision,hub)).toThrow('invalid or exhausted');
  expect(flow.pending('hub:fixture')).toBeUndefined();
  const attempt=flow.begin('hub:fixture',id,2147483646,hub);
  expect(flow.acknowledge(attempt,{id,revision:2147483647,updatedAt:1,payload:hub}).revision).toBe(2147483647);
 });
 it('roundtrips full original brief, draggable canvas, pitch, evidence and unrelated context',()=>{
  const hub=emptyOwnerHub(),idea=newOwnerIdea(hub),board=newIdeaBoard(idea.id,['public-source']);
  board.nodes[0]={...board.nodes[0],x:123,y:234,note:'Fictional owner canvas note'};
  hub.sources=[{id:'public-source',title:'Fictional selected source',url:'https://example.org',claim:'Supplied fictional extract',status:'source',include:true,checked:'Unverified fixture'}];
  hub.engine={...hub.engine!,brief:'Fictional manual brief',concepts:[idea],selected:idea.id,board,evidence:[{id:'evidence',title:'Fictional evidence',body:'Supplied fixture',approved:false}]};
  hub.design.frame.content={...hub.design.frame.content,headline:'Fictional pitch',intro:'Manual client proposition',next:'Ask the reviewer'};
  hub.privateNotes='Private context retained in original Hub';hub.reviewer='Fictional reviewer';
  const normalized=hubSchema.parse(hub),flow=new OwnerSaveFlow(),attempt=flow.begin('fresh:fixture',id,0,normalized);
  const wire=JSON.parse(JSON.stringify({id,revision:0,payload:attempt.payload}));
  const reopened=flow.acknowledge(attempt,{id,revision:1,updatedAt:1,payload:hubSchema.parse(wire.payload)}).payload;
  expect(reopened).toEqual(normalized);expect(reopened.engine?.board?.nodes[0]).toEqual(board.nodes[0]);expect(reopened.privateNotes).toBe(hub.privateNotes);
  expect(Object.keys(wire).sort()).toEqual(['id','payload','revision']);
 });
 it('blocks repeated dispatch synchronously, including an interrupted first create',()=>{
  const flow=new OwnerSaveFlow(),hub=emptyOwnerHub(),attempt=flow.begin('fresh:test',undefined,0,hub);
  expect(()=>flow.begin('fresh:test',undefined,0,hub)).toThrow('pending');
  flow.uncertain(attempt);
  expect(()=>flow.begin('fresh:test',undefined,0,hub)).toThrow('uncertain');
  expect(flow.pending('fresh:test')?.attempt.id).toBeUndefined();
 });
 it('reconciles only exact owned-list candidate revision/payload; mismatches retain reservation',()=>{
  const flow=new OwnerSaveFlow(),hub=emptyOwnerHub(),attempt=flow.begin('fresh:test',undefined,0,hub);flow.uncertain(attempt);
  expect(()=>flow.reconcile('fresh:test',{id,revision:2,updatedAt:1,payload:hub})).toThrow('acknowledgement');
  expect(()=>flow.reconcile('fresh:test',{id,revision:1,updatedAt:1,payload:{...hub,name:'Different project'}})).toThrow('acknowledgement');
  expect(flow.pending('fresh:test')).toBeDefined();
  expect(flow.reconcile('fresh:test',{id,revision:1,updatedAt:1,payload:hub}).id).toBe(id);
  expect(flow.pending('fresh:test')).toBeUndefined();
 });
 it('captures a detached submitted snapshot and never hydrates over newer edits',()=>{
  const flow=new OwnerSaveFlow(),hub=emptyOwnerHub(),attempt=flow.begin('fresh:test',undefined,0,hub);hub.name='New edit during request';
  flow.acknowledge(attempt,{id,revision:1,updatedAt:1,payload:attempt.payload});
  expect(hub.name).toBe('New edit during request');expect(attempt.payload.name).not.toBe(hub.name);
 });
 it('existing project recovery requires same UUID and expected next revision',()=>{
  const flow=new OwnerSaveFlow(),hub=emptyOwnerHub(),attempt=flow.begin(`hub:${id}`,id,3,hub);flow.uncertain(attempt);
  expect(()=>flow.reconcile(`hub:${id}`,{id:'00000000-0000-4000-8000-000000000002',revision:4,updatedAt:1,payload:hub})).toThrow();
  expect(flow.reconcile(`hub:${id}`,{id,revision:4,updatedAt:1,payload:hub}).revision).toBe(4);
  expect(flow.begin(`hub:${id}`,id,4,hub).revision).toBe(4);
 });
 it('a definite rejected request can be corrected and retried; stale callbacks cannot clear newer locks',()=>{
  const flow=new OwnerSaveFlow(),hub=emptyOwnerHub(),old=flow.begin('fresh:test',undefined,0,hub);flow.rejected(old);
  const next=flow.begin('fresh:test',undefined,0,hub);flow.rejected(old);flow.uncertain(old);
  expect(flow.pending('fresh:test')?.attempt).toBe(next);
  expect(()=>flow.acknowledge(old,{id,revision:1,updatedAt:1,payload:hub})).toThrow('current');
 });
});
