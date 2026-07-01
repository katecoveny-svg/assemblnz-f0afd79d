import { describe, it, expect } from 'vitest';
import { scanSensitive } from '../safety';
import {
  agentEmailAddress,
  agentSlugForLocalPart,
  emailLocalPartForAgent,
  agentHasEmail,
} from '../addresses';

describe('scanSensitive — quarantine detection', () => {
  it('passes ordinary mail through', () => {
    expect(scanSensitive('Hi, can you send the GST figures for March?').quarantine).toBe(false);
    expect(scanSensitive('').quarantine).toBe(false);
  });

  it('quarantines passwords and PINs', () => {
    expect(scanSensitive('my password: hunter2').quarantine).toBe(true);
    expect(scanSensitive('PIN = 4821').quarantine).toBe(true);
  });

  it('quarantines API keys, secrets and private keys', () => {
    expect(scanSensitive('api_key: abc123XYZ').quarantine).toBe(true);
    expect(scanSensitive('here is the token sk_live_abcdef0123456789').quarantine).toBe(true);
    expect(scanSensitive('-----BEGIN RSA PRIVATE KEY-----').quarantine).toBe(true);
  });

  it('quarantines a valid (Luhn) card number but not a random digit run', () => {
    // 4242 4242 4242 4242 is a Luhn-valid Visa test number.
    expect(scanSensitive('card 4242 4242 4242 4242').quarantine).toBe(true);
    // Invoice number, not a card — fails Luhn.
    expect(scanSensitive('invoice 1234 5678 9012 3456 attached').quarantine).toBe(false);
  });

  it('reports a reason when quarantined', () => {
    expect(scanSensitive('cvv: 123').reason).toBeTruthy();
  });
});

describe('agent email addresses', () => {
  it('maps roster slugs to pretty addresses', () => {
    expect(agentEmailAddress('pikau')).toBe('customs@assembl.co.nz');
    expect(agentEmailAddress('food-temp-logs')).toBe('food-temp@assembl.co.nz');
    expect(agentEmailAddress('atlas')).toBe('atlas@assembl.co.nz');
    expect(emailLocalPartForAgent('compliance-check')).toBe('compliance');
  });

  it('returns null for agents with no inbox', () => {
    expect(agentEmailAddress('dawn')).toBeNull();
    expect(agentHasEmail('dawn')).toBe(false);
  });

  it('resolves an inbound local-part back to a slug', () => {
    // customs-entry is KILLED; the `customs@` local-part now belongs to pikau.
    expect(agentSlugForLocalPart('customs')).toBe('pikau');
    // maritime-brief is KILLED; the `tide@` local-part now belongs to tide-weather.
    expect(agentSlugForLocalPart('tide')).toBe('tide-weather');
    expect(agentSlugForLocalPart('noreply')).toBeNull();
  });
});
