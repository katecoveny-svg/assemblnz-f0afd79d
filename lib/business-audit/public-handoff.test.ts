import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicAuditDiagnostic } from '../../components/business-audit/PublicAuditDiagnostic';
import { prepareDiagnostic } from './diagnostic';
import { AUDIT_ENQUIRY_EMAIL, diagnosticEmailDraft, emailDraftFingerprint, reviewedDiagnosticMailto } from './public-handoff';
const snapshot = () => prepareDiagnostic({ businessType: 'Fictional workshop', goal: 'Less repeated entry', task: 'Fictional quote preparation', role: 'Workshop owner', frequency: 'weekly', count: '10', bottleneck: 'Repeated admin', tools: 'Fictional quoting tool', outcome: 'A reviewed quote' });
describe('public diagnostic email handoff', () => {
    it('uses only the inspected existing business destination and approved brief', () => { const draft = diagnosticEmailDraft(snapshot()); expect(draft.to).toBe('assembl@assembl.co.nz'); expect(draft.body).toContain('Kia ora assembl,\n\n'); expect(draft.body).not.toContain('\\n'); expect(draft.body).toContain('Recurring task: Fictional quote preparation'); expect(draft.body).toContain('not requested marketing'); expect(draft.body).not.toMatch(/auditId|companyId|ownerId|permissionRevision/); expect(readFileSync('app/contact/page.tsx', 'utf8')).toContain(`mailto:${AUDIT_ENQUIRY_EMAIL}`); });
    it('requires exact review and invalidates after answer or suggested-step edits', () => { const s = snapshot(), review = emailDraftFingerprint(diagnosticEmailDraft(s)); expect(reviewedDiagnosticMailto(s, review)).toMatch(/^mailto:assembl@assembl.co.nz\?/); expect(() => reviewedDiagnosticMailto(s, null)).toThrow('Review'); s.steps[0] = 'Fictional edited step'; expect(() => reviewedDiagnosticMailto(s, review)).toThrow('Review'); });
    it('encodes all visitor text as body data, never routing or headers', () => { const s = snapshot(); s.answers.task = 'Fictional &bcc=other@example.invalid\nSubject: changed'; const draft = diagnosticEmailDraft(s), href = reviewedDiagnosticMailto(s, emailDraftFingerprint(draft)); expect(href).not.toContain('&bcc='); const url = new URL(href); expect(url.pathname).toBe(AUDIT_ENQUIRY_EMAIL); expect([...url.searchParams.keys()]).toEqual(['subject', 'body']); expect(url.searchParams.get('body')).toBe(draft.body); });
    it('route has no query ingestion or private context and public component has no submit/storage/analytics path', () => { const route = readFileSync('app/contact/audit/page.tsx', 'utf8'), publicUI = readFileSync('components/business-audit/PublicAuditDiagnostic.tsx', 'utf8'); expect(route).toContain('<PublicAuditDiagnostic />'); expect(route).toContain("canonical: '/contact/audit'"); expect(readFileSync('middleware.ts', 'utf8')).toContain("  '/contact',"); expect(route).not.toMatch(/searchParams|AuditFlow|companies=|persistence=/); expect(publicUI).not.toMatch(/<form\b|type="submit"|name=|fetch\(|localStorage|sessionStorage|console\.|gtag|posthog|noSendLeadAdapter|exportPrivate|Private audit workspace/); expect(publicUI).toContain('data-hj-suppress'); expect(publicUI).toContain('<noscript>'); expect(publicUI).toContain('disabled={!ready'); });
});

describe('public server-rendered boundary', () => {
    it('has disabled pre-hydration actions, no form/named answers and no private controls', () => { const html = renderToStaticMarkup(createElement(PublicAuditDiagnostic)); expect(html).toContain('<noscript>'); expect(html).not.toMatch(/<form\b|name=|owner workspace|Private audit workspace|export exact private draft/); expect(html).toContain('type="button"'); expect(html).toMatch(/<button[^>]*disabled/); expect(html).toMatch(/<fieldset[^>]*disabled/); expect(html).not.toContain('mailto:assembl@assembl.co.nz?'); });
});

describe('editable suggested-step handoff admission', () => {
    it('rejects empty/whitespace/overlong steps without replacing their content', () => { for (const text of ['', ' ', 'a'.repeat(301)]) { const s = snapshot(); s.steps[0] = text; expect(() => diagnosticEmailDraft(s)).toThrow(); expect(s.steps[0]).toBe(text); } });
    it('accepts rewritten, max-length and Unicode steps exactly in the draft', () => { for (const text of ['Fictional rewritten step', 'a'.repeat(300), 'Whakatā · ā Māori · 🙂 — a fictional step']) { const s = snapshot(); s.steps[0] = text; expect(diagnosticEmailDraft(s).body).toContain(`1. ${text}`); } });
});
