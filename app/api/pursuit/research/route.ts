import {createHash} from 'node:crypto';
import {ZodError} from 'zod';
import {TrialInput,containsCredential} from '@/lib/pursuit/public-contract';
import {runPublicResearch} from '@/lib/pursuit/public-research';
import {publicFailureCode} from '@/lib/pursuit/public-response';
import {trialPolicy,trialUsage,nextTrialReset,storageConfigured,requestPrincipal,reserveTrial,completeTrial,failTrial,countPublicTool,noStore} from '@/lib/pursuit/public-store';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=120;
export async function GET(request: Request) {
 const [policy, usage] = await Promise.all([trialPolicy(), trialUsage(requestPrincipal(request))]);
 const configured = Boolean(process.env.ANTHROPIC_API_KEY);
 const available = Boolean(policy?.enabled && configured);
 const globalRemaining = policy && usage ? Math.max(0, policy.global_daily_limit - usage.global) : undefined;
 const clientRemaining = policy && usage ? Math.max(0, policy.client_daily_limit - usage.client) : undefined;
 const exhausted = globalRemaining === 0 || clientRemaining === 0;
 const message = !available ? 'Live research is temporarily unavailable. Please try again later.'
  : globalRemaining === 0 ? 'Today’s public research allowance has been used. It resets at 00:00 UTC.'
  : clientRemaining === 0 ? 'Your network’s daily research allowance has been used. It resets at 00:00 UTC.'
  : clientRemaining !== undefined ? `${clientRemaining} of ${policy.client_daily_limit} free attempts left for your network today. ${globalRemaining} left site-wide. Resets at 00:00 UTC.`
  : 'Public research is available. A daily allowance applies.';
 return Response.json({ready:available&&!exhausted,message,providerConfigured:configured,storageConfigured:storageConfigured(),trialEnabled:Boolean(policy?.enabled),typesafeReady:Boolean(policy?.enabled&&policy?.typesafe_enabled&&process.env.TYPESAFE_API_KEY),mode:'public_source_trial',publicKnowledge:true,privateKnowledge:false,paid:false,limits:{globalDaily:policy?.global_daily_limit??0,perClientDaily:policy?.client_daily_limit??0,globalRemaining,clientRemaining,resetsAt:nextTrialReset()},retention:'Research results are stored privately for safe retries and abuse control. Raw IP addresses and original prompts are not stored by this endpoint. Retention cleanup must be verified before public activation.',docs:'/tools/agents'},{headers:noStore});
}
export async function POST(request:Request){let id='',principal='';try{
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return Response.json({error:'Open the research canvas on this site.'},{status:403,headers:noStore});
 if(!(request.headers.get('content-type')??'').startsWith('application/json'))return Response.json({error:'JSON required.'},{status:415,headers:noStore});
 const reader=request.body?.getReader();let bytes=0;const chunks:Uint8Array[]=[];if(!reader)throw new Error('invalid_input');
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>6000){await reader.cancel();return Response.json({error:'Keep the brief below 700 characters.'},{status:413,headers:noStore});}chunks.push(value);}
 let raw:unknown;try{raw=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return Response.json({error:'Invalid JSON.'},{status:400,headers:noStore});}
 const input=TrialInput.safeParse(raw);if(!input.success||containsCredential(`${input.data?.company??''} ${input.data?.goal??''}`))return Response.json({error:'Add a company and a short public brief. Do not include credentials or private information.'},{status:400,headers:noStore});
 if(!process.env.ANTHROPIC_API_KEY)return Response.json({error:'Live research is not configured on this deployment. No sample result has been substituted.'},{status:503,headers:noStore});
 principal=requestPrincipal(request);const hash=createHash('sha256').update(JSON.stringify(input.data)).digest('hex');const reservation=await reserveTrial(input.data.requestId,principal,hash);
 if(reservation.status==='replay')return Response.json(reservation.result,{headers:noStore});
 if(reservation.status!=='reserved'){const resetsAt=nextTrialReset();const limited=['daily_limit','client_limit'].includes(reservation.status);return Response.json({error:limited?(reservation.status==='client_limit'?'Your network’s daily research allowance has been used. It resets at 00:00 UTC.':'Today’s site-wide research allowance has been used. It resets at 00:00 UTC.'):reservation.status==='disabled'?'Live research is not enabled yet.':'This request is already being handled. Start a new brief to try again.',code:reservation.status,...(limited?{resetsAt}:{})},{status:limited?429:reservation.status==='disabled'?503:409,headers:{...noStore,...(limited?{'Retry-After':String(Math.ceil((Date.parse(resetsAt)-Date.now())/1000))}:{})}});}
 id=input.data.requestId;const result=await runPublicResearch(input.data,Boolean(reservation.typesafeEnabled));await completeTrial(id,principal,result);await countPublicTool('public_pursuit_complete');return Response.json(result,{headers:noStore});
 }catch(error:unknown){const code=publicFailureCode(error);if(error instanceof ZodError)console.warn('public_research_validation',{requestId:id,issues:error.issues.map(issue=>({path:issue.path,code:issue.code}))});if(id){await failTrial(id,principal,code);await countPublicTool('public_pursuit_failed');}return Response.json({error:'The research could not be completed with a saved source trail. No invented result has been substituted. Please try again later.',code,requestId:id||undefined},{status:503,headers:noStore});}
}
