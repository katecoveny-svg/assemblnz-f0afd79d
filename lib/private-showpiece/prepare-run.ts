import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import type {RunRequest} from './contract';
const fingerprint=(hub:Hub)=>JSON.stringify(hubSchema.parse(hub));
export async function prepareRunForDispatch(request:RunRequest,prepare:(request:RunRequest)=>Promise<RunRequest>,state:{current:()=>Hub;epoch:()=>number;expectedEpoch:number;signal:AbortSignal;commit:(hub:Hub)=>void;save:()=>Promise<boolean|undefined>}){
 const initial=fingerprint(request.hub);
 const assert=(baseline:string)=>{if(state.signal.aborted||state.epoch()!==state.expectedEpoch||fingerprint(state.current())!==baseline)throw Error('The draft changed during run preparation. No provider request started.');};
 const prepared=await prepare(request);assert(initial);
 const baseline=fingerprint(prepared.hub);state.commit(prepared.hub);
 if(!await state.save())throw Error('Owner run identity could not be saved. No provider request started.');
 assert(baseline);return prepared;
}
