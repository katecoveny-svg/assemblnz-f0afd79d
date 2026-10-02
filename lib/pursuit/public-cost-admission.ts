/** Review-only admission for the approved <=US$1 test. Not wired to public routes.
 * Haiku's documented 200K context provides a conservative bound for one
 * no-tool inference. Provider-managed search can perform hidden inference
 * passes; max_uses and count_tokens do not provide a verified total input cap.
 * Fail closed for those calls rather than treating an estimate as a ceiling.
 */
export const PUBLIC_TEST_MODEL = 'claude-haiku-4-5-20251001';
const CONTEXT_TOKENS = 200_000;
const INPUT_USD_PER_TOKEN = 1 / 1_000_000;
const OUTPUT_USD_PER_TOKEN = 5 / 1_000_000;
const MAX_CALLS = 2;
const MAX_OUTPUT_TOKENS = 5_000;
const MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const record=(value:unknown):value is Record<string,unknown>=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
function hasCacheControl(value:unknown):boolean {
 if(Array.isArray(value))return value.some(hasCacheControl);
 return record(value)&&(Object.hasOwn(value,'cache_control')||Object.values(value).some(hasCacheControl));
}
export function createPublicTestAdmission(maxUsd:number,next:typeof fetch) {
 if(!Number.isFinite(maxUsd)||maxUsd<=0||maxUsd>1)throw new Error('research_budget_invalid');
 let calls=0,reservedUpperUsd=0;
 const admitted:typeof fetch=async(url,init)=>{
  if(String(url)!==MESSAGES_URL||init?.method!=='POST'||typeof init.body!=='string'||new Headers(init.headers).has('anthropic-beta'))throw new Error('research_budget_protocol');
  let raw:unknown;try{raw=JSON.parse(init.body);}catch{throw new Error('research_budget_protocol');}
  if(!record(raw)||!['claude-haiku-4-5',PUBLIC_TEST_MODEL].includes(String(raw.model)))throw new Error('research_budget_model');
  if(Object.keys(raw).some(key=>!['model','max_tokens','system','messages','output_config','tools','service_tier'].includes(key))||hasCacheControl(raw))throw new Error('research_budget_protocol');
  if(!Number.isInteger(raw.max_tokens)||Number(raw.max_tokens)<1||Number(raw.max_tokens)>MAX_OUTPUT_TOKENS)throw new Error('research_budget_output');
  if(raw.tools!==undefined&&(!Array.isArray(raw.tools)||raw.tools.length))throw new Error('research_search_cost_bound_unverified');
  if(calls>=MAX_CALLS)throw new Error('research_budget_call_limit');
  // Count the full context and requested output separately, overestimating
  // rather than relying on the estimated preflight token-count endpoint.
  const upperUsd=CONTEXT_TOKENS*INPUT_USD_PER_TOKEN+Number(raw.max_tokens)*OUTPUT_USD_PER_TOKEN;
  const nextUpper=reservedUpperUsd+upperUsd;
  if(nextUpper>maxUsd+Number.EPSILON)throw new Error('research_budget_exceeded');
  calls++;reservedUpperUsd=nextUpper; // Never refund failed/aborted calls.
  return next(url,{...init,body:JSON.stringify({...raw,model:PUBLIC_TEST_MODEL,service_tier:'standard_only'})});
 };
 return {fetcher:admitted,receipt:()=>({model:PUBLIC_TEST_MODEL,currency:'USD' as const,maxUsd,calls,reservedUpperUsd,searchAdmitted:false as const})};
}
