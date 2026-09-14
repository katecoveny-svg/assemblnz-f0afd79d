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

export const CONNECTOR_STUBS: ConnectorStub[] = [
  {
    id: 'hook-later',
    name: 'Hook later',
    honesty: 'DEMO default · no connector wired. Agent runs on fixtures / page context only.',
  },
  {
    id: 'sap',
    name: 'SAP',
    honesty: 'DEMO stub · SAP read/write not connected. Landscape notes are fixtures only.',
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

export function getConnector(id: ConnectorChoice | ConnectorHint | undefined): ConnectorStub {
  const found = CONNECTOR_STUBS.find((c) => c.id === id);
  return found ?? CONNECTOR_STUBS[0];
}
