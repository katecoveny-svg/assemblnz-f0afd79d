/** Native server-search responses interleave progress text, tools and final text.
 * Parse the final structured record without accepting pre-search narrative as JSON.
 * Validation and source matching still run after this framing step.
 */
export function parseResearchJson(text: string): unknown {
  const cleaned=text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  const start=cleaned.indexOf('{');
  if(start<0||cleaned.length>40000)throw new SyntaxError('research_json_invalid');
  let depth=0,quoted=false,escaped=false,end=-1;
  for(let i=start;i<cleaned.length;i++){
    const c=cleaned[i];
    if(quoted){if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}if(c==='"')quoted=false;continue;}
    if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end=i+1;break;}
  }
  if(end<0||cleaned.slice(end).trim().replace(/^```$/,'').trim())throw new SyntaxError('research_json_invalid');
  return JSON.parse(cleaned.slice(start,end));
}
export function finalSearchText(blocks: unknown[]): string {
  let pieces:string[]=[];
  for(const block of blocks){
    if(!block||typeof block!=='object'||Array.isArray(block))continue;
    const b=block as Record<string,unknown>;
    if(b.type==='server_tool_use'||b.type==='web_search_tool_result')pieces=[];
    else if(b.type==='text'&&typeof b.text==='string')pieces.push(b.text);
  }
  // Citation boundaries can split a JSON string: do not insert unescaped newlines.
  return pieces.join('').trim();
}
