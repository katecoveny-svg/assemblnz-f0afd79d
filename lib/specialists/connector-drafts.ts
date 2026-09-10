import { z } from 'zod';

export const FLUX_CONNECTION_APPS = ['salesforce_rest_api', 'microsoft_outlook'] as const;
export const connectorDraft = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('salesforce-lead'), reviewed: z.literal(true), company: z.string().trim().min(1).max(160), lastName: z.string().trim().min(1).max(80), firstName: z.string().trim().max(80).default(''), email: z.union([z.email(), z.literal('')]).default(''), description: z.string().trim().min(1).max(5000) }).strict(),
  z.object({ kind: z.literal('outlook-draft'), reviewed: z.literal(true), recipient: z.email(), subject: z.string().trim().min(1).max(200), content: z.string().trim().min(1).max(5000), permission: z.enum(['requested-contact', 'existing-relationship']) }).strict(),
]);
export function mappedDraft(draft: z.infer<typeof connectorDraft>) {
  if (draft.kind === 'salesforce-lead') return { action: 'create_lead' as const, app: 'salesforce_rest_api', data: { Company: draft.company, LastName: draft.lastName, FirstName: draft.firstName, ...(draft.email ? { Email: draft.email } : {}), Description: draft.description } };
  return { action: 'create_email_draft' as const, app: 'microsoft_outlook', data: { recipients: [draft.recipient], subject: draft.subject, content: draft.content, contentType: 'text' } };
}
