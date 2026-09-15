/**
 * Connector stubs for DO Agent OS v0.
 * Honest DEMO: none are live OAuth — “hook later” is the default.
 */

import type { ConnectorChoice, ConnectorHint } from './types';

export interface ConnectorStub {
  id: ConnectorChoice;
  name: string;
  honesty: string;
}

/** Public connector stubs — SAP is private (Mitre pack only). */
export const PUBLIC_CONNECTOR_STUBS: ConnectorStub[] = [
  {
    id: 'hook-later',
    name: 'Hook later',
    honesty: 'DEMO default · no connector wired. Agent runs on fixtures / page context only.',
  },
  {
    id: 'email',
    name: 'Email',
    honesty: 'DEMO stub · nothing is sent. Drafts stay under Needs you until you approve.',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    honesty: 'DEMO stub · no calendar write. Suggestions only until you approve.',
  },
  {
    id: 'xero',
    name: 'Xero',
    honesty: 'DEMO stub · no live Xero OAuth. Recurring-cost fixtures only.',
  },
  {
    id: 'akahu',
    name: 'Akahu',
    honesty: 'DEMO stub · no live bank connection. Statement fixtures only.',
  },
];

const SAP_CONNECTOR: ConnectorStub = {
  id: 'sap',
  name: 'SAP',
  honesty: 'DEMO stub · SAP read/write not connected. Landscape notes are fixtures only.',
};

/** Full stub list including private SAP (for Mitre pack route). */
export const CONNECTOR_STUBS: ConnectorStub[] = [...PUBLIC_CONNECTOR_STUBS, SAP_CONNECTOR];

export function connectorsForPack(pack: 'public' | 'mitre10' = 'public'): ConnectorStub[] {
  return pack === 'mitre10' ? CONNECTOR_STUBS : PUBLIC_CONNECTOR_STUBS;
}

export function getConnector(id: ConnectorChoice | ConnectorHint | undefined): ConnectorStub {
  const found = CONNECTOR_STUBS.find((c) => c.id === id);
  return found ?? CONNECTOR_STUBS[0];
}
