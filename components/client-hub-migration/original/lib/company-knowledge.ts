import {z} from "zod/v3";
import {companyIdentity,clientIdentity} from "./workspace-identity";
export const knowledgeSchema=z.object({company:z.string().trim().min(1).max(100),buyer:z.string().trim().max(120),title:z.string().trim().min(1).max(180),text:z.string().max(120000),status:z.enum(["Draft","Approved","Archived"]),reviewer:z.string().max(100),reviewedAt:z.string().max(40),filename:z.string().max(200),fileKey:z.string().max(250),fileType:z.string().max(120),reviewDue:z.union([z.literal(""),z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])}).strict();
export type Knowledge=z.infer<typeof knowledgeSchema>;
export type KnowledgeRecord={id:string;revision:number;updatedAt:number;payload:Knowledge};
export function blankKnowledge(company:string,buyer=""):Knowledge{return {company,buyer,title:"",text:"",status:"Draft",reviewer:"",reviewedAt:"",filename:"",fileKey:"",fileType:"",reviewDue:""};}
export function knowledgeInScope(k:Knowledge,company:string,buyer:string){return companyIdentity(k.company)===companyIdentity(company)&&(!k.buyer||clientIdentity(k.buyer)===clientIdentity(buyer));}
export type KnowledgeReceipt={id:string;title:string;revision:number;excerpt:string;scope:string};
export function knowledgeStillApproved(record:KnowledgeRecord,company:string,buyer:string,now=new Date()){
 const k=record.payload;return k.status==="Approved"&&!!k.reviewer.trim()&&knowledgeInScope(k,company,buyer)&&(!k.reviewDue||k.reviewDue>=now.toISOString().slice(0,10));
}
export function historyReferencesCurrent(receipts:KnowledgeReceipt[],records:KnowledgeRecord[],company:string,buyer:string){return receipts.every(ref=>records.some(r=>r.id===ref.id&&r.revision===ref.revision&&knowledgeStillApproved(r,company,buyer)));}
export function retrieveKnowledge(records:KnowledgeRecord[],company:string,buyer:string,query:string,now=new Date()):KnowledgeReceipt[]{
 const words=Array.from(new Set(query.toLowerCase().match(/[a-z0-9]{3,}/g)||[])).filter(x=>!['this','that','with','from','what','could','would','please','company','client','generate'].includes(x));
 const chunks:Array<KnowledgeReceipt&{score:number;order:number}>=[];
 for(const r of records){const k=r.payload;if(!knowledgeStillApproved(r,company,buyer,now))continue;
  for(let offset=0;offset<k.text.length;offset+=1800){const excerpt=k.text.slice(offset,offset+2000),hay=(k.title+" "+excerpt).toLowerCase(),score=words.reduce((n,w)=>n+(hay.includes(w)?1:0),0);chunks.push({id:r.id,title:k.title,revision:r.revision,excerpt,scope:k.buyer||"Company-wide",score,order:offset});}
 }
 chunks.sort((a,b)=>b.score-a.score||a.order-b.order);return chunks.slice(0,8).map(({score,order,...r})=>r);
}
