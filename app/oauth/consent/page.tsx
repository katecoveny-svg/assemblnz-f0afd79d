import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PERMISSION_LABELS: Record<string, string> = {
  'work.read': 'Read work items and their status',
  'proof.read': 'Read evidence and proof records',
  'work.create': 'Create proposed internal work items',
  'approval.request': 'Place drafts into the human approval queue',
};

type AuthDetails = {
  client?: { name?: string };
  client_name?: string;
  redirect_uri?: string;
  scope?: string;
};

type Membership = {
  tenant: string;
  permissions: string[] | null;
  is_default: boolean;
};

export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>;
}) {
  const { authorization_id: authorizationId } = await searchParams;
  if (!authorizationId) {
    return <main className="mx-auto max-w-xl px-6 py-20"><h1 className="text-2xl font-semibold">Missing authorization request</h1></main>;
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?redirect=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`);
  }

  const { data: authDetailsRaw, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
  if (error || !authDetailsRaw) {
    return <main className="mx-auto max-w-xl px-6 py-20"><h1 className="text-2xl font-semibold">This authorization request is no longer valid.</h1></main>;
  }
  const authDetails = authDetailsRaw as AuthDetails;

  const { data: membershipRows } = await supabase
    .from('mcp_tenant_memberships')
    .select('tenant, permissions, is_default')
    .eq('status', 'active');
  const memberships = (membershipRows ?? []) as Membership[];
  const membership = memberships.find((row) => row.is_default) ?? (memberships.length === 1 ? memberships[0] : null);

  const clientName = authDetails.client?.name ?? authDetails.client_name ?? 'An MCP client';
  const oauthScopes = (authDetails.scope ?? '').split(' ').filter(Boolean);

  return (
    <main className="min-h-screen bg-[#fffdfb] px-6 py-14 text-[#313c42]">
      <section className="mx-auto max-w-xl rounded-[28px] border border-black/10 bg-white p-7 shadow-sm md:p-9">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#916A70]">assembl · connect</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Allow {clientName} to use assembl?</h1>
        <p className="mt-3 text-sm leading-6 text-[#667176]">
          You stay in control. The client can only use the Assembl workspace and permissions listed below. Sending, publishing, spending and destructive external actions are not granted by this connection.
        </p>

        {membership ? (
          <>
            <div className="mt-7 rounded-2xl border border-black/10 bg-[#f8f7f5] p-5">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#7a7770]">Workspace</p>
              <p className="mt-1 text-lg font-semibold">{membership.tenant}</p>
              <div className="mt-5 space-y-2">
                {(membership.permissions ?? []).map((permission) => (
                  <div key={permission} className="flex items-start gap-3 text-sm">
                    <span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#916A70]" />
                    <span>{PERMISSION_LABELS[permission] ?? permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {oauthScopes.length > 0 && (
              <p className="mt-4 text-xs leading-5 text-[#7a7770]">
                Identity access requested: {oauthScopes.join(', ')}. These OAuth scopes identify you; Assembl workspace permissions above independently control business access.
              </p>
            )}

            <form action="/oauth/consent/decision" method="post" className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <input type="hidden" name="authorization_id" value={authorizationId} />
              <button name="decision" value="deny" className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold">Deny</button>
              <button name="decision" value="approve" className="rounded-full bg-[#240B21] px-5 py-3 text-sm font-semibold text-white">Allow connection</button>
            </form>
          </>
        ) : (
          <div className="mt-7 rounded-2xl border border-[#916A70]/30 bg-[#f5f1f2] p-5">
            <p className="font-semibold">No Assembl MCP workspace is assigned to this account yet.</p>
            <p className="mt-2 text-sm leading-6 text-[#667176]">Ask an Assembl administrator to grant workspace access before approving this connection.</p>
            <form action="/oauth/consent/decision" method="post" className="mt-5">
              <input type="hidden" name="authorization_id" value={authorizationId} />
              <button name="decision" value="deny" className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold">Return without connecting</button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
