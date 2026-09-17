import {createHash} from 'node:crypto';
import {TrialInput,containsCredential} from '@/lib/pursuit/public-contract';
import {runPublicResearch} from '@/lib/pursuit/public-research';
import {trialPolicy,storageConfigured,requestPrincipal,reserveTrial,completeTrial,failTrial,countPublicTool,noStore} from '@/lib/pursuit/public-store';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=90;
export async function GET(){const policy=await trialPolicy();const configured=Boolean(process.env.ANTHROPIC_API_KEY);return Response.json({ready:Boolean(policy?.enabled&&configured),providerConfigured:configured,storageConfigured:storageConfigured(),trialEnabled:Boolean(policy?.enabled),typesafeReady:Boolean(policy?.typesafe_enabled&&process.env.TYPESAFE_API_KEY&&process.env.TYPESAFE_MODEL),mode:'public_source_trial',publicKnowledge:true,privateKnowledge:false,paid:false,limits:{globalDaily:policy?.global_daily_limit??0,perClientDaily:policy?.client_daily_limit??0},retention:'The saved draft and source trail expire after seven days and are deleted by a daily cleanup. The original prompt and raw IP are not stored.',docs:'/tools/agents'},{headers:noStore});}
export async function POST(request:Request){
 let id='',principal='';
 try{
  const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return Response.json({error:'Open the research canvas on this site.'},{status:403,headers:noStore});
  if(!(request.headers.get('content-type')??'').startsWith('application/json'))return Response.json({error:'JSON required.'},{status:415,headers:noStore});
  const reader=request.body?.getReader();let bytes=0;const chunks:Uint8Array[]=[];
  if(!reader)return Response.json({error:'A company and public brief are required.'},{status:400,headers:noStore});
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>6000){await reader.cancel();return Response.json({error:'Keep the brief below 700 characters.'},{status:413,headers:noStore});}chunks.push(value);}
  let raw:unknown;try{raw=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return Response.json({error:'Invalid JSON.'},{status:400,headers:noStore});}
  const input=TrialInput.safeParse(raw);
  if(!input.success||containsCredential(`${input.data?.company??''} ${input.data?.goal??''}`))return Response.json({error:'Use a short public brief. Do not include credentials or private information.'},{status:400,headers:noStore});
  if(!process.env.ANTHROPIC_API_KEY)return Response.json({error:'Live research is not configured. No sample result has been substituted.'},{status:503,headers:noStore});
  principal=requestPrincipal(request);const hash=createHash('sha256').update(JSON.stringify(input.data)).digest('hex');
  const reservation=await reserveTrial(input.data.requestId,principal,hash);
  if(reservation.status==='replay')return Response.json(reservation.result,{headers:noStore});
  if(reservation.status!=='reserved'){
   const limited=['daily_limit','client_limit'].includes(reservation.status);
   return Response.json({error:limited?'The free research limit has been reached. Try tomorrow or contact assembl.':reservation.status==='disabled'?'Live research is not enabled yet.':'This request has already been handled. Start a new brief to try again.',code:reservation.status},{status:limited?429:reservation.status==='disabled'?503:409,headers:noStore});
  }
  id=input.data.requestId;const result=await runPublicResearch(input.data,Boolean(reservation.typesafeEnabled));await completeTrial(id,principal,result);await countPublicTool('public_pursuit_complete');return Response.json(result,{headers:noStore});
 }catch{
  if(id){await failTrial(id,principal);await countPublicTool('public_pursuit_failed');}
  return Response.json({error:'Research could not be completed with a saved source trail. No invented result has been substituted.'},{status:503,headers:noStore});
 }
}
