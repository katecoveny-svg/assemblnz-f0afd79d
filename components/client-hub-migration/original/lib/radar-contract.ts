import {z} from "zod/v3";
import {scopeIssue} from "./radar-scope";

// Mirrored in assemblnz/src/lib/pursuit/studio-contract.ts. Keep wire version 1 compatible.
export const STUDIO_ORIGIN="http://127.0.0.1:3187";
export const MAX_HANDOFF_BYTES=160000;
const id=z.string().trim().min(1).max(100);
const url=z.string().max(1500).url().refine(s=>{try{const u=new URL(s);return ["http:","https:"].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}});
const text=(max:number)=>z.string().trim().max(max);
export const sellerProfileSchema=z.object({
 id,name:text(100).min(1),focus:z.enum(["technology","construction","agency","other"]).optional(),website:z.union([url,z.literal("")]).default(""),
 offering:text(3000).min(1),targetCustomers:text(1800),voice:text(600).default(""),approved:z.boolean(),
 evidence:z.array(z.object({id,title:text(160).min(1),body:text(6000).min(1),approved:z.boolean()}).strict()).max(12).default([]),
}).strict();
export type SellerProfile=z.infer<typeof sellerProfileSchema>;
export const radarEvidenceSchema=z.object({claim:text(900).min(1),sourceUrl:url,sourceTitle:text(180).optional(),publishedAt:text(100).optional(),eventAt:text(100).optional(),verified:z.boolean(),caveat:text(900).optional()}).strict();
export const radarOpportunitySchema=z.object({
 id,accountName:text(120).min(1),nzbn:text(30).optional(),signalType:z.enum(["policy","consultation","funding","procurement","leadership","technology","customer-experience","partnership","ai-visibility","other"]),
 headline:text(140).min(1),whatChanged:text(2000).min(1),whyItMayMatter:text(2000).min(1),assemblOutcome:text(2000).min(1),demoIdea:text(3000).min(1),
 buyerRoles:z.array(text(160)).max(12),evidence:z.array(radarEvidenceSchema).min(1).max(16),unknowns:z.array(text(900)).max(12),
 score:z.object({serviceFit:z.number().min(0).max(100),evidenceStrength:z.number().min(0).max(100),timing:z.number().min(0).max(100),buyerAccess:z.number().min(0).max(100),total:z.number().min(0).max(100)}).strict(),
 stage:z.enum(["signal","qualified","pursuit","hold"]),nextAction:text(900).min(1),reviewAt:text(100).optional(),
}).strict();
export const radarHandoffSchema=z.object({schemaVersion:z.literal(1),kind:z.literal("assembl.radar-pursuit"),
 runId:id,generatedAt:z.string().datetime({offset:true}),mission:text(4000),seller:sellerProfileSchema,opportunity:radarOpportunitySchema,
}).strict().superRefine((v,ctx)=>{
 if(!v.seller.approved)ctx.addIssue({code:z.ZodIssueCode.custom,message:"Review the seller profile before developing this opportunity."});
 if(!v.opportunity.evidence.some(e=>e.verified===true))ctx.addIssue({code:z.ZodIssueCode.custom,message:"At least one Radar-checked source is required."});
 if(v.opportunity.stage==="hold")ctx.addIssue({code:z.ZodIssueCode.custom,message:"This opportunity is on hold. Review its qualification before developing it."});
});
export type RadarHandoff=z.infer<typeof radarHandoffSchema>;
export function parseRadarHandoff(raw:string):RadarHandoff{
 if(new TextEncoder().encode(raw).length>MAX_HANDOFF_BYTES)throw Error("This handoff is too large. Keep the selected opportunity and seller evidence under 160 KB.");
 const result=radarHandoffSchema.safeParse(JSON.parse(raw));
 if(!result.success)throw Error(result.error.issues[0]?.message||"This is not a complete Radar handoff.");
 const mismatch=scopeIssue(result.data.seller as Parameters<typeof scopeIssue>[0],result.data.opportunity as Parameters<typeof scopeIssue>[1]);if(mismatch)throw Error(mismatch);
 return result.data;
}
export function encodeRadarHandoff(value:RadarHandoff):string{
 const parsed=parseRadarHandoff(JSON.stringify(value)),bytes=new TextEncoder().encode(JSON.stringify(parsed));
 let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);
 return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
export function decodeRadarHandoff(encoded:string):RadarHandoff{
 if(encoded.length>Math.ceil(MAX_HANDOFF_BYTES*4/3)+4||!/^[\w-]+$/.test(encoded))throw Error("The Radar handoff link is incomplete or too large. Import its JSON file instead.");
 const binary=atob(encoded.replace(/-/g,"+").replace(/_/g,"/"));
 return parseRadarHandoff(new TextDecoder("utf-8",{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));
}
export function radarHandoffUrl(value:RadarHandoff){return `${STUDIO_ORIGIN}/develop#radar=${encodeRadarHandoff(value)}`;}
