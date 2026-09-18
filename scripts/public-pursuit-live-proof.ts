/** One bounded live test through the public endpoint. No private input or keys.
 * The database independently limits the whole trial to three attempts/day.
 * Do not turn this into polling or repeatedly retry a failed provider call.
 */
import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Draft,type PublicResearchResult} from '../lib/pursuit/public-contract';
import {buildPitchHtml} from '../lib/pursuit/pitch-export';
const root='https://www.assembl.co.nz';
const out='visual-evidence/live-pursuit';
const proof:Record<string,unknown>={startedAt:new Date().toISOString(),mode:'real public endpoint',privateInput:false,chargesToVisitors:false};
async function json(path:string,body?:unknown){const response=await fetch(root+path,{method:body===undefined?'GET':'POST',redirect:'error',signal:AbortSignal.timeout(body===undefined?20000:100000),headers:{'Content-Type':'application/json','Accept':'application/json,text/event-stream',Origin:root},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await response.json();if(!response.ok)throw new Error(`HTTP ${response.status}: ${String(data.error??'Request failed')}`);return data;}
async function main(){
 await mkdir(out,{recursive:true});
 const status=await json('/api/pursuit/research');proof.availability=status;
 assert.equal(status.ready,true,'Trial must be explicitly enabled before this one test');
 assert.ok(status.limits.globalDaily<=3&&status.limits.perClientDaily<=1,'Do not run against an uncapped trial');
 const knowledge=await json('/api/knowledge/search?q=Pursuit%20Studio');proof.knowledge=knowledge;
 assert.equal(knowledge.charged,false);assert.equal(knowledge.privateKnowledgeSearched,false);assert.ok(knowledge.results.length>0);
 const init=await json('/api/knowledge/mcp',{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',clientInfo:{name:'assembl-owned-live-proof',version:'1.0.0'},capabilities:{}}});assert.ok(init.result);proof.mcpInitialization=init;
 const tool=await json('/api/knowledge/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'search_assembl_public_knowledge',arguments:{query:'Pursuit Studio'}}});assert.ok(tool.result&&!tool.result.isError,'Public MCP search must return a successful tool result');proof.mcpSearch=tool;
 const input={requestId:randomUUID(),company:'Bunnings New Zealand',goal:'Use official public sources to identify one small trade-customer journey demonstrator Assembl could propose. Separate established facts from assumptions. Do not imply Bunnings is a client, has a budget or has requested this work.',consent:true,useTypeSafe:false};
 proof.requestId=input.requestId;
 await writeFile(out+'/status.json',JSON.stringify(proof,null,2));
 const result=await json('/api/pursuit/research',input) as PublicResearchResult;
 Draft.parse(result.draft);assert.equal(result.mode,'live');assert.equal(result.trace.id,input.requestId);assert.ok(result.trace.webSearches>0);assert.ok(result.trace.providerCalls>0);assert.ok(result.trace.knowledgeIds.length>0);assert.ok(result.trace.sources.length>0);assert.equal(result.trace.persisted,true);
 const urls=new Set(result.trace.sources.map(s=>s.url));for(const evidence of result.draft.evidence)assert.ok(urls.has(evidence.url),'Every evidence URL needs a returned search source');
 await writeFile(out+'/bunnings-independent-research.json',JSON.stringify(result,null,2));
 const deck=buildPitchHtml(result);assert.equal((deck.match(/<section id="slide-/g)??[]).length,6);assert.ok(!deck.includes('<script'));
 await writeFile(out+'/bunnings-independent-pitch.html',deck);
 const replay=await json('/api/pursuit/research',input);assert.deepEqual(replay,result,'Replay must return the persisted result, not rerun the provider');
 proof.passed=true;proof.completedAt=new Date().toISOString();proof.trace=result.trace;proof.replay='identical persisted response';
 await writeFile(out+'/status.json',JSON.stringify(proof,null,2));
 console.log(JSON.stringify({passed:true,requestId:input.requestId,model:result.trace.model,webSearches:result.trace.webSearches,knowledgeIds:result.trace.knowledgeIds,sourceCount:result.trace.sources.length,replay:proof.replay}));
}
main().catch(async(error:unknown)=>{proof.passed=false;proof.error=error instanceof Error?error.message:'Unknown failure';await mkdir(out,{recursive:true});await writeFile(out+'/status.json',JSON.stringify(proof,null,2));console.error(proof.error);process.exitCode=1;});
