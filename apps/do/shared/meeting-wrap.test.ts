import { describe, expect, it } from 'vitest';
import { meetingWrapGaps, meetingWrapPack, type MeetingWrap } from './meeting-wrap';

const wrap: MeetingWrap = { aim: 'Agree the pilot', notes: 'The budget is uncertain.', decision: '', questions: '', noDecision: false, noActions: false, commitments: [{ id: '1', work: 'Check the budget', owner: '', due: '' }] };
describe('Meeting DO closing check', () => {
  it('surfaces missing decisions, owners and dates without deriving them from prose', () => {
    expect(meetingWrapGaps(wrap)).toHaveLength(3);
    const pack = meetingWrapPack(wrap);
    expect(pack).toContain('Owner: [Not agreed] · Due: [Not agreed]');
    expect(pack).toContain('DRAFT');
    expect(pack).not.toContain('Tomorrow');
  });
  it('handles meetings with explicitly no decision or actions and excludes dormant action text', () => {
    const input = { ...wrap, noDecision: true, noActions: true };
    expect(meetingWrapGaps(input)).toEqual([]);
    expect(meetingWrapPack(input)).not.toContain('Check the budget');
    expect(meetingWrapPack(input)).toContain('No decision was needed.');
  });
  it('preserves qualified and relative due dates rather than inventing a calendar commitment', () => {
    const input = { ...wrap, decision: 'Proceed only if funding clears', commitments: [{ id: '1', work: 'Confirm funding', owner: 'Māia', due: 'Friday, if approved' }] };
    expect(meetingWrapGaps(input)).toEqual([]);
    expect(meetingWrapPack(input, true)).toContain('Due: Friday, if approved');
    expect(meetingWrapPack(input, true)).toContain('No recording was analysed');
  });
  it('flags empty and partially entered actions', () => {
    expect(meetingWrapGaps({ ...wrap, commitments: [] })).toHaveLength(2);
    expect(meetingWrapGaps({ ...wrap, noDecision: true, commitments: [{ id: '1', work: '', owner: 'Māia', due: 'Friday' }] })).toEqual(['Next step 1: name the work.']);
  });
});
