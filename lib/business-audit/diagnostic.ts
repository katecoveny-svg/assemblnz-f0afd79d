import { z } from 'zod';
const text = z.string().trim().max(300);
export const diagnosticAnswersSchema = z.object({ businessType: text, goal: text, task: text, role: text, frequency: text, count: text, bottleneck: z.enum(['Too many subscriptions', 'Repeated admin', 'Slow handoffs', 'Lost enquiries']), tools: text, outcome: text }).strict();
export type DiagnosticAnswers = z.infer<typeof diagnosticAnswersSchema>;
export const snapshotSchema = z.object({ version: z.literal(1), revision: z.number().int().positive(), answers: diagnosticAnswersSchema, steps: z.array(z.string().trim().min(1).max(300)).min(3).max(5), opportunity: z.string().max(800), evidenceQualification: z.literal('Based only on your answers; not independently verified.'), missingQuestion: z.string().max(500), measurement: z.string().max(800) }).strict();
export type DiagnosticSnapshot = z.infer<typeof snapshotSchema>;
export function prepareDiagnostic(raw: DiagnosticAnswers): DiagnosticSnapshot {
    const a = diagnosticAnswersSchema.parse(raw), task = a.task || 'the recurring task you select';
    const hypotheses = { 'Too many subscriptions': 'Review whether an unused or overlapping tool can be removed, after checking contract terms and dependencies.', 'Repeated admin': 'Test whether one duplicate entry can be removed or handled with deterministic code.', 'Slow handoffs': 'Test one clearer handoff, with a named owner and an explicit next step.', 'Lost enquiries': 'Test whether one reviewed response workflow reduces unhandled enquiries.' };
    return { version: 1, revision: 1, answers: a, steps: [`Identify the trigger for ${task}`.slice(0, 300), `List the inputs and ${a.tools ? 'tools: ' + a.tools : 'tools to confirm'}`.slice(0, 300), `Map the handoff${a.role ? ' with ' + a.role : ' and responsible role'}`.slice(0, 300), `Measure the outcome${a.outcome ? ': ' + a.outcome : ' against a recorded baseline'}`.slice(0, 300)], opportunity: hypotheses[a.bottleneck], evidenceQualification: 'Based only on your answers; not independently verified.', missingQuestion: !a.task ? 'Which recurring task should the audit follow?' : !a.count || !a.frequency ? 'How many items happen in a typical period, and how often?' : !a.role ? 'Who owns this workflow and its exceptions?' : 'Which handoff or tool assumption can you support with an approved source?', measurement: `Before changing ${task}, record a dated sample: volume, mean active minutes including review/rework, waiting time and exceptions. Confirm software spend and contract costs separately.`.slice(0, 800) };
}
export const contactSchema = z.object({ name: z.string().trim().max(120), business: z.string().trim().max(160), email: z.union([z.literal(''), z.string().trim().email().max(254)]) }).strict();
export const leadPreviewSchema = z.object({ snapshot: snapshotSchema, contact: contactSchema, enquiryConsent: z.literal(true), marketingConsent: z.boolean(), purpose: z.literal('Ask assembl to review this diagnostic and contact me about an audit.'), noticeVersion: z.literal('draft-review-required') }).strict();
export type LeadPreview = z.infer<typeof leadPreviewSchema>;
export interface NoSendLeadAdapter {
    kind: 'no-send';
    prepare(input: LeadPreview): Promise<{
        status: 'simulated';
        persisted: false;
        fingerprint: string;
    }>;
}
export function leadFingerprint(input: unknown) { return JSON.stringify(leadPreviewSchema.parse(input)); }
export function noSendLeadAdapter(): NoSendLeadAdapter { return { kind: 'no-send', async prepare(input) { return { status: 'simulated', persisted: false, fingerprint: leadFingerprint(input) }; } }; }
