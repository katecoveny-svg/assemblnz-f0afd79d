import { describe, expect, it } from 'vitest';
import { AGENT_APP_COPY_HARD_FAIL } from '@/lib/agent-app/craft-canon';
import {
  EVIDENCE_RECEIPT_DEMO_DISCLAIMER,
  EVIDENCE_RECEIPT_DEMO_HEADLINE,
  EVIDENCE_RECEIPT_MOMENTS,
  EVIDENCE_RECEIPT_OPS,
  EVIDENCE_RECEIPT_PREVIEW,
  EVIDENCE_RECEIPT_SCHEMA_VERSION,
  EVIDENCE_RECEIPT_SYSTEM,
  EVIDENCE_RECEIPT_WAIT,
  EVIDENCE_RECEIPT_WORKFLOWS,
  PORT_2FA_EVIDENCE_RECEIPT_DEMO,
} from './evidence-receipt-demo';

describe('Evidence receipt DEMO schema v0 — port_2fa', () => {
  it('locks status to DEMO and wait_type to port_2fa', () => {
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.schema_version).toBe(EVIDENCE_RECEIPT_SCHEMA_VERSION);
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.status).toBe('DEMO');
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.wait_type).toBe('port_2fa');
  });

  it('keeps auth path clear and never claims live currency', () => {
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.wait.auth_path).toBe('clear');
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.currency_note.toLowerCase()).toContain('not live');
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.currency_note.toLowerCase()).not.toContain(
      'phone dollars credited',
    );
    expect(EVIDENCE_RECEIPT_DEMO_DISCLAIMER.toLowerCase()).toContain('not a live credit');
    expect(EVIDENCE_RECEIPT_DEMO_DISCLAIMER.toLowerCase()).toContain('demo');
  });

  it('states ownership boundary without affiliation or retired product words', () => {
    const { ownership } = PORT_2FA_EVIDENCE_RECEIPT_DEMO;
    expect(ownership.currency_owner.toLowerCase()).toContain('carrier');
    expect(ownership.evidence_owner.toLowerCase()).toContain('assembl');
    const blob = JSON.stringify({
      ...PORT_2FA_EVIDENCE_RECEIPT_DEMO,
      headline: EVIDENCE_RECEIPT_DEMO_HEADLINE,
      disclaimer: EVIDENCE_RECEIPT_DEMO_DISCLAIMER,
      preview: EVIDENCE_RECEIPT_PREVIEW,
      workflows: EVIDENCE_RECEIPT_WORKFLOWS,
      system: EVIDENCE_RECEIPT_SYSTEM,
      wait: EVIDENCE_RECEIPT_WAIT,
      moments: EVIDENCE_RECEIPT_MOMENTS,
      ops: EVIDENCE_RECEIPT_OPS,
    }).toLowerCase();
    expect(blob).not.toMatch(/in partnership with/);
    expect(blob).not.toMatch(/official partner/);
    expect(blob).not.toContain('kete');
    expect(blob).not.toContain('one nz');
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toContain('mahi');
    expect(blob).not.toContain('aotearoa');
    expect(blob).toContain('independent concept');
  });

  it('includes mock context_hash and rules_hash', () => {
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.context_hash.startsWith('sha256:')).toBe(true);
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.rules_hash.startsWith('sha256:')).toBe(true);
  });

  it('ships first-class Evidence receipt fields (checklist #4)', () => {
    const { evidence } = PORT_2FA_EVIDENCE_RECEIPT_DEMO;
    expect(evidence.source).toMatch(/port_2fa/);
    expect(evidence.timestamp.length).toBeGreaterThan(4);
    expect(evidence.rule.toLowerCase()).toMatch(/auth|earn/);
    expect(evidence.amount_label).toMatch(/\$0\.45/);
    expect(evidence.status).toBe('DEMO');
    expect(evidence.audit_href).toBe('#erd-receipt');
  });
});

describe('Evidence receipt PREVIEW — checklist #1198 craft locks', () => {
  it('ships the full system map campaign → confirmation', () => {
    expect(EVIDENCE_RECEIPT_SYSTEM.map((s) => s.id)).toEqual([
      'campaign',
      'earn',
      'pending-wait',
      'evidence-receipt',
      'balance',
      'reward-choice',
      'redemption',
      'confirmation',
    ]);
  });

  it('makes wait→earn explicit with status, timing, why, next action', () => {
    expect(EVIDENCE_RECEIPT_WAIT.status.toLowerCase()).toContain('waiting');
    expect(EVIDENCE_RECEIPT_WAIT.timing.toLowerCase()).toContain('≤2h');
    expect(EVIDENCE_RECEIPT_WAIT.why.toLowerCase()).toMatch(/2fa|auth/);
    expect(EVIDENCE_RECEIPT_WAIT.nextAction.toLowerCase()).toMatch(/evidence|human/);
  });

  it('ships three real journey moments with UI rows', () => {
    expect(EVIDENCE_RECEIPT_MOMENTS.map((m) => m.id)).toEqual([
      'first-earn',
      'receipt-review',
      'redeem',
    ]);
    for (const moment of EVIDENCE_RECEIPT_MOMENTS) {
      expect(moment.ui.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('exposes a light operating layer without enterprise claims', () => {
    expect(EVIDENCE_RECEIPT_OPS.tiles.map((t) => t.id)).toEqual([
      'triggers',
      'approvals',
      'reporting',
    ]);
    const blob = JSON.stringify(EVIDENCE_RECEIPT_OPS).toLowerCase();
    expect(blob).toContain('demo');
    expect(blob).toContain('sample-only');
    expect(blob).not.toContain('salesforce');
    expect(blob).not.toMatch(/\bsla\b/);
  });

  it('uses one CTA pattern: Inspect Evidence / Try port_2fa DEMO', () => {
    expect(EVIDENCE_RECEIPT_PREVIEW.ctaInspect.toLowerCase()).toContain('evidence');
    expect(EVIDENCE_RECEIPT_PREVIEW.ctaPort2fa.toLowerCase()).toContain('port_2fa');
  });

  it('leads with one outcome for members + operators', () => {
    const line = EVIDENCE_RECEIPT_PREVIEW.heroLine.toLowerCase();
    expect(line).toContain('member');
    expect(line).toContain('operator');
    expect(line).toMatch(/earn|proof/);
  });

  it('ships named wait→earn workflows with DEMO pins', () => {
    expect(EVIDENCE_RECEIPT_WORKFLOWS.map((w) => w.id)).toEqual([
      'wait-earn',
      'prove-wait',
      'redeem-credit',
      'agent-surface',
    ]);
    for (const stage of EVIDENCE_RECEIPT_WORKFLOWS) {
      expect(stage.demo).toBe(true);
      expect(stage.pinTitle.length).toBeGreaterThan(4);
      expect(stage.pinBody.toLowerCase()).toMatch(/demo|sample|approval|human/);
    }
  });

  it('frames the promise as wait→earn with Evidence receipt proof', () => {
    expect(EVIDENCE_RECEIPT_DEMO_HEADLINE.toLowerCase()).toMatch(/earn|proof|wait/);
    expect(EVIDENCE_RECEIPT_PREVIEW.productLine.toLowerCase()).toContain('evidence receipt');
    expect(EVIDENCE_RECEIPT_PREVIEW.pillars).toHaveLength(5);
    expect(EVIDENCE_RECEIPT_PREVIEW.metrics.length).toBeGreaterThanOrEqual(4);
    const blob = JSON.stringify(EVIDENCE_RECEIPT_PREVIEW).toLowerCase();
    expect(blob).toContain('evidence receipt');
    expect(blob).toContain('port_2fa');
    expect(blob).toContain('layer');
    expect(blob).toContain('independent concept');
    expect(blob).toContain('not engage people benchmarks');
  });

  it('hard-fails banned AI-slop / bare AI / mana / kete in preview copy', () => {
    const code = JSON.stringify({
      preview: EVIDENCE_RECEIPT_PREVIEW,
      workflows: EVIDENCE_RECEIPT_WORKFLOWS,
      receipt: PORT_2FA_EVIDENCE_RECEIPT_DEMO,
      system: EVIDENCE_RECEIPT_SYSTEM,
      wait: EVIDENCE_RECEIPT_WAIT,
      moments: EVIDENCE_RECEIPT_MOMENTS,
      ops: EVIDENCE_RECEIPT_OPS,
    });
    for (const re of AGENT_APP_COPY_HARD_FAIL) {
      expect(code).not.toMatch(re);
    }
  });

  it('keeps metrics directional and honest (no fake live %)', () => {
    expect(EVIDENCE_RECEIPT_PREVIEW.metricsEyebrow.toLowerCase()).toContain('demo');
    expect(EVIDENCE_RECEIPT_PREVIEW.metricsSupport.toLowerCase()).toContain('not a live feed');
    expect(EVIDENCE_RECEIPT_PREVIEW.metrics.some((m) => m.value === '0')).toBe(true);
    expect(EVIDENCE_RECEIPT_PREVIEW.metrics.some((m) => /human yes/i.test(m.label))).toBe(true);
  });
});
