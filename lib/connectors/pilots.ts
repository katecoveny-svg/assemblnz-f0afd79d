/**
 * Known pilot connection ids — code is truth, same as the tenant registry.
 *
 * These rows always appear on /admin/connectors, connected or not, so the
 * first real pilots have a visible home before their customer clicks a
 * Connect link. Convention (matches the connect-link route's validation):
 * `tenant:<slug>` for a shared workspace account, `agent:<slug>` when a
 * single agent gets its own.
 */

export type PilotConnection = {
  externalUserId: string;
  label: string;
};

export const PILOT_CONNECTIONS: PilotConnection[] = [
  { externalUserId: 'tenant:happytails', label: 'Happy Tails — workspace' },
  { externalUserId: 'agent:roster', label: 'Roster (Happy Tails pilot agent)' },
];

export const EXTERNAL_USER_ID_RE = /^(agent|tenant):[a-z0-9-]+$/;
