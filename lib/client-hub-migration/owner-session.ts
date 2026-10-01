import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { ownerWorkspaceEnabled } from './owner-policy';

export async function ownerSession() {
  // Off by default; do not touch auth/storage until explicitly activated.
  if (process.env.ASSEMBL_STUDIO_OWNER_WORKSPACE !== '1') return null;
  const client=await createClient();
  const {data,error}=await client.auth.getUser();
  if(error || !data.user || !ownerWorkspaceEnabled(process.env.ASSEMBL_STUDIO_OWNER_WORKSPACE,process.env.ASSEMBL_STUDIO_OWNER_ALLOWLIST,data.user))return null;
  return {client,userId:data.user.id};
}
