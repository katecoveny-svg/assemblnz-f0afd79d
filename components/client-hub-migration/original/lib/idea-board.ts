import {z} from "zod/v3";

export const boardNodeIds=["idea","moment","agent","review","outcome","evidence"] as const;
export type BoardNodeId=typeof boardNodeIds[number];
export const ideaBoardSchema=z.object({
 ideaId:z.string().max(100),
 nodes:z.array(z.object({id:z.enum(boardNodeIds),x:z.number().min(0).max(900),y:z.number().min(0).max(650),note:z.string().max(1400).default("")}).strict()).length(6).refine(nodes=>new Set(nodes.map(n=>n.id)).size===6,"Each board part must appear once."),
 sourceIds:z.array(z.string().max(100)).max(12),
}).strict();
export type IdeaBoardState=z.infer<typeof ideaBoardSchema>;
export type BoardIdea={id:string;title:string;promise:string;moment:string;agent:string;review:string;outcome:string;origin:string;image:string;blocked?:string};
export type BoardSource={id:string;title:string;claim:string;url:string;checked:boolean};
export const boardPositions:Record<BoardNodeId,{x:number;y:number}>={idea:{x:409,y:214},moment:{x:38,y:65},agent:{x:780,y:65},review:{x:780,y:410},outcome:{x:38,y:410},evidence:{x:409,y:590}};
export function newIdeaBoard(ideaId:string,sourceIds:string[]=[]):IdeaBoardState{return {ideaId,nodes:boardNodeIds.map(id=>({id,...boardPositions[id],note:""})),sourceIds:sourceIds.slice(0,12)};}
export function selectBoardIdea(state:IdeaBoardState|undefined,ideaId:string,sourceIds:string[]):IdeaBoardState{
 if(state?.ideaId===ideaId)return {...state,sourceIds:state.sourceIds.filter(id=>sourceIds.includes(id))};
 return newIdeaBoard(ideaId,sourceIds.slice(0,3));
}
export function boardDirection(state:IdeaBoardState|undefined,conceptId?:string){
 if(!state||state.ideaId!==conceptId)return "";
 const notes=state.nodes.filter(n=>n.note.trim()).map(n=>`${n.id}: ${n.note.trim()}`);
 return notes.length?"\nUSER'S VISUAL BOARD DIRECTION (proposals, not verified facts):\n"+notes.join("\n"):"";
}
