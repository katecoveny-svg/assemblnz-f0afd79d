import {readCreativeReferences} from './creative-references';
import {z} from 'zod/v3';
import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {conceptSchema,type Concept} from '@/components/client-hub-migration/original/lib/concept-engine';
export const intakeSchema=z.object({company:z.string().trim().min(1).max(120),url:z.string().max(1500).refine(v=>!v||/^https:\/\//.test(v),'Use an HTTPS company URL.'),kind:z.enum(['job','prospect']),brief:z.string().trim().min(1).max(4200),audience:z.enum(['Hiring decision-maker','CFO','CTO','GM']),positioning:z.enum(['Kate','assembl','Both']),objective:z.string().trim().min(1).max(300)}).strict();
export type Intake=z.infer<typeof intakeSchema>;
export type Progress={stage:'research'|'brand'|'ideas'|'build';message:string;state:'working'|'complete'|'blocked';mode:'live'|'simulated'};
export type RunRequest={action:'ideas'|'build';hub:Hub;conceptId?:string};
export type RunResult={concepts?:Concept[];concept?:Concept;sources:Hub['sources'];packet:string;mode:'live'|'simulated';brandReferences:Array<{url:string;note:string}>;ownerResultHub?:Hub;recovered?:boolean};
export type StudioRuntime={mode:'live'|'simulated';prepare?:(request:RunRequest)=>Promise<RunRequest>;recover?:(hub:Hub,signal:AbortSignal)=>Promise<Hub>;run:(request:RunRequest,onProgress:(event:Progress)=>void,signal:AbortSignal)=>Promise<RunResult>};
const marker='[Private showpiece intake v1]\n';
export function applyIntake(hub:Hub,input:Intake):Hub {const v=intakeSchema.parse(input),seller=v.positioning==='Kate'?'Kate':v.positioning==='assembl'?'assembl':'Kate · assembl';return hubSchema.parse({...hub,seller,buyer:v.company,buyerRole:v.audience,name:`${v.company} · ${v.kind==='job'?'role':'prospect'} showpiece`,design:{...hub.design,buyer:v.company,client:seller},engine:{...hub.engine!,brief:marker+JSON.stringify(v),concepts:[],selected:'',board:undefined,researchPacket:''},sources:[],clientBrand:hub.clientBrand,research:hub.research});}
export function readIntake(hub:Hub):Intake|undefined {try{return hub.engine?.brief.startsWith(marker)?intakeSchema.parse(JSON.parse(hub.engine.brief.slice(marker.length))):undefined;}catch{return undefined;}}
export function validateResult(request:RunRequest,result:RunResult):RunResult {
 if(result.mode!=='live'&&result.mode!=='simulated')throw Error('Missing run provenance.');
 if(result.packet.length>24000)throw Error('Run context is too large.');
 const creativeIds=new Set(readCreativeReferences(request.hub).map(r=>r.sourceId));
 const sources=hubSchema.shape.sources.parse(result.sources);
 if(sources.some(s=>creativeIds.has(s.id)))throw Error('Creative references cannot become cited source evidence.');
 if(result.brandReferences.some(r=>!/^https:\/\//.test(r.url)))throw Error('Brand references need HTTPS source URLs.');
 const concepts=result.concepts?.map(c=>conceptSchema.parse(c)),concept=result.concept?conceptSchema.parse(result.concept):undefined;
 if(request.action==='ideas'&&(!concepts?.length||concepts.length>6))throw Error('Expected bounded concepts.');
 if(concepts&&(concepts.some(c=>!c.id.trim())||new Set(concepts.map(c=>c.id)).size!==concepts.length))throw Error('Concept identities must be unique.');
 if(request.action==='build'&&(!concept||concept.id!==request.conceptId))throw Error('Build does not match the selected concept.');
 for(const c of [...(concepts||[]),...(concept?[concept]:[])])if(c.evidenceIds.some(id=>!sources.some(s=>s.id===id)))throw Error('Concept cites an unknown source.');
 return {...result,sources,concepts,concept,ownerResultHub:result.ownerResultHub?hubSchema.parse(result.ownerResultHub):undefined};
}
// The deployment owner supplies an admitted, same-origin transport after identity,
// retention and live budget approval. There is intentionally no default endpoint.
export function admittedRuntime(transport:StudioRuntime['run']):StudioRuntime {return {mode:'live',async run(request,emit,signal){const result=validateResult(request,await transport(request,emit,signal));if(result.mode!=='live')throw Error('Live service returned simulated output.');return result;}};}
