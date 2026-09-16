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

export function resolveConnectorState(
  requirement: DoConnectorRequirement,
  snapshot: DoConnectionsSnapshot,
): DoConnectorUiState {
  if (!snapshot.signedIn) return 'sign_in';
  if (!snapshot.configured || snapshot.availability[requirement.app] === false) return 'setup_needed';
  if (snapshot.accountsAvailable === false) return 'accounts_unknown';
  const account = snapshot.accounts.find((row) => row.app === requirement.app);
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
    const account = snapshot.accounts.find((row) => row.app === requirement.app);
    return {
      ...requirement,
      state,
      stateLabel: connectorStateLabel(state),
      accountLabel: account?.label,
    };
  });
}

/** Household Floor public defaults — optional Gmail for school mail; drafts-only. */
export const HOUSEHOLD_FLOOR_PUBLIC_CONNECTORS: DoConnectorRequirement[] = [
  {
    capabilityKey: 'email_read',
    app: 'gmail',
    label: 'Gmail',
    required: false,
    authority: 'read',
    purpose: 'Optional school-mail context for the SCHOOL seat (read chosen messages).',
    safety: 'Drafts only — never auto-send. Public template ships with no tokens.',
  },
];

/** Owner-private Household Floor — same optional Gmail wiring; still drafts-only. */
export const HOUSEHOLD_FLOOR_OWNER_CONNECTORS: DoConnectorRequirement[] = [
  {
    capabilityKey: 'email_read',
    app: 'gmail',
    label: 'Gmail',
    required: false,
    authority: 'read',
    purpose: 'School admin / family mail for SCHOOL seat via existing DO Gmail readonly path.',
    safety: 'gmail.readonly through Pipedream Connect. Never send without explicit approve.',
  },
];

export const DO_CONNECTOR_FLOW_SUMMARY = [
  'Pipedream project (PIPEDREAM_PROJECT_ID + client credentials)',
  'Connect apps enabled in Pipedream (Gmail uses DO_GMAIL_OAUTH_APP_ID + gmail.readonly)',
  'Vercel / .env.local server env',
  'DO declares required/optional connectors (no tokens in templates)',
  'User signs in → Connect link → grant stays on Pipedream',
  'DO tools read via Connect proxy; drafts-only / approval for send',
] as const;
