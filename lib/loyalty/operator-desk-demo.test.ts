import { describe, expect, it } from 'vitest';
import { AGENT_APP_COPY_HARD_FAIL } from '@/lib/agent-app/craft-canon';
import {
  OPERATOR_DESK_ACTIVITY,
  OPERATOR_DESK_BANNED_VOCAB,
  OPERATOR_DESK_BRIEF_END,
  OPERATOR_DESK_CANDLES,
  OPERATOR_DESK_DEMO_DISCLAIMER,
  OPERATOR_DESK_PREVIEW,
  OPERATOR_DESK_SCHEMA_VERSION,
  OPERATOR_DESK_SESSION_HOURS,
  formatOperatorSessionClock,
  operatorDeskCopyBlob,
  projectOperatorDeskFrame,
} from './operator-desk-demo';

describe('Operator desk DEMO — Assembl loyalty craft', () => {
  it('locks schema and DEMO honesty', () => {
    expect(OPERATOR_DESK_SCHEMA_VERSION).toBe('v0');
    expect(OPERATOR_DESK_PREVIEW.statusDemo.toLowerCase()).toContain('demo');
    expect(OPERATOR_DESK_DEMO_DISCLAIMER.toLowerCase()).toContain('demo');
    expect(OPERATOR_DESK_DEMO_DISCLAIMER.toLowerCase()).toContain('not live');
    expect(OPERATOR_DESK_DEMO_DISCLAIMER.toLowerCase()).toContain('not money moved');
  });

  it('uses Assembl tags only on the activity log', () => {
    const allowed = new Set(['WAIT', 'EARN', 'EVIDENCE', 'APPROVE', 'AGENT', 'NZ']);
    for (const line of OPERATOR_DESK_ACTIVITY) {
      expect(allowed.has(line.tag)).toBe(true);
    }
  });

  it('ships a climbing session history over 7h', () => {
    expect(OPERATOR_DESK_SESSION_HOURS).toBe(7);
    expect(OPERATOR_DESK_CANDLES.length).toBeGreaterThan(20);
    const first = OPERATOR_DESK_CANDLES[0]!;
    const last = OPERATOR_DESK_CANDLES[OPERATOR_DESK_CANDLES.length - 1]!;
    expect(last.close).toBeGreaterThan(first.close);
  });

  it('projects climbing metrics across the replay', () => {
    const early = projectOperatorDeskFrame(0.1);
    const late = projectOperatorDeskFrame(0.95);
    expect(late.hoursBack).toBeGreaterThan(early.hoursBack);
    expect(late.evidenceReceipts).toBeGreaterThan(early.evidenceReceipts);
    expect(late.tasks).toBeGreaterThan(early.tasks);
    expect(late.approvalRate).toBeGreaterThanOrEqual(70);
    expect(late.log.length).toBeGreaterThan(0);
    expect(formatOperatorSessionClock(late.elapsedSec)).toMatch(/\/ 7H$/);
  });

  it('keeps operator brief port_2fa / NZ / human-yes framed', () => {
    expect(OPERATOR_DESK_BRIEF_END.map((b) => b.id)).toEqual(['momentum', 'volume', 'risk']);
    const blob = JSON.stringify(OPERATOR_DESK_BRIEF_END).toLowerCase();
    expect(blob).toContain('port_2fa');
    expect(blob).toContain('human yes');
    expect(blob).toContain('assembl owns evidence');
  });

  it('bans crypto / trading vocabulary and AI-slop patterns', () => {
    const blob = operatorDeskCopyBlob();
    for (const word of OPERATOR_DESK_BANNED_VOCAB) {
      expect(blob).not.toContain(word);
    }
    expect(blob).not.toContain('mana');
    expect(blob).not.toContain('kete');
    expect(blob).not.toContain('one nz');
    for (const re of AGENT_APP_COPY_HARD_FAIL) {
      expect(blob).not.toMatch(re);
    }
  });

  it('states ownership boundary on wait credits', () => {
    expect(OPERATOR_DESK_PREVIEW.waitCreditsSub.toLowerCase()).toContain('sample');
    expect(OPERATOR_DESK_PREVIEW.evidenceSub.toLowerCase()).toContain('demo');
    expect(OPERATOR_DESK_PREVIEW.spine).toContain('port_2fa');
    expect(OPERATOR_DESK_PREVIEW.ctaEvidenceHref).toBe('/journeys/evidence-receipt');
  });
});
