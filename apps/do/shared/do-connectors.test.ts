import { describe, expect, it } from 'vitest';

import {
  DO_CONNECTOR_FLOW_SUMMARY,
  HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS,
  resolveConnectorState,
  resolveDoConnectorStatuses,
} from './do-connectors';

describe('DO connectors', () => {
  it('declares optional Gmail on the public Household Floor without tokens', () => {
    expect(HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS[0]?.app).toBe('gmail');
    expect(HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS[0]?.required).toBe(false);
    expect(HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS[0]?.authority).toBe('read');
    expect(HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS[0]?.safety).toMatch(/Drafts only/i);
    expect(JSON.stringify(HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS)).not.toMatch(/client_secret|access_token|refresh_token/i);
    expect(DO_CONNECTOR_FLOW_SUMMARY[0]).toMatch(/Pipedream/);
  });

  it('resolves connect / connected / needs_reconnect / sign_in', () => {
    const requirement = HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS[0]!;
    expect(resolveConnectorState(requirement, {
      signedIn: false,
      configured: true,
      availability: { gmail: true },
      accounts: [],
    })).toBe('sign_in');

    expect(resolveConnectorState(requirement, {
      signedIn: true,
      configured: true,
      availability: { gmail: true },
      accounts: [],
    })).toBe('connect');

    expect(resolveConnectorState(requirement, {
      signedIn: true,
      configured: true,
      availability: { gmail: true },
      accounts: [{ app: 'gmail', label: 'Kate', healthy: true }],
    })).toBe('connected');

    expect(resolveConnectorState(requirement, {
      signedIn: true,
      configured: true,
      availability: { gmail: true },
      accounts: [{ app: 'gmail', label: 'Kate', healthy: false }],
    })).toBe('needs_reconnect');

    const statuses = resolveDoConnectorStatuses(HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS, {
      signedIn: true,
      configured: false,
      availability: { gmail: false },
      accounts: [],
    });
    expect(statuses[0]?.state).toBe('setup_needed');
  });
});
