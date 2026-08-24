import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const decision = formData.get('decision');
  const authorizationId = formData.get('authorization_id');

  if (typeof authorizationId !== 'string' || !authorizationId) {
    return NextResponse.json({ error: 'Missing authorization_id' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`, request.url),
      303,
    );
  }

  if (decision === 'approve') {
    // Do not approve identity access unless the account has an active Assembl
    // MCP workspace. This keeps OAuth consent and business authorization aligned.
    const { data: memberships } = await supabase
      .from('mcp_tenant_memberships')
      .select('tenant, is_default')
      .eq('status', 'active');
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'No Assembl MCP workspace access is assigned to this account.' }, { status: 403 });
    }
    if (memberships.length > 1 && !memberships.some((row) => row.is_default)) {
      return NextResponse.json({ error: 'Multiple MCP workspaces exist; an administrator must mark one as default.' }, { status: 409 });
    }

    const { data, error } = await supabase.auth.oauth.approveAuthorization(authorizationId);
    if (error || !data?.redirect_url) {
      return NextResponse.json({ error: error?.message ?? 'Could not approve OAuth request.' }, { status: 400 });
    }
    return NextResponse.redirect(data.redirect_url, 303);
  }

  const { data, error } = await supabase.auth.oauth.denyAuthorization(authorizationId);
  if (error || !data?.redirect_url) {
    return NextResponse.json({ error: error?.message ?? 'Could not deny OAuth request.' }, { status: 400 });
  }
  return NextResponse.redirect(data.redirect_url, 303);
}
