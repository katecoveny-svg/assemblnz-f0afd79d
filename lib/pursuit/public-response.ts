/** Parse a single draft object without treating provider prose as executable code.
 * Server-tool replies may include a search preamble before their JSON answer.
 * Schema validation and evidence-source validation still happen afterwards.
 */
export function readPublicDraftJson(text:string):unknown{
 if(text.length>50000)throw new Error('research_output_too_large');
 const found:unknown[]=[];let start=-1,depth=0,inString=false,escaped=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(start<0){if(ch==='{'){start=i;depth=1;inString=false;escaped=false;}continue;}
  if(inString){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inString=false;continue;}
  if(ch==='"'){inString=true;continue;}if(ch==='{')depth++;if(ch==='}')depth--;
  if(depth===0){const part=text.slice(start,i+1);start=-1;try{const value=JSON.parse(part);if(value&&typeof value==='object'&&!Array.isArray(value)&&'company' in value&&'title' in value&&'evidence' in value)found.push(value);}catch{/* Ignore non-JSON commentary, not a malformed draft. */}}
 }
 if(found.length!==1)throw new Error(found.length>1?'research_ambiguous_json':'research_invalid_json');
 return found[0];
}
const errors=new Set(['research_provider_unavailable','research_protocol_error','research_search_limit','no_verified_search_result','research_output_too_large','research_invalid_json','research_ambiguous_json','storage_unavailable','receipt_not_saved']);
/** Fixed codes only. Never include prompts, provider responses or credentials. */
export function publicFailureCode(error:unknown):string{
 if(error instanceof Error){if(errors.has(error.message))return error.message;if(/^research_provider_http_(400|401|403|404|408|409|429|500|502|503|504)$/.test(error.message))return error.message;if(error.name==='ZodError')return 'research_schema_rejected';if(error.name==='TimeoutError'||error.name==='AbortError')return 'research_timeout';if(error instanceof SyntaxError)return 'research_invalid_json';if(error.message==='unsupported_evidence_url')return 'research_untraced_source';}
 return 'research_unavailable';
}
