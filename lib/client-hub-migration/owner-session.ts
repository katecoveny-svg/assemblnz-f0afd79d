import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { ownerWorkspaceEnabled } from './owner-policy';

export async function ownerSession() {
  // Off by default; do not touch auth/storage until explicitly activated.
  if (process.env.ASSEMBL_STUDIO_OWNER_WORKSPACE !== '1') return null;
  const client=await createClient();
  const {data,error}=await client.auth.getUser();
  if(error || !data.user || !ownerWorkspaceEnabled(process.env.ASSEMBL_STUDIO_OWNER_WORKSPACE,process.env.ASSEMBL_STUDIO_OWNER_ALLOWLIST,data.user))return null;
  // The operator-managed DB allowlist is authoritative even for direct RPC callers.
  // A missing table, disabled row or failed read keeps the route closed.
  const access=await client.from('studio_owner_access').select('owner_user_id').eq('owner_user_id',data.user.id).eq('enabled',true).maybeSingle();
  if(access.error || !access.data)return null;
  return {client,userId:data.user.id};
}
