import { describe, expect, it } from 'vitest';
import {
  MANA_RECEIPT_DEMO_DISCLAIMER,
  MANA_RECEIPT_SCHEMA_VERSION,
  PORT_2FA_MANA_RECEIPT_DEMO,
} from './mana-receipt-demo';

describe('Mana Receipt DEMO schema v0 — port_2fa', () => {
  it('locks status to DEMO and wait_type to port_2fa', () => {
    expect(PORT_2FA_MANA_RECEIPT_DEMO.schema_version).toBe(MANA_RECEIPT_SCHEMA_VERSION);
    expect(PORT_2FA_MANA_RECEIPT_DEMO.status).toBe('DEMO');
    expect(PORT_2FA_MANA_RECEIPT_DEMO.wait_type).toBe('port_2fa');
  });

  it('keeps auth path clear and never claims live currency', () => {
    expect(PORT_2FA_MANA_RECEIPT_DEMO.wait.auth_path).toBe('clear');
    expect(PORT_2FA_MANA_RECEIPT_DEMO.currency_note.toLowerCase()).toContain('not live');
    expect(PORT_2FA_MANA_RECEIPT_DEMO.currency_note.toLowerCase()).not.toContain(
      'phone dollars credited',
    );
    expect(MANA_RECEIPT_DEMO_DISCLAIMER.toLowerCase()).toContain('not a live credit');
    expect(MANA_RECEIPT_DEMO_DISCLAIMER.toLowerCase()).toContain('demo');
  });

  it('states ownership boundary without One NZ affiliation', () => {
    const { ownership } = PORT_2FA_MANA_RECEIPT_DEMO;
    expect(ownership.currency_owner.toLowerCase()).toContain('carrier');
    expect(ownership.evidence_owner.toLowerCase()).toContain('assembl');
    expect(JSON.stringify(PORT_2FA_MANA_RECEIPT_DEMO).toLowerCase()).not.toContain('partnership');
    expect(JSON.stringify(PORT_2FA_MANA_RECEIPT_DEMO).toLowerCase()).not.toContain('kete');
    expect(JSON.stringify(PORT_2FA_MANA_RECEIPT_DEMO).toLowerCase()).not.toContain('one nz');
  });

  it('includes mock context_hash and rules_hash', () => {
    expect(PORT_2FA_MANA_RECEIPT_DEMO.context_hash.startsWith('sha256:')).toBe(true);
    expect(PORT_2FA_MANA_RECEIPT_DEMO.rules_hash.startsWith('sha256:')).toBe(true);
  });
});
