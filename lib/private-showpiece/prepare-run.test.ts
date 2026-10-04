import {describe,it,expect,vi} from 'vitest';
import {emptyOwnerHub} from '@/lib/client-hub-migration/owner-policy';
import type {RunRequest} from './contract';
import {prepareRunForDispatch} from './prepare-run';
import {newIdeaBoard} from '@/components/client-hub-migration/original/lib/idea-board';
import type {Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
const changes:{[key:string]:(hub:Hub)=>Hub}={brief:h=>({...h,engine:{...h.engine!,brief:'changed'}}),source:h=>({...h,sources:[{id:'test',title:'LOCAL TEST',url:'https://example.com',claim:'fixture only',checked:'2026-10-02',status:'source',include:true}]}),board:h=>({...h,engine:{...h.engine!,board:newIdeaBoard('changed')}})};
describe('run preparation race guards; local state only',()=>{
 for(const phase of ['prepare','save'])for(const change of ['brief','source','board','navigation'])it(`rejects ${change} change during ${phase} await`,async()=>{
  const initial=emptyOwnerHub();let current=initial,epoch=0;
  const mutate=()=>{if(change==='navigation')epoch++;else current=changes[change](current);};
  const commit=vi.fn((hub:Hub)=>{current=hub;});
  const prepare=async(request:RunRequest)=>{await Promise.resolve();if(phase==='prepare')mutate();return request;};
  const save=vi.fn(async()=>{await Promise.resolve();if(phase==='save')mutate();return true;});
  await expect(prepareRunForDispatch({hub:initial,action:'ideas'},prepare,{current:()=>current,epoch:()=>epoch,expectedEpoch:0,signal:new AbortController().signal,commit,save})).rejects.toThrow('draft changed');
  if(phase==='prepare'){expect(commit).not.toHaveBeenCalled();expect(save).not.toHaveBeenCalled();}
 });
});
