import type { DoEvidence } from '@/apps/do/shared/pipeline';
import { moneyText, type CheckedInvoice } from './model';
import type { RecurringPayment } from './analysis';

export type FinancialAction = 'query-charge' | 'review-renewal' | 'request-options' | 'check-payment';
export type FinancialDraft = {
  version: 1; id: string; action: FinancialAction; title: string; text: string;
  mode: 'demo' | 'personal'; status: 'draft' | 'reviewed';
  preparedAt: string; originalTextHash: string;
  review: { reviewer: string; at: string; textHash: string } | null;
  evidence: DoEvidence;
  externalAction: 'not-executed';
};
export async function financialHash(text: string) {
  const result = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(result)).map(value => value.toString(16).padStart(2, '0')).join('');
}
export async function prepareFinancialDraft(target: RecurringPayment | CheckedInvoice, action: FinancialAction, demo: boolean, at = new Date().toISOString()): Promise<FinancialDraft> {
  const recurring = 'observations' in target;
  const payee = recurring ? target.merchant : target.payee;
  const amount = moneyText(target.amount);
  const context = recurring
    ? 'Latest recorded payment: ' + amount + ' on ' + target.lastPaidOn + '.'
    : 'Invoice or notice: ' + target.invoiceReference + '. Amount: ' + amount + (target.dueOn ? '. Checked due date: ' + target.dueOn : '. Due date not established') + '.';
  const request = action === 'query-charge'
    ? 'Please explain the latest charge and any changes in usage, rates or fees. Please correct any error you identify.'
    : action === 'review-renewal'
      ? 'Please confirm the renewal date, cover or service, total renewal cost, cancellation conditions and any changes to terms. I am reviewing my options.'
      : action === 'check-payment'
        ? 'Please confirm the current payment status and whether any balance remains outstanding. I will check this against my own records before taking another step.'
        : 'Please provide the available options for my current service, including ongoing prices, introductory periods, contract terms and any joining or exit fees.';
  const text = 'Hello ' + payee + ',\n\n' + context + '\n\n' + request + '\n\nThis is an enquiry only. Please do not change, cancel, renew or switch anything on my behalf.\n\nThank you';
  const id = crypto.randomUUID();
  const why = action === 'query-charge' && recurring && target.increase
    ? 'The latest payment is higher than the median of earlier payments. Usage, fees or a different service may explain the change.'
    : action === 'review-renewal'
      ? 'A checked renewal notice needs a decision. Renewal has not been accepted or cancelled.'
      : 'Prepare a clear enquiry from the available records. A person checks the context and decides what to do next.';
  const records = recurring
    ? target.observations.map(row => ({ id: row.id, label: row.source.reference, at: row.source.observedAt, value: row }))
    : [{ id: target.id, label: target.sourceLabel, at: target.checkedAt, value: target }];
  return {
    version: 1, id, action, title: payee + ' · ' + action.replace(/-/g, ' '), text,
    mode: demo ? 'demo' : 'personal', status: 'draft', preparedAt: at, originalTextHash: await financialHash(text),
    review: null, externalAction: 'not-executed',
    evidence: {
      id: 'evidence-' + id, agentId: 'do-bills', summary: context, why, createdAt: at,
      sources: await Promise.all(records.map(async row => ({
        id: row.id, kind: demo ? 'fixture' as const : 'snapshot' as const, label: row.label,
        contentHash: await financialHash(JSON.stringify(row.value)), capturedAt: row.at,
        excerpt: 'Financial record checked for this preparation. Full source retained only in this page while open.',
      }))),
    },
  };
}
export function editFinancialDraft(draft: FinancialDraft, text: string): FinancialDraft {
  return { ...draft, text: text.slice(0, 12000), status: 'draft', review: null };
}
export async function reviewFinancialDraft(draft: FinancialDraft, reviewer: string, at = new Date().toISOString()): Promise<FinancialDraft> {
  if (!reviewer.trim() || reviewer.trim().length > 100 || !draft.text.trim()) throw new Error('Add your name and review a non-empty draft.');
  return { ...draft, status: 'reviewed', review: { reviewer: reviewer.trim(), at, textHash: await financialHash(draft.text) } };
}
export function financialReceipt(draft: FinancialDraft) {
  return {
    ...draft,
    steps: [
      { stage: 'saw', detail: draft.evidence.summary },
      { stage: 'decided', detail: draft.evidence.why },
      { stage: 'prepared', detail: 'Editable enquiry draft prepared.' },
      { stage: 'asked', detail: draft.review ? 'Review recorded for this exact text.' : 'Waiting for a person to review the draft.' },
      { stage: 'did', detail: 'No external action. No message, payment, cancellation, switch, booking or accounting write.' },
      { stage: 'evidence', detail: 'Source references and content hashes attached.' },
    ],
    receiptBoundary: 'A local preparation/review record, not a signed server audit or execution receipt. Review does not authorise external action.',
  };
}
