import { ownerSession } from '@/lib/client-hub-migration/owner-session';
import { ownerRecord, parseOwnerDraft } from '@/lib/client-hub-migration/owner-policy';
import { z } from 'zod';

export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET(request:Request) {
  try {
    const session=await ownerSession();if(!session)return reply({error:'Workspace unavailable.'},404);
    const id=new URL(request.url).searchParams.get('id');
    if(id&&!z.uuid().safeParse(id).success)return reply({error:'Workspace unavailable.'},404);
    let query=session.client.from('studio_owner_drafts').select('id,revision,updated_at,payload').eq('owner_user_id',session.userId);
    if(id)query=query.eq('id',id);
    const {data,error}=await query.order('updated_at',{ascending:false}).limit(id?1:100);
    if(error)return reply({error:'Owner storage is not ready. Your current draft is unchanged.'},503);
    if(id)return data?.[0]?reply({item:ownerRecord(data[0])}):reply({error:'Workspace unavailable.'},404);
    return reply({items:(data||[]).map(row=>{const r=ownerRecord(row);return {id:r.id,revision:r.revision,name:r.payload.name,seller:r.payload.seller,buyer:r.payload.buyer};})});
  }catch{return reply({error:'Owner storage unavailable.'},503);}
}
export async function POST(request:Request) {
  // No cross-origin writes; cookie session is verified independently below.
  if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin rejected.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required.'},415);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>1800000)return reply({error:'Draft too large.'},413);
  let body:ReturnType<typeof parseOwnerDraft>;
  try{body=parseOwnerDraft(JSON.parse(raw));}catch{return reply({error:'Invalid draft or revision.'},400);}
  try {
    const session=await ownerSession();if(!session)return reply({error:'Workspace unavailable.'},404);
    const {data,error}=await session.client.rpc('studio_save_owner_draft',{p_id:body.id??null,p_revision:body.revision,p_payload:body.payload});
    if(error)return reply({error:'Owner storage is not ready. Your current draft is unchanged.'},503);
    if(!data?.[0])return reply({error:'Draft unavailable or revision changed. Reopen before saving.'},409);
    return reply({item:ownerRecord(data[0])});
  }catch{return reply({error:'Owner storage unavailable.'},503);}
}
