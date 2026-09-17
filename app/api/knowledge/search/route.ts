import {searchPublicKnowledge,PUBLIC_KNOWLEDGE_VERSION} from '@/lib/pursuit/public-knowledge';
import {countPublicTool} from '@/lib/pursuit/public-store';
export async function GET(request:Request){
  const q=new URL(request.url).searchParams.get('q')?.trim()??'';
  if(q.length<2||q.length>300)return Response.json({error:'Provide q with 2–300 characters.'},{status:400});
  const recorded=await countPublicTool('knowledge_search');
  return Response.json({scope:'owned_public',version:PUBLIC_KNOWLEDGE_VERSION,records:searchPublicKnowledge(q),privateKnowledge:false,paid:false,usageRecorded:recorded},{headers:{'Cache-Control':'no-store'}});
}
