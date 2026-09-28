/** A local closing check. It knows only what the person explicitly enters. */
export type MeetingCommitment = { id: string; work: string; owner: string; due: string };
export type MeetingWrap = {
  aim: string; notes: string; decision: string; questions: string;
  noDecision: boolean; noActions: boolean; commitments: MeetingCommitment[];
};

export function meetingWrapGaps(wrap: MeetingWrap): string[] {
  const gaps: string[] = [];
  if (!wrap.decision.trim() && !wrap.noDecision) gaps.push('What did you decide? Record the decision, or mark that none was needed.');
  if (!wrap.noActions) {
    if (!wrap.commitments.length) gaps.push('Agree a next step, or mark that none was needed.');
    wrap.commitments.forEach((step, i) => {
      if (!step.work.trim()) gaps.push(`Next step ${i + 1}: name the work.`);
      if (!step.owner.trim()) gaps.push(`Next step ${i + 1}: agree who owns it.`);
      if (!step.due.trim()) gaps.push(`Next step ${i + 1}: agree when it is due.`);
    });
  }
  return gaps;
}

/** Plain text keeps the pack portable. Missing details stay missing, never inferred. */
export function meetingWrapPack(wrap: MeetingWrap, reviewed = false): string {
  const gaps = meetingWrapGaps(wrap);
  const actions = wrap.noActions ? 'No next steps were recorded.' : wrap.commitments.map((s, i) =>
    `${i + 1}. ${s.work.trim() || '[Work not recorded]'} · Owner: ${s.owner.trim() || '[Not agreed]'} · Due: ${s.due.trim() || '[Not agreed]'}`,
  ).join('\n') || '[No next steps recorded]';
  return [
    'Meeting work pack · DO',
    reviewed ? 'Reviewed by the person sharing this pack.' : 'DRAFT · review before sharing.',
    'Prepared locally from your entries. No recording was analysed and no action was sent, assigned or booked.',
    wrap.aim.trim() ? `Meeting aim\n${wrap.aim.trim()}` : '',
    wrap.notes.trim() ? `Meeting notes\n${wrap.notes.trim()}` : '',
    `Decisions / outcomes\n${wrap.noDecision ? 'No decision was needed.' : wrap.decision.trim() || '[Decision not recorded]'}`,
    `Action items\n${actions}`,
    wrap.questions.trim() ? `Open questions\n${wrap.questions.trim()}` : '',
    gaps.length ? `Still to confirm\n${gaps.map(g => `• ${g}`).join('\n')}` : 'Closing check\nThe decision and next-step fields are complete. This checks the entries, not whether the work happened.',
  ].filter(Boolean).join('\n\n');
}
