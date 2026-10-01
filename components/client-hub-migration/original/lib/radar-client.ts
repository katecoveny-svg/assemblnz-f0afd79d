import { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import {z} from "zod/v3";
import {sellerProfileSchema,radarOpportunitySchema,radarHandoffSchema,parseRadarHandoff,type SellerProfile} from "./radar-contract";

import {radarContextSchema} from "./radar-hub-contract";
import type {IdeaBoardState} from "./idea-board";

export const savedRadarRunSchema=z.object({
 runId:z.string().uuid(),generatedAt:z.string().datetime({offset:true}),mission:z.string().max(4000),
 context:radarContextSchema.optional(),seller:sellerProfileSchema,opportunities:z.array(radarOpportunitySchema).max(12),
}).strict();
export type SavedRadarRun=z.infer<typeof savedRadarRunSchema>;
let client:Promise<SupabaseClient>|undefined;
export function radarClient(){
 if(!client)client=(async()=>{
  const response=await fetch("/api/radar/config"),raw=await response.json();
  if(!response.ok)throw Error(z.object({error:z.string()}).safeParse(raw).data?.error||"Radar could not connect.");
  const parsed=z.object({url:z.literal("https://wurwcrgxjjwqdaxqceey.supabase.co"),publishableKey:z.string().startsWith("sb_publishable_")}).safeParse(raw);
  if(!parsed.success)throw Error("Check the Radar connection settings.");
  const config=parsed.data;
  return createClient(config.url,config.publishableKey,{auth:{storageKey:"assembl-pursuit-radar-session",persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 })().catch(error=>{client=undefined;throw error;});
 return client;
}
export async function loadRadarWorkspace(db:SupabaseClient,userId:string){
 const [profiles,runs]=await Promise.all([
  db.from("pursuit_seller_profiles").select("profile").eq("user_id",userId).order("updated_at",{ascending:false}).limit(100),
  db.from("pursuit_radar_runs").select("payload").eq("user_id",userId).order("generated_at",{ascending:false}).limit(30),
 ]);
 if(profiles.error||runs.error)throw Error("Saved intelligence could not load. Reconnect your account or try again.");
 return {profiles:(profiles.data||[]).map(row=>sellerProfileSchema.parse(row.profile)),runs:(runs.data||[]).map(row=>savedRadarRunSchema.parse(row.payload))};
}
export async function loadRadarCompanyRuns(db:SupabaseClient,userId:string,profileId:string){
 const result=await db.from("pursuit_radar_runs").select("payload").eq("user_id",userId).eq("payload->seller->>id",profileId).order("generated_at",{ascending:false}).limit(30);
 if(result.error)throw Error("This company's saved research could not load. Retry before starting another run.");
 return (result.data||[]).map(row=>savedRadarRunSchema.parse(row.payload));
}
export async function saveRadarProfile(db:SupabaseClient,userId:string,profile:SellerProfile){
 const parsed=sellerProfileSchema.parse(profile);
 const result=await db.from("pursuit_seller_profiles").upsert({id:parsed.id,user_id:userId,profile:parsed,updated_at:new Date().toISOString()}).select("profile").single();
 if(result.error||!result.data)throw Error("Your company profile could not be saved. Your edits are still here.");
 return sellerProfileSchema.parse(result.data.profile);
}
export function radarPacket(run:SavedRadarRun,opportunityId:string){
 const saved=savedRadarRunSchema.parse(run);
 return parseRadarHandoff(JSON.stringify({schemaVersion:1,kind:"assembl.radar-pursuit",runId:saved.runId,generatedAt:saved.generatedAt,
  mission:saved.mission,seller:saved.seller,opportunity:saved.opportunities.find(o=>o.id===opportunityId)}));
}
export async function developRadarOpportunity(run:SavedRadarRun,opportunityId:string,board?:IdeaBoardState){
 const packet=radarPacket(run,opportunityId);
 const response=await fetch("/api/radar-handoff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(board?{packet,board}:packet)});
 const result=await response.json();if(!response.ok)throw Error(z.object({error:z.string()}).safeParse(result).data?.error||"The opportunity could not open. Your research is saved.");
 const saved=z.object({id:z.string().uuid()}).safeParse(result);
 if(!saved.success)throw Error("The saved pursuit could not be identified.");
 return saved.data.id;
}
