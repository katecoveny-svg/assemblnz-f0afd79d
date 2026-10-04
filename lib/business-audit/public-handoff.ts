import { snapshotSchema, type DiagnosticSnapshot } from './diagnostic';
/** Existing destination inspected in app/contact/page.tsx and components/site/contact-form.tsx. */
export const AUDIT_ENQUIRY_EMAIL = 'assembl@assembl.co.nz';
export type EmailDraft = { to: typeof AUDIT_ENQUIRY_EMAIL; subject: string; body: string };
export function diagnosticEmailDraft(input: DiagnosticSnapshot): EmailDraft {
    const s = snapshotSchema.parse(input), a = s.answers;
    const field = (label: string, value: string) => `${label}: ${value || 'Not provided'}`;
    return { to: AUDIT_ENQUIRY_EMAIL, subject: 'assembl business audit enquiry', body: [
        'Kia ora assembl,', '', 'Please review this high-level diagnostic and reply about a focused audit.',
        'This is based on my answers; it is not verified evidence or a savings claim.', '',
        field('Business type', a.businessType), field('Goal', a.goal), field('Recurring task', a.task),
        field('My role', a.role), field('Frequency', a.frequency), field('Approximate count', a.count),
        field('Bottleneck', a.bottleneck), field('Tool names only', a.tools), field('Desired outcome', a.outcome), '',
        'My reviewed suggested steps:', ...s.steps.map((step, i) => `${i + 1}. ${step}`), '',
        field('Opportunity to test', s.opportunity), field('Question to answer', s.missingQuestion),
        field('Measurement before change', s.measurement), '',
        'This is an audit enquiry only. I have not requested marketing updates.',
    ].join('\n') };
}
export function emailDraftFingerprint(draft: EmailDraft): string { return JSON.stringify(draft); }
export function reviewedDiagnosticMailto(snapshot: DiagnosticSnapshot, reviewed: string | null): string {
    const draft = diagnosticEmailDraft(snapshot);
    if (!reviewed || reviewed !== emailDraftFingerprint(draft)) throw Error('Review this exact email draft before opening your email app.');
    return `mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
}
