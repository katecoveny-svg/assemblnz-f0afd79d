import {searchPublicKnowledge,PUBLIC_KNOWLEDGE_VERSION} from '@/lib/pursuit/public-knowledge';
import {countPublicTool} from '@/lib/pursuit/public-store';
export const dynamic='force-dynamic';
export async function GET(request:Request){const q=new URL(request.url).searchParams.get('q')?.trim()??'';if(q.length<2||q.length>300)return Response.json({error:'Use a query between 2 and 300 characters.'},{status:400});const records=searchPublicKnowledge(q,6);const recorded=await countPublicTool('knowledge_search');return Response.json({version:PUBLIC_KNOWLEDGE_VERSION,scope:'owned_public',privateKnowledgeSearched:false,results:records,usageRecorded:recorded,charged:false},{headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});}
