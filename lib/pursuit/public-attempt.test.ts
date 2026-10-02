import { describe, expect, it, vi } from 'vitest';
import { TrialInput, type PublicResearchResult } from './public-contract';
import { bindPublicPresentation, publicAttempt, matchesPublicAttempt } from './public-attempt';

const brief = { company: 'assembl.co.nz', goal: 'Research one public-source advisory opportunity.', consent: true as const, useTypeSafe: false };
describe('bounded public research identity', () => {
  it('recovers an unchanged request without another identity, even after allowance is exhausted', () => {
    const ids = vi.fn().mockReturnValueOnce('first').mockReturnValueOnce('second');
    const attempt = publicAttempt(null, brief, ids);
    expect(publicAttempt(attempt, { ...brief, company: ' assembl.co.nz ' }, ids)).toBe(attempt);
    expect(ids).toHaveBeenCalledTimes(1);
  });
  it('creates a new identity only for a deliberately changed brief', () => {
    const attempt = publicAttempt(null, brief, () => 'first');
    expect(matchesPublicAttempt(attempt, { ...brief, goal: 'Research another explicitly requested public opportunity.' })).toBe(false);
    expect(publicAttempt(attempt, { ...brief, company: 'another.example' }, () => 'second').input.requestId).toBe('second');
  });
  it('keeps provider-sharing choices within the identity boundary', () => {
    const attempt = publicAttempt(null, brief, () => 'first');
    expect(matchesPublicAttempt(attempt, { ...brief, useTypeSafe: true })).toBe(false);
    expect(matchesPublicAttempt(attempt, { ...brief, workflow: 'website_outreach' })).toBe(false);
  });
  it('does not share an identity between independent visitor components', () => {
    expect(publicAttempt(null, brief, () => 'visitor-one').input.requestId).not.toBe(publicAttempt(null, brief, () => 'visitor-two').input.requestId);
  });
});

it('freezes the first request body and retains the selected router option',()=>{
 const selected={...brief,useTypeSafe:true};const ids=vi.fn(()=> 'first');const attempt=publicAttempt(null,selected,ids);
 expect(Object.isFrozen(attempt.input)).toBe(true);
 expect(publicAttempt(attempt,selected,ids)).toBe(attempt);expect(attempt.input.useTypeSafe).toBe(true);expect(ids).toHaveBeenCalledTimes(1);
});

it('keeps retrieval mode in the immutable request identity',()=>{
 const ids=vi.fn(()=> 'direct');const scoped={...brief,sourceMode:'direct_source_brief' as const};const attempt=publicAttempt(null,scoped,ids);
 expect(attempt.input.sourceMode).toBe('direct_source_brief');expect(publicAttempt(attempt,scoped,ids)).toBe(attempt);expect(matchesPublicAttempt(attempt,brief)).toBe(false);expect(ids).toHaveBeenCalledTimes(1);
});

describe('scoped focus identity', () => {
  it('keeps selected scoped focus in the request identity and invalidates recovery when it changes', () => {
    const scoped = { ...brief, sourceMode: 'direct_source_brief' as const, directFocus: 'creative' as const };
    const attempt = publicAttempt(null, scoped, () => 'first');
    expect(attempt.input.directFocus).toBe('creative'); expect(matchesPublicAttempt(attempt, scoped)).toBe(true);
    expect(matchesPublicAttempt(attempt, { ...scoped, directFocus: 'privacy-review' })).toBe(false);
  });
  it('accepts old scoped inputs without focus, but never admits focus on a web-search/outreach request', () => {
    const input = { ...brief, requestId: '72b1797b-420a-4c56-a6bf-cf74832c948e', sourceMode: 'direct_source_brief' as const };
    expect(TrialInput.safeParse(input).success).toBe(true);
    expect(TrialInput.safeParse({ ...input, directFocus: 'privacy-review' }).success).toBe(true);
    expect(TrialInput.safeParse({ ...brief, requestId: input.requestId, directFocus: 'privacy-review' }).success).toBe(false);
  });

});

describe('client-only submitted brief binding',()=>{
 const scoped={...brief,goal:'Build the visitor-specific website handoff fixture.',sourceMode:'direct_source_brief' as const,directFocus:'creative' as const};
 const saved={mode:'direct_source_brief',planKind:'authored_starter_plan',trace:{id:'first'}} as PublicResearchResult;
 it('binds the immutable original request on immediate response and recovery without changing server result',()=>{
  const attempt=publicAttempt(null,scoped,()=> 'first');
  for(const response of [saved,JSON.parse(JSON.stringify(saved))]){
   const shown=bindPublicPresentation(response,attempt);expect(shown.scopedPlan).toEqual({kind:'authored_starter_plan',yourBrief:scoped.goal,focus:'creative'});expect(response).not.toHaveProperty('scopedPlan');
  }
  const edited={...scoped,goal:'A different visitor goal after the completed result.'};expect(matchesPublicAttempt(attempt,edited)).toBe(false);expect(bindPublicPresentation(saved,attempt).scopedPlan?.yourBrief).toBe(scoped.goal);
 });
 it('rejects attaching an old result to a changed request identity',()=>{
  const changed=publicAttempt(null,{...scoped,goal:'An edited goal with a deliberately new request identity.'},()=> 'second');expect(()=>bindPublicPresentation(saved,changed)).toThrow('did not match');
 });
 it('does not invent authored-plan context on older saved or live results, or trust server-supplied context',()=>{
  const attempt=publicAttempt(null,scoped,()=> 'first');
  expect(bindPublicPresentation({...saved,planKind:undefined},attempt)).not.toHaveProperty('scopedPlan');expect(bindPublicPresentation({...saved,mode:'live'},attempt)).not.toHaveProperty('scopedPlan');
  const unexpected={...saved,scopedPlan:{yourBrief:'Untrusted response text'}};expect(bindPublicPresentation(unexpected,attempt).scopedPlan?.yourBrief).toBe(scoped.goal);
 });
});
