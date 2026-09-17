import {z} from 'zod';
import {searchPublicKnowledge,PUBLIC_KNOWLEDGE_VERSION} from '@/lib/pursuit/public-knowledge';
import {countPublicTool} from '@/lib/pursuit/public-store';
export const runtime='nodejs';export const dynamic='force-dynamic';
const versions=['2025-03-26','2025-06-18','2025-11-25'];
const Query=z.object({query:z.string().trim().min(2).max(300)}).strict();
const Message=z.object({jsonrpc:z.literal('2.0'),id:z.union([z.string().max(100),z.number()]).optional(),method:z.string().max(80),params:z.record(z.string(),z.unknown()).optional()}).strict();
const headers={'Cache-Control':'no-store','Content-Type':'application/json'};
function validOrigin(r:Request){const o=r.headers.get('origin');return !o||o===new URL(r.url).origin;}
function failure(id:unknown,code:number,message:string,status=400){return Response.json({jsonrpc:'2.0',id:id??null,error:{code,message}},{status,headers});}
/** Stateless public read-only MCP. No private data, paid provider or execution tool. */
export async function POST(request:Request){
 if(!validOrigin(request))return failure(null,-32600,'Origin is not allowed.',403);
 const version=request.headers.get('mcp-protocol-version');if(version&&!versions.includes(version))return failure(null,-32600,'Unsupported protocol version.');
 if(!(request.headers.get('content-type')??'').includes('application/json'))return failure(null,-32600,'JSON required.',415);
 const reader=request.body?.getReader();if(!reader)return failure(null,-32600,'Request body required.');let bytes=0;const chunks:Uint8Array[]=[];
 while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>4096){await reader.cancel();return failure(null,-32600,'Request too large.',413);}chunks.push(r.value);}
 let raw:unknown;try{raw=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return failure(null,-32700,'Invalid JSON.');}
 const parsed=Message.safeParse(raw);if(!parsed.success)return failure(null,-32600,'Invalid request.');const m=parsed.data;
 if(m.id===undefined)return new Response(null,{status:202,headers:{'Cache-Control':'no-store'}});
 const answer=(result:unknown)=>Response.json({jsonrpc:'2.0',id:m.id,result},{headers});
 if(m.method==='initialize'){
  await countPublicTool('mcp_initialize');const requested=String(m.params?.protocolVersion??'');
  return answer({protocolVersion:versions.includes(requested)?requested:'2025-11-25',capabilities:{tools:{listChanged:false}},serverInfo:{name:'assembl-public-knowledge',version:'1.0.0'},instructions:'Read-only published Assembl product knowledge. Not a private client knowledge base. No paid tool is exposed here.'});
 }
 if(m.method==='ping')return answer({});
 if(m.method==='tools/list'){
  await countPublicTool('mcp_tools_list');return answer({tools:[{name:'search_assembl_public_knowledge',description:'Find published information about Assembl Pursuit, DO, Studio and customer journeys. Use before describing Assembl capabilities. Returns owned public records with URLs and version, not private client data or a complete NZ regulatory corpus.',inputSchema:{type:'object',properties:{query:{type:'string',minLength:2,maxLength:300}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}}]});
 }
 if(m.method==='tools/call'){
  if(m.params?.name!=='search_assembl_public_knowledge')return failure(m.id,-32602,'Unknown public tool.');
  const q=Query.safeParse(m.params.arguments);if(!q.success)return failure(m.id,-32602,'Use a query between 2 and 300 characters.');
  const results=searchPublicKnowledge(q.data.query,6);const recorded=await countPublicTool('mcp_knowledge_search');const result={version:PUBLIC_KNOWLEDGE_VERSION,scope:'owned_public',privateKnowledgeSearched:false,charged:false,usageRecorded:recorded,results};
  return answer({content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result,isError:false});
 }
 return failure(m.id,-32601,'Method not found.',200);
}
export async function GET(request:Request){if(!validOrigin(request))return failure(null,-32600,'Origin is not allowed.',403);return new Response(null,{status:405,headers:{Allow:'POST','Cache-Control':'no-store'}});}
