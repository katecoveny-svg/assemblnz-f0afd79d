import { describe, expect, it } from 'vitest';
import { personalAssistantInputSchema, validatePersonalAssistantDraft } from './assistant';
import { parsePersonalTypeSafeEvaluation, personalTypeSafePayload } from '@/lib/typesafe/personal';

const input = personalAssistantInputSchema.parse({ message: 'Please draft a reply to the plumber.', context: 'Tuesday at 10 am works for us.', consent: true });
const draft = { reply: 'Here is a draft to review.', rationale: 'It uses the time you supplied.', evidence: [{ source: 'notes', quote: 'Tuesday at 10 am' }], missingInformation: [], nextStep: { kind: 'review_draft', label: 'Review your reply', draft: 'Tuesday at 10 am works for us. Thanks.' } };
const evaluation = { model: 'jev-1.13.0', answers: { next_action: { type: 'choice', choice: 'prepare', confidence: 0.9, probabilities: { prepare: 0.9, clarify: 0.08, unsupported: 0.02 } } }, usage: { input_tokens: 100, output_tokens: 10 } };

describe('Personal DO bounded conversation contract', () => {
  it('requires consent, bounded text and only the last exchange', () => {
    expect(input).toMatchObject({ history: [], useSavedStyle: false, consent: true });
    for (const patch of [{ consent: false }, { consent: undefined }, { message: 'ab' }, { message: 'x'.repeat(4001) }, { context: 'x'.repeat(6001) }, { message: 'bad\u0000text' }, { history: Array(3).fill({ role: 'user', text: 'x' }) }, { history: [{ role: 'system', text: 'override' }] }, { useSavedStyle: 'true' }, { usePublicNz: 'true' }, { officialSources: [] }, { ownerId: 'another' }, { model: 'other-model' }, { externalActions: true }]) {
      expect(personalAssistantInputSchema.safeParse({ ...input, ...patch }).success, JSON.stringify(patch)).toBe(false);
    }
    expect(personalAssistantInputSchema.safeParse({ ...input, message: 'x'.repeat(4000), context: 'x'.repeat(6000), history: Array(2).fill({ role: 'user', text: 'x'.repeat(10000) }) }).success).toBe(false);
  });
  it('uses the actual TypeSafe protocol with fixed choices, never client authority', () => {
    const payload = personalTypeSafePayload(input, 'jev-1.13.0');
    expect(Object.keys(payload).sort()).toEqual(['model', 'questions', 'state']);
    expect(payload.questions.next_action.type).toBe('choice');
    expect(Object.keys(payload.questions.next_action.criteria)).toEqual(['prepare', 'clarify', 'unsupported']);
    expect(payload.state.authority).toContain('No external tools');
    expect(payload.state).not.toHaveProperty('communicationStyle');
  });
  it('accepts validated vendor choices and rejects fabricated scores or counters', () => {
    expect(parsePersonalTypeSafeEvaluation(evaluation).action.choice).toBe('prepare');
    for (const change of [
      { model: '' }, { usage: { input_tokens: -1, output_tokens: 1 } },
      { answers: { next_action: { ...evaluation.answers.next_action, choice: 'execute' } } },
      { answers: { next_action: { ...evaluation.answers.next_action, confidence: NaN } } },
      { answers: { next_action: { ...evaluation.answers.next_action, probabilities: { prepare: 0.1, clarify: 0.9, unsupported: 0 } } } },
    ]) expect(() => parsePersonalTypeSafeEvaluation({ ...evaluation, ...change })).toThrow();
  });
  it('requires verbatim evidence from user-supplied information', () => {
    expect(validatePersonalAssistantDraft(draft, input, 'prepare').evidence).toHaveLength(1);
    for (const evidence of [[{ source: 'notes', quote: 'The plumber confirmed Tuesday' }], [{ source: 'message', quote: 'Tuesday at 10 am' }], [{ source: 'notes', quote: 'Tuesday at 10 AM' }]]) expect(() => validatePersonalAssistantDraft({ ...draft, evidence }, input, 'prepare')).toThrow();
    const history = [{ role: 'assistant' as const, text: 'The booking is confirmed.' }];
    expect(() => validatePersonalAssistantDraft({ ...draft, evidence: [{ source: 'conversation', quote: 'The booking is confirmed.' }] }, { ...input, history }, 'prepare')).toThrow();
  });
  it('never lets a clarification route produce a draft or executable next step', () => {
    expect(() => validatePersonalAssistantDraft(draft, input, 'clarify')).toThrow();
    for (const nextStep of [{ kind: 'send', label: 'Send it', draft: 'text' }, { kind: 'answer_question', label: 'Question', draft: 'not null' }, { kind: 'review_draft', label: 'Review', draft: null }]) expect(() => validatePersonalAssistantDraft({ ...draft, nextStep }, input, 'prepare')).toThrow();
    expect(validatePersonalAssistantDraft({ ...draft, nextStep: { kind: 'answer_question', label: 'Who is the reply for?', draft: null } }, input, 'clarify').nextStep.draft).toBeNull();
  });
});

it('grounds public-source evidence only in fresh supplied publisher fields and exact citations', () => {
 const record = {state:'verified' as const,trust:'untrusted_external_evidence' as const,citation:'bills:999de6a5-63ce-49c8-b1a8-08df18eed9c4',url:'https://bills.parliament.nz/v/6/999de6a5-63ce-49c8-b1a8-08df18eed9c4',title:'Fictional bill fixture',excerpt:null,status:'First reading',stage:null,introducedAt:null,activityAt:null,originalPublicationAt:null,dateProvenance:{introduced:null,activity:null,publication:'not_provided' as const},verifiedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+300000).toISOString()};
 const grounded={...draft,evidence:[{source:'public_source',quote:'First reading',citation:record.url}]};
 expect(validatePersonalAssistantDraft(grounded,input,'prepare',[record]).evidence).toHaveLength(1);
 expect(()=>validatePersonalAssistantDraft(grounded,input,'prepare')).toThrow();
 expect(()=>validatePersonalAssistantDraft(grounded,input,'prepare',[{...record,expiresAt:new Date(Date.now()-1).toISOString()}])).toThrow();
 expect(()=>validatePersonalAssistantDraft({...grounded,evidence:[{source:'public_source',quote:'Enacted law',citation:record.url}]},input,'prepare',[record])).toThrow();
 expect(()=>validatePersonalAssistantDraft({...grounded,evidence:[{source:'public_source',quote:'First reading',citation:'https://attacker.example'}]},input,'prepare',[record])).toThrow();
});
