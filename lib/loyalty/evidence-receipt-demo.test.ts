import { describe, expect, it } from 'vitest';
import { AGENT_APP_COPY_HARD_FAIL } from '@/lib/agent-app/craft-canon';
import {
  EVIDENCE_RECEIPT_DEMO_DISCLAIMER,
  EVIDENCE_RECEIPT_DEMO_HEADLINE,
  EVIDENCE_RECEIPT_PREVIEW,
  EVIDENCE_RECEIPT_SCHEMA_VERSION,
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
});

describe('Evidence receipt PREVIEW — Engage People–class craft locks', () => {
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
    expect(EVIDENCE_RECEIPT_PREVIEW.heroLine.toLowerCase()).toContain('wait');
    expect(EVIDENCE_RECEIPT_PREVIEW.heroLine.toLowerCase()).toContain('earn');
    expect(EVIDENCE_RECEIPT_PREVIEW.productLine.toLowerCase()).toContain('evidence receipt');
    expect(EVIDENCE_RECEIPT_PREVIEW.pillars).toHaveLength(5);
    expect(EVIDENCE_RECEIPT_PREVIEW.metrics.length).toBeGreaterThanOrEqual(4);
    expect(EVIDENCE_RECEIPT_PREVIEW.chatOpeners.length).toBeGreaterThanOrEqual(3);
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
