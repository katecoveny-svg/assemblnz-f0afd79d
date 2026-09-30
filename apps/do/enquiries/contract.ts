import { z } from 'zod';

export const enquiryInput = z.object({
  requestId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(3).max(4000),
});
export const enquiryMutation = z.discriminatedUnion('action', [
  enquiryInput.extend({ action: z.literal('receive') }),
  z.object({ action: z.literal('edit'), id: z.string().uuid(), revision: z.string().uuid(), subject: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(5000) }),
  z.object({ action: z.literal('approve'), id: z.string().uuid(), revision: z.string().uuid(), confirmSend: z.literal(true) }),
  z.object({ action: z.literal('cancel'), id: z.string().uuid() }),
  z.object({ action: z.enum(['answered', 'booked']), id: z.string().uuid(), evidence: z.string().trim().min(3).max(1200) }),
  z.object({ action: z.enum(['connect', 'disconnect']) }),
  z.object({ action: z.literal('check_followups') }),
  z.object({ action: z.enum(['enable_plugin', 'disable_plugin']) }),
]);
export const enquiryEvent = z.discriminatedUnion('event', [
  enquiryInput.extend({ event: z.literal('new_enquiry') }),
  z.object({ event: z.enum(['answered', 'booked']), id: z.string().uuid(), evidence: z.string().trim().min(3).max(1200) }),
]);
export type EnquiryInput = z.infer<typeof enquiryInput>;
export type EnquiryJob = {
  id: string; owner_id: string; parent_id: string | null; revision: string;
  name: string; email: string; message: string; subject: string; body: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'uncertain' | 'cancelled';
  provider_id: string | null; received_at: string; approved_at: string | null;
  sent_at: string | null; answered_at: string | null; booked_at: string | null;
  followup_due_at: string | null;
  evidence: Array<{ kind: string; at: string; source: string; detail?: string; result?: string; providerId?: string }>;
};
export function enquiryFunnel(jobs: EnquiryJob[]) {
  const roots = jobs.filter(j => !j.parent_id);
  return {
    received: roots.length,
    approved: roots.filter(j => j.approved_at).length,
    sent: roots.filter(j => j.sent_at).length,
    answered: roots.filter(j => j.answered_at).length,
    booked: roots.filter(j => j.booked_at).length,
  };
}
