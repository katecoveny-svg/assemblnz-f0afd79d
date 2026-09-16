/**
 * DO connector wiring — declare which Pipedream Connect apps a DO needs,
 * and resolve connect / connected / needs_reconnect UI state.
 *
 * Reuses the existing Pipedream Connect stack (no second OAuth).
 * Capability catalogue remains the user-facing layer; apps are Pipedream name_slugs.
 */

import {
  CONNECTABLE_DO_APPS,
  DO_CAPABILITY_CATALOGUE,
  type DoCapabilityCard,
} from './capability-catalogue';
import { householdFloorConnectorRequirements } from './do-connector-pack';

export type DoConnectorAuthority = DoCapabilityCard['authority'];

/** Declared on a DO / template — not live tokens. */
export type DoConnectorRequirement = {
  /** Catalogue capability key, e.g. email_read */
  capabilityKey: string;
  /** Pipedream app name_slug, e.g. gmail */
  app: string;
  label: string;
  /** false = optional for the DO to run boards; true = blocked until connected */
  required: boolean;
  authority: DoConnectorAuthority;
  purpose: string;
  /** Safety note shown beside the connector chip */
  safety?: string;
};

export type DoConnectorUiState =
  | 'sign_in'
  | 'setup_needed'
  | 'connect'
  | 'connected'
  | 'needs_reconnect'
  | 'accounts_unknown';

export type DoConnectorAccountSnapshot = {
  app: string;
  label: string;
  healthy: boolean;
};

export type DoConnectionsSnapshot = {
  signedIn: boolean;
  configured: boolean;
  availability: Record<string, boolean>;
  accountsAvailable?: boolean;
  accounts: DoConnectorAccountSnapshot[];
};

export type DoConnectorStatus = DoConnectorRequirement & {
  state: DoConnectorUiState;
  stateLabel: string;
  accountLabel?: string;
};

export function isConnectableDoApp(app: string): boolean {
  return CONNECTABLE_DO_APPS.has(app);
}

export function capabilityForKey(key: string): DoCapabilityCard | undefined {
  return DO_CAPABILITY_CATALOGUE.find((card) => card.key === key);
}

export function connectorStateLabel(state: DoConnectorUiState): string {
  switch (state) {
    case 'sign_in':
      return 'Sign in to connect';
    case 'setup_needed':
      return 'Setup needed';
    case 'connect':
      return 'Connect';
    case 'connected':
      return 'Connected';
    case 'needs_reconnect':
      return 'Needs reconnect';
    case 'accounts_unknown':
      return 'Status unknown';
    default:
      return 'Connect';
  }
}

function accountMatchesApp(accountApp: string, requiredApp: string): boolean {
  if (accountApp === requiredApp) return true;
  if (requiredApp === 'slack' && (accountApp === 'slack' || accountApp === 'slack_v2')) return true;
  return false;
}

export function resolveConnectorState(
  requirement: DoConnectorRequirement,
  snapshot: DoConnectionsSnapshot,
): DoConnectorUiState {
  if (!snapshot.signedIn) return 'sign_in';
  if (!snapshot.configured || snapshot.availability[requirement.app] === false) return 'setup_needed';
  if (snapshot.accountsAvailable === false) return 'accounts_unknown';
  const account = snapshot.accounts.find((row) => accountMatchesApp(row.app, requirement.app));
  if (!account) return 'connect';
  if (!account.healthy) return 'needs_reconnect';
  return 'connected';
}

export function resolveDoConnectorStatuses(
  requirements: DoConnectorRequirement[],
  snapshot: DoConnectionsSnapshot,
): DoConnectorStatus[] {
  return requirements.map((requirement) => {
    const state = resolveConnectorState(requirement, snapshot);
    const account = snapshot.accounts.find((row) => accountMatchesApp(row.app, requirement.app));
    return {
      ...requirement,
      state,
      stateLabel: connectorStateLabel(state),
      accountLabel: account?.label,
    };
  });
}

export const HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS = householdFloorConnectorRequirements('public_template');
export const HOUSEHOLD_FLOOR_OWNER_CONNECTORS = householdFloorConnectorRequirements('owner_private');

export const DO_CONNECTOR_FLOW_SUMMARY = [
  'Pipedream project (PIPEDREAM_PROJECT_ID + client credentials)',
  'Connect apps enabled in Pipedream (Gmail uses DO_GMAIL_OAUTH_APP_ID + gmail.readonly)',
  'Vercel / .env.local server env',
  'DO declares required/optional connectors (no tokens in templates)',
  'User signs in → Connect link → grant stays on Pipedream',
  'DO tools / mapped actions run via Connect; drafts-only / approval for send & posts',
] as const;
