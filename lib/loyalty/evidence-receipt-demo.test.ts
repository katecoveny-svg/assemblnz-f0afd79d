import { describe, expect, it } from 'vitest';
import {
  EVIDENCE_RECEIPT_DEMO_DISCLAIMER,
  EVIDENCE_RECEIPT_DEMO_HEADLINE,
  EVIDENCE_RECEIPT_SCHEMA_VERSION,
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
    }).toLowerCase();
    expect(blob).not.toContain('partnership');
    expect(blob).not.toContain('kete');
    expect(blob).not.toContain('one nz');
    expect(blob).not.toContain('mana');
    expect(blob).not.toContain('mahi');
    expect(blob).not.toContain('aotearoa');
  });

  it('includes mock context_hash and rules_hash', () => {
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.context_hash.startsWith('sha256:')).toBe(true);
    expect(PORT_2FA_EVIDENCE_RECEIPT_DEMO.rules_hash.startsWith('sha256:')).toBe(true);
  });
});
