import 'server-only';
import { createHash } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';
import { createActionRequest } from '@/lib/agents/action-requests';
import { MEETING_EMAIL_SENDER, type MeetingFollowupInput, type MeetingFollowupReceipt } from '../shared/meeting-followthrough';
const AGENT = 'meeting-do';
/** Namespace retry IDs by owner to avoid cross-account collisions. */
export function meetingRequestId(owner: string, requestId: string) {
  const hash = createHash('sha256').update(JSON.stringify([AGENT, owner, requestId])).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
export async function readMeetingFollowup(owner: string, requestId: string): Promise<MeetingFollowupReceipt | null> {
  const { data, error } = await getServiceClient().from('agent_action_requests')
    .select('id, status, created_at, payload').eq('id', meetingRequestId(owner, requestId))
    .eq('requested_by', owner).eq('agent_slug', AGENT).eq('kind', 'email_draft').maybeSingle();
  if (error) throw new Error('Meeting follow-up storage is unavailable.');
  if (!data) return null;
  if (!['pending', 'approved', 'dispatched', 'rejected', 'failed'].includes(data.status)) throw new Error('Unknown follow-up status.');
  return { id: data.id, status: data.status, createdAt: data.created_at, sourceHash: data.payload.meetingSourceHash, sender: MEETING_EMAIL_SENDER };
}
export async function queueMeetingFollowup(owner: string, input: MeetingFollowupInput) {
  const result = await createActionRequest({
    requestId: meetingRequestId(owner, input.requestId), agentSlug: AGENT, requestedBy: owner, kind: 'email_draft',
    payload: {
      to: input.to, subject: input.subject, body: input.body,
      meetingSourceHash: createHash('sha256').update(input.notes).digest('hex'),
      reason: `Meeting DO: the user reviewed this exact recipient and email and requested operator review. Send from ${MEETING_EMAIL_SENDER} only after the existing operator approval and dispatch gates. Source fingerprint identifies reviewed notes; it is not verification of their claims.`,
    },
  });
  if (!result) throw new Error('The follow-up could not be confirmed. Keep the same draft and check its status before retrying.');
  const receipt = await readMeetingFollowup(owner, input.requestId);
  if (!receipt) throw new Error('The saved follow-up could not be read back. Check its status before retrying.');
  return receipt;
}
