import {z} from 'zod/v3';
import {draftSchema,literalContentText,type ContentBrief,type ContentDraft,type Channel} from './agency-content';
export type ContentWork={workspaceKey:string;brief:ContentBrief;context:string;draft?:ContentDraft};
export type ContentDeskState={work:ContentWork;history:ContentWork[];activeWorkspaceKey:string;activeContext:string;pending?:ContentWork;dirty:boolean;epoch:number};
const emptyReviews={social:false,press:false,podcast:false};
const invalidate=(work:ContentWork):ContentWork=>({...work,draft:work.draft?{...work.draft,reviewed:{...emptyReviews}}:undefined});
export function initialContentState(context:string,brief:ContentBrief,workspaceKey:string):ContentDeskState{return {work:{workspaceKey,context,brief},history:[],activeWorkspaceKey:workspaceKey,activeContext:context,dirty:false,epoch:0};}
export function contentStale(state:ContentDeskState){return state.work.workspaceKey!==state.activeWorkspaceKey||state.work.context!==state.activeContext||!!state.work.draft&&(state.work.draft.context!==state.activeContext||JSON.stringify(state.work.brief)!==JSON.stringify(state.work.draft.brief));}
export function syncContentContext(state:ContentDeskState,context:string,workspaceKey=state.activeWorkspaceKey):ContentDeskState{
 if(context===state.activeContext&&workspaceKey===state.activeWorkspaceKey)return state;
 if(!state.dirty&&!state.work.draft&&!state.history.length){
  let selected:{audience?:string;brief?:string}={};try{selected=JSON.parse(context);}catch{}
  return {...state,activeWorkspaceKey:workspaceKey,activeContext:context,work:{workspaceKey,context,brief:{...state.work.brief,audience:typeof selected.audience==='string'?selected.audience:state.work.brief.audience,proposition:typeof selected.brief==='string'&&selected.brief.length<=1500?selected.brief:''}},pending:undefined,epoch:state.epoch+1};
 }
 return {...state,activeWorkspaceKey:workspaceKey,activeContext:context,work:invalidate(state.work),history:state.history.map(invalidate),pending:undefined,epoch:state.epoch+1};
}
export function editContentBrief(state:ContentDeskState,key:keyof ContentBrief,value:string):ContentDeskState{return {...state,work:{...invalidate(state.work),brief:{...state.work.brief,[key]:value}},pending:undefined,dirty:true,epoch:state.epoch+1};}
export function editContentCopy(state:ContentDeskState,channel:Channel,value:string):ContentDeskState{if(!state.work.draft)return state;return {...state,work:{...state.work,draft:{...state.work.draft,copy:{...state.work.draft.copy,[channel]:value},reviewed:{...state.work.draft.reviewed,[channel]:false}}},pending:undefined,dirty:true,epoch:state.epoch+1};}
export function reviewContent(state:ContentDeskState,channel:Channel,reviewed:boolean):ContentDeskState{if(!state.work.draft||contentStale(state))throw Error('This retained draft is stale. Regenerate explicitly or restore its original context before reviewing.');return {...state,work:{...state.work,draft:{...state.work.draft,reviewed:{...state.work.draft.reviewed,[channel]:reviewed}}},pending:undefined,dirty:true,epoch:state.epoch+1};}
export function proposeContentReplacement(state:ContentDeskState,work:ContentWork):ContentDeskState{return {...state,pending:invalidate(work),epoch:state.epoch+1};}
export function keepContentWork(state:ContentDeskState):ContentDeskState{return {...state,pending:undefined,epoch:state.epoch+1};}
export function acceptContentReplacement(state:ContentDeskState):ContentDeskState{if(!state.pending)return state;if(state.history.length>=6)throw Error('Six earlier versions are retained. Export the preserved work before explicitly removing a version.');return {...state,work:state.pending,history:[...state.history,state.work],pending:undefined,dirty:true,epoch:state.epoch+1};}
export function restoreContentVersion(state:ContentDeskState,index:number):ContentDeskState{const work=state.history[index];if(!work)throw Error('Version unavailable.');return {...state,work:invalidate(work),history:state.history.map((item,i)=>i===index?state.work:item),pending:undefined,dirty:true,epoch:state.epoch+1};}
// Preserved work is a local file, not an account grant or a Hub schema extension.
const workingBriefSchema=z.object({objective:z.string().max(500),audience:z.string().max(300),proposition:z.string().max(1500),tone:z.string().max(300),cta:z.string().max(300)}).strict();
const workSchema=z.object({workspaceKey:z.string().min(1).max(200),brief:workingBriefSchema,context:z.string().max(100000),draft:draftSchema.optional()}).strict();
export const preservedContentSchema=z.object({format:z.literal('assembl-preserved-content-v3'),work:workSchema,history:z.array(workSchema).max(6)}).strict();
function serializePreservedContent(input:unknown){const parsed=preservedContentSchema.parse(input);const text=JSON.stringify(parsed,null,2);if(new TextEncoder().encode(text).length>1000000)throw Error('Preserved work exceeds 1 MB. Export individual drafts.');return {parsed,text};}
export function exportPreservedContent(state:ContentDeskState){return serializePreservedContent({format:'assembl-preserved-content-v3',work:invalidate(state.work),history:state.history.map(invalidate)}).text;}
export function parsePreservedContent(input:unknown){let candidate=input;if((input as {format?:string})?.format==='assembl-preserved-content-v2'){const legacy=input as {work:object;history:object[]};if(!Array.isArray(legacy.history))throw Error('Invalid preserved history.');candidate={...legacy,format:'assembl-preserved-content-v3',work:{...legacy.work,workspaceKey:'legacy:unbound'},history:legacy.history.map(work=>({...work,workspaceKey:'legacy:unbound'}))};}const parsed=preservedContentSchema.parse(candidate);const cleared={format:'assembl-preserved-content-v3',work:invalidate(parsed.work),history:parsed.history.map(invalidate)};const checked=serializePreservedContent(cleared).parsed;return {work:checked.work,history:checked.history};}
export function mergePreservedContent(state:ContentDeskState,imported:ReturnType<typeof parsePreservedContent>):ContentDeskState{
 const retainCurrent=state.dirty||!!state.work.draft;
 const history=[...state.history,...(retainCurrent?[state.work]:[]),...imported.history];
 if(history.length>6)throw Error('Too many preserved versions to merge. Export or explicitly remove versions first. Existing work is unchanged.');
 const next={...state,work:imported.work,history,pending:undefined,dirty:true,epoch:state.epoch+1};exportPreservedContent(next);return next;
}
export function contentAttribution(work:ContentWork){try{const context=JSON.parse(work.draft?.context||work.context);return typeof context.company==='string'?context.company:'Unrecognised imported context';}catch{return 'Unrecognised imported context';}}
export function exportContentChannel(state:ContentDeskState,channel:Channel,markdown:(draft:ContentDraft,channel:Channel)=>string){if(!state.work.draft)throw Error('No channel draft to export.');const draft=contentStale(state)?{...state.work.draft,reviewed:{...emptyReviews}}:state.work.draft;return `Workspace: ${literalContentText(state.work.workspaceKey).replace(/\n|\t/g,c=>c==='\n'?'\\n':'\\t')} (local binding; not an access grant)\nContext: ${literalContentText(contentAttribution(state.work)).replace(/\n|\t/g,c=>c==='\n'?'\\n':'\\t')} (original attribution retained)\nStatus: ${contentStale(state)?'STALE — selected context or content brief changed; review invalidated':'local draft'}\n\n${markdown(draft,channel)}`;}

export function proposeCrossWorkspaceCopy(state:ContentDeskState):ContentDeskState{
 if(state.work.context!==state.activeContext||state.work.draft?.context!==state.activeContext)throw Error('Restore the original selected context before copying retained content.');
 return proposeContentReplacement(state,{...invalidate(state.work),workspaceKey:state.activeWorkspaceKey});
}
