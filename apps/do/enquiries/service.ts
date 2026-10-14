import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';
import { isFounderAdminEmail } from '@/lib/admin/ensureAdmin';
import { sendAgentEmail } from '@/lib/agent-email/send';
import { enquiryFunnel, type EnquiryInput, type EnquiryJob } from './contract';

export class EnquiryError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}
export async function requireEnquiryOwner(owner: string) {
  const { data, error } = await getServiceClient().auth.admin.getUserById(owner);
  const user = data?.user;
  if (error || !user || user.is_anonymous || !user.email_confirmed_at || !isFounderAdminEmail(user.email ?? ''))
    throw new EnquiryError('DO Enquiries is a private assembl founder pilot.', 403);
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function enquiryTransportReady() {
  return Boolean(process.env.BREVO_API_KEY) && process.env.DO_ENQUIRY_SEND_DISABLED !== 'true';
}
async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await getServiceClient().rpc(name, args);
  if (error) {
    const known = ['review_changed', 'not_found', 'daily_limit', 'source_conflict', 'followup_no_longer_needed', 'send_not_confirmed'];
    if (known.includes(error.message)) throw new EnquiryError(error.message, error.message === 'not_found' ? 404 : 409);
    throw new EnquiryError('The job could not be saved. Refresh before trying again.', 503);
  }
  return data;
}
export async function receiveEnquiry(owner: string, input: EnquiryInput, source: 'owner' | 'webhook' | 'plugin') {
  return await rpc('do_enquiry_receive', {
    p_owner: owner, p_key: `${source}:${input.requestId}`, p_hash: hash(JSON.stringify(input)),
    p_input: { ...input, source, subject: 'Your enquiry to assembl', body: `Kia ora ${input.name},\n\nThanks for getting in touch. We have received your enquiry and would like to understand what you need. What would a useful next step look like for you?\n\nThe assembl team` },
  }) as EnquiryJob;
}
export async function transitionEnquiry(owner: string, id: string, action: string, input: Record<string, unknown> = {}) {
  return await rpc('do_enquiry_transition', { p_owner: owner, p_id: id, p_action: action, p_input: input }) as EnquiryJob;
}
export async function approveEnquiry(owner: string, id: string, revision: string) {
  if (!enquiryTransportReady()) throw new EnquiryError('Email sending is not configured on this deployment.', 503);
  // A durable row lock claims this exact reviewed revision BEFORE any network
  // call. A repeated click, timeout or server restart cannot resend it.
  const job = await transitionEnquiry(owner, id, 'approve', { revision, source: 'owner' });
  const result = await sendAgentEmail({ agentSlug: 'front', agentName: 'assembl', toEmail: job.email, subject: job.subject, body: job.body, timeoutMs: 20_000 });
  const status = result.ok && result.messageId ? 'sent' : !result.ok && result.definitiveRejection ? 'failed' : 'uncertain';
  // If this persistence fails, the durable job remains `sending`. Never retry
  // transport automatically: reconcile with Brevo's log before any further send.
  return transitionEnquiry(owner, id, 'finish', {
    revision, source: 'brevo', status,
    providerId: result.ok ? result.messageId : null,
    detail: status === 'sent' ? 'Brevo accepted the message. Delivery, reply and booking are not yet confirmed.'
      : status === 'failed' ? 'The provider rejected the request. No automatic retry.'
        : 'The provider result is uncertain. Check the provider log; this job will not resend.',
  });
}
export async function enquiryState(owner: string) {
  const db = getServiceClient();
  const [jobs, connection, worker, plugin] = await Promise.all([
    db.from('do_enquiry_jobs').select('*').eq('owner_id', owner).order('received_at', { ascending: false }).limit(200),
    db.from('do_enquiry_connections').select('created_at').eq('owner_id', owner).maybeSingle(),
    db.from('do_personal_worker').select('last_seen_at').eq('id', true).maybeSingle(),
    db.from('mcp_tenant_memberships').select('status').eq('user_id', owner).eq('tenant', `do-enquiries:${owner}`).maybeSingle(),
  ]);
  if (jobs.error || connection.error || worker.error || plugin.error) throw new EnquiryError('Your saved enquiries could not be loaded.', 503);
  const rows = jobs.data as EnquiryJob[];
  return { jobs: rows, funnel: enquiryFunnel(rows), window: 'Latest 200 jobs; follow-ups excluded from funnel',
    sendingReady: enquiryTransportReady(), sender: 'front@assembl.co.nz', connection: connection.data,
    workerLastSeen: worker.data?.last_seen_at ?? null, pluginEnabled: plugin.data?.status === 'active' };
}
export async function rotateEnquiryConnection(owner: string) {
  const token = `doeq_${randomBytes(32).toString('hex')}`;
  const { error } = await getServiceClient().from('do_enquiry_connections').upsert({ owner_id: owner, token_hash: hash(token), created_at: new Date().toISOString() });
  if (error) throw new EnquiryError('Could not create the event connection.', 503);
  return token;
}
export async function revokeEnquiryConnection(owner: string) {
  const { error } = await getServiceClient().from('do_enquiry_connections').delete().eq('owner_id', owner);
  if (error) throw new EnquiryError('Could not revoke the event connection.', 503);
}
export async function enquiryEventOwner(request: Request) {
  const value = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  if (!/^doeq_[a-f0-9]{64}$/.test(value)) throw new EnquiryError('Invalid event connection.', 401);
  const { data, error } = await getServiceClient().from('do_enquiry_connections').select('owner_id').eq('token_hash', hash(value)).maybeSingle();
  if (error || !data) throw new EnquiryError('Invalid event connection.', 401);
  await requireEnquiryOwner(data.owner_id);
  return data.owner_id as string;
}
export async function prepareEnquiryFollowups(owner?: string) {
  return await rpc('do_enquiry_followups', { p_limit: 20, p_owner: owner ?? null }) as number;
}
export async function enquiryPluginAccess(owner: string, enabled: boolean) {
  const db = getServiceClient();
  const tenant = `do-enquiries:${owner}`;
  if (!enabled) {
    const { error } = await db.from('mcp_tenant_memberships').update({ status: 'revoked', is_default: false }).eq('user_id', owner).eq('tenant', tenant);
    if (error) throw new EnquiryError('Could not revoke plugin access.', 503);
    return;
  }
  const { data, error } = await db.from('mcp_tenant_memberships').select('id,tenant').eq('user_id', owner).eq('status', 'active').eq('is_default', true).maybeSingle();
  if (error) throw new EnquiryError('Could not check plugin access.', 503);
  const result = await db.from('mcp_tenant_memberships').upsert({ user_id: owner, tenant, permissions: ['work.read', 'proof.read', 'work.create'], status: 'active', is_default: !data || data.tenant === tenant }, { onConflict: 'user_id,tenant' });
  if (result.error) throw new EnquiryError('Could not enable plugin access.', 503);
}
export async function getEnquiry(owner: string, id: string) {
  const { data, error } = await getServiceClient().from('do_enquiry_jobs').select('*').eq('owner_id', owner).eq('id', id).maybeSingle();
  if (error) throw new EnquiryError('Could not load that job.', 503);
  if (!data) throw new EnquiryError('not_found', 404);
  return data as EnquiryJob;
}
