import { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";
import {sellerProfileSchema,type SellerProfile} from "./radar-contract";
import {savedRadarRunSchema,type SavedRadarRun} from "./radar-client";
import type {RadarContext} from "./radar-hub-contract";
async function read(response:Response){const data=await response.json() as Record<string,any>;if(!response.ok)throw Error(data.error||"The research workspace could not connect.");return data;}
export async function hubRadarWorkspace(context:RadarContext,profileId?:string,status=false){
 const q=new URLSearchParams({...context,...(profileId?{profileId}:{}),...(status?{status:"1"}:{})});
 const d=await read(await fetch(`/api/radar/workspace?${q}`));
 return {profiles:d.profiles.map((p:unknown)=>sellerProfileSchema.parse(p)) as SellerProfile[],runs:d.runs.map((r:unknown)=>savedRadarRunSchema.parse(r)) as SavedRadarRun[],pending:d.pending as Array<{runId:string;status:string;error?:string}>,ready:d.ready===true,serviceNote:String(d.serviceNote||"")};
}
export async function saveHubRadarProfile(profile:SellerProfile){const d=await read(await fetch("/api/radar/workspace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(profile)}));return sellerProfileSchema.parse(d.profile);}
export async function runHubRadar(mission:string,sellerProfileId:string,context:RadarContext,onStage?:(stage:string)=>void,runId=crypto.randomUUID()){
 for(let i=0;i<16;i++){
  const d=await read(await fetch("/api/radar/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mission,sellerProfileId,context,runId})}));
  if(d.status==="ready"&&d.runId===runId){onStage?.(d.stage);continue;}
  return savedRadarRunSchema.parse(d);
 }
 throw Error("Research is saved partway through. Refresh saved runs to continue.");
}
