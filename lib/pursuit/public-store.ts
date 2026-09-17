import 'server-only';
import {createHmac} from 'node:crypto';
import type {PublicResearchResult} from './public-contract';
const noStore={'Cache-Control':'no-store'};
export {noStore};
export function storageConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);}
async function db(path:string,method='GET',body?:unknown){
  if(!storageConfigured())throw new Error('storage_unavailable');
  const response=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`,{method,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(5000),headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY!,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,'Content-Type':'application/json',Prefer:'return=representation'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  if(!response.ok)throw new Error('storage_unavailable');
  return response.status===204?null:response.json();
}
export async function trialPolicy(){
  try{const rows=await db('pursuit_public_policy?id=eq.true&select=enabled,typesafe_enabled,global_daily_limit,client_daily_limit');return Array.isArray(rows)?rows[0]??null:null;}catch{return null;}
}
export function requestPrincipal(request:Request){
  const ip=request.headers.get('x-vercel-forwarded-for')??request.headers.get('x-forwarded-for')??'unavailable';
  return createHmac('sha256',process.env.PURSUIT_TRIAL_HASH_SECRET??process.env.SUPABASE_SERVICE_ROLE_KEY??'local-unconfigured').update(`public-pursuit:v1:${ip.split(',')[0].trim()}`).digest('hex');
}
export async function reserveTrial(id:string,principal:string,inputHash:string):Promise<{status:string;result?:PublicResearchResult;typesafeEnabled?:boolean}>{
  return db('rpc/reserve_public_pursuit','POST',{p_id:id,p_principal:principal,p_input_hash:inputHash});
}
export async function completeTrial(id:string,principal:string,result:PublicResearchResult){
  const rows=await db(`pursuit_public_runs?id=eq.${encodeURIComponent(id)}&principal_hash=eq.${principal}&state=eq.pending`,'PATCH',{state:'complete',completed_at:new Date().toISOString(),result,trace:result.trace});
  if(!Array.isArray(rows)||rows.length!==1)throw new Error('receipt_not_saved');
}
export async function failTrial(id:string,principal:string){
  await db(`pursuit_public_runs?id=eq.${encodeURIComponent(id)}&principal_hash=eq.${principal}&state=eq.pending`,'PATCH',{state:'failed',completed_at:new Date().toISOString(),trace:{error:'research_unavailable'}}).catch(()=>undefined);
}
export async function countPublicTool(tool:string){
  try{await db('rpc/count_public_tool','POST',{p_tool:tool});return true;}catch{return false;}
}
