/**
 * DO-oriented Pipedream Connect pack — apps DOs can declare + mapped actions.
 * Component IDs are Pipedream published action keys; unverified drifts fail
 * honestly at run time (no fabricated "connected" success).
 */

import type { DoConnectorRequirement } from './do-connectors';

export type DoConnectorPackApp = {
  /** Pipedream Connect name_slug (and ?app= filter). */
  slug: string;
  /** Alternate slugs that may appear on connected accounts. */
  aliases?: string[];
  label: string;
  group: 'communication' | 'work' | 'productivity' | 'finance';
  description: string;
  /** Capability keys this app can satisfy. */
  capabilities: string[];
  /** Env that must be present beyond base PIPEDREAM_* (e.g. DO_GMAIL_OAUTH_APP_ID). */
  requiresEnv?: string[];
  /** Default authority when used from a DO. */
  defaultAuthority: 'read' | 'prepare' | 'approval_required';
  safety: string;
};

export type DoMappedAction = {
  action: string;
  app: string;
  componentId: string;
  /** Exact component auth prop; never infer it from an app slug. */
  authProp: string;
  /** Audited upstream version, not a claim of the project's installed version. */
  version: string;
  /** Exact account app required to execute, distinct from logical/display aliases. */
  accountApp: string;
  effect: 'read' | 'write';
  note: string;
  /** Never auto-dispatch without approval when true. */
  approvalRequired: boolean;
};

/** Product pack — what Assembl DOs should be able to Connect. */
export const DO_CONNECTOR_PACK: readonly DoConnectorPackApp[] = [
  {
    slug: 'gmail',
    label: 'Gmail',
    group: 'communication',
    description: 'Read chosen mail and create unsent drafts. Never auto-send.',
    capabilities: ['email_read', 'email_draft'],
    requiresEnv: ['DO_GMAIL_OAUTH_APP_ID'],
    defaultAuthority: 'prepare',
    safety: 'Drafts only — gmail.readonly for read; create-draft never auto-sends.',
  },
  {
    slug: 'google_calendar',
    label: 'Google Calendar',
    group: 'work',
    description: 'List events and prepare new calendar events.',
    capabilities: ['calendar_read', 'calendar_draft'],
    defaultAuthority: 'prepare',
    safety: 'Create-event is a draft-style write the owner reviews in Calendar.',
  },
  {
    slug: 'google_sheets',
    label: 'Google Sheets',
    group: 'work',
    description: 'Append a reviewed row to a sheet.',
    capabilities: ['sheets_write'],
    defaultAuthority: 'approval_required',
    safety: 'Row append only after human approval on consequential paths.',
  },
  {
    slug: 'google_drive',
    label: 'Google Drive',
    group: 'work',
    description: 'Read file metadata for reviewed context.',
    capabilities: ['drive_read'],
    defaultAuthority: 'read',
    safety: 'Metadata / get-file only — no silent downloads into prompts without review.',
  },
  {
    slug: 'slack',
    aliases: ['slack_v2'],
    label: 'Slack',
    group: 'communication',
    description: 'Post a reviewed message to a channel (approval-gated).',
    capabilities: ['slack_post'],
    defaultAuthority: 'approval_required',
    safety: 'Never auto-post. Treat as approval_required even when mapped.',
  },
  {
    slug: 'hubspot',
    label: 'HubSpot',
    group: 'work',
    description: 'Create or update a reviewed contact/lead.',
    capabilities: ['crm_lead'],
    defaultAuthority: 'approval_required',
    safety: 'CRM writes need operator/owner yes.',
  },
  {
    slug: 'salesforce_rest_api',
    label: 'Salesforce',
    group: 'work',
    description: 'Create a reviewed lead.',
    capabilities: ['crm_lead'],
    defaultAuthority: 'approval_required',
    safety: 'CRM writes need operator/owner yes.',
  },
  {
    slug: 'microsoft_outlook',
    label: 'Microsoft Outlook',
    group: 'communication',
    description: 'Create an unsent Outlook draft.',
    capabilities: ['email_draft'],
    defaultAuthority: 'prepare',
    safety: 'Draft only — send is not mapped.',
  },
  {
    slug: 'notion',
    label: 'Notion',
    group: 'productivity',
    description: 'Create a page from reviewed content.',
    capabilities: ['notion_write'],
    defaultAuthority: 'approval_required',
    safety: 'Page create is approval-gated.',
  },
  {
    slug: 'todoist',
    label: 'Todoist',
    group: 'productivity',
    description: 'Create a task from a reviewed next action.',
    capabilities: ['task_create'],
    defaultAuthority: 'approval_required',
    safety: 'Task create is approval-gated.',
  },
  {
    slug: 'linear_app',
    label: 'Linear',
    group: 'productivity',
    description: 'Create an issue from a reviewed brief.',
    capabilities: ['task_create'],
    defaultAuthority: 'approval_required',
    safety: 'Issue create is approval-gated.',
  },
  {
    slug: 'stripe',
    label: 'Stripe',
    group: 'finance',
    description: 'Retrieve invoice details for bills review.',
    capabilities: ['billing_read'],
    defaultAuthority: 'read',
    safety: 'Read invoice only — no charges.',
  },
  {
    slug: 'dropbox',
    label: 'Dropbox',
    group: 'work',
    description: 'List files in a folder for reviewed context.',
    capabilities: ['drive_read'],
    defaultAuthority: 'read',
    safety: 'List/metadata style reads only in this pack.',
  },
] as const;

/**
 * Expanded action map for DO + existing dispatch.
 * Keep authProp aligned with each component’s prop name.
 */
export const DO_PIPEDREAM_ACTION_ENTRIES: readonly DoMappedAction[] = [
  {
    action: 'create_email_draft',
    app: 'gmail',
    componentId: 'gmail-create-draft',
    version: '0.2.3',
    accountApp: 'gmail',
    effect: 'write',
    authProp: 'gmail',
    note: 'Creates an unsent Gmail draft. Never sends.',
    approvalRequired: false,
  },
  {
    action: 'create_email_draft',
    app: 'microsoft_outlook',
    componentId: 'microsoft_outlook-create-draft-email',
    version: '0.0.35',
    accountApp: 'microsoft_outlook',
    effect: 'write',
    authProp: 'microsoftOutlook',
    note: 'Creates an unsent Outlook draft.',
    approvalRequired: false,
  },
  {
    action: 'list_calendar_events',
    app: 'google_calendar',
    componentId: 'google_calendar-list-events',
    version: '0.1.1',
    accountApp: 'google_calendar',
    effect: 'read',
    authProp: 'googleCalendar',
    note: 'Lists events for a calendar window (prefer fields=compact).',
    approvalRequired: false,
  },
  {
    action: 'create_calendar_event',
    app: 'google_calendar',
    componentId: 'google_calendar-create-event',
    version: '1.1.2',
    accountApp: 'google_calendar',
    effect: 'write',
    authProp: 'googleCalendar',
    note: 'Creates a calendar event the owner can edit/cancel in Google Calendar.',
    approvalRequired: true,
  },
  {
    action: 'add_sheet_row',
    app: 'google_sheets',
    componentId: 'google_sheets-add-single-row',
    version: '3.0.1',
    accountApp: 'google_sheets',
    effect: 'write',
    authProp: 'googleSheets',
    note: 'Appends one reviewed row.',
    approvalRequired: true,
  },
  {
    action: 'get_drive_file',
    app: 'google_drive',
    componentId: 'google_drive-get-file-by-id',
    version: '0.0.22',
    accountApp: 'google_drive',
    effect: 'read',
    authProp: 'googleDrive',
    note: 'Reads file metadata by id.',
    approvalRequired: false,
  },
  {
    action: 'post_slack_message',
    app: 'slack',
    componentId: 'slack_v2-send-message',
    version: '0.2.4',
    accountApp: 'slack_v2',
    effect: 'write',
    authProp: 'slack',
    note: 'Posts a reviewed Slack message (approval-gated). Component package is slack_v2.',
    approvalRequired: true,
  },
  {
    action: 'create_lead',
    app: 'hubspot',
    componentId: 'hubspot-create-or-update-contact',
    version: '1.0.1',
    accountApp: 'hubspot',
    effect: 'write',
    authProp: 'hubspot',
    note: 'Creates or updates a HubSpot contact.',
    approvalRequired: true,
  },
  {
    action: 'create_lead',
    app: 'salesforce_rest_api',
    componentId: 'salesforce_rest_api-create-lead',
    version: '0.4.1',
    accountApp: 'salesforce_rest_api',
    effect: 'write',
    authProp: 'salesforce',
    note: 'Creates a Salesforce lead.',
    approvalRequired: true,
  },
  {
    action: 'create_notion_page',
    app: 'notion',
    componentId: 'notion-create-page',
    version: '1.0.1',
    accountApp: 'notion',
    effect: 'write',
    authProp: 'notion',
    note: 'Creates a Notion page from reviewed content.',
    approvalRequired: true,
  },
  {
    action: 'create_task',
    app: 'todoist',
    componentId: 'todoist-create-task',
    version: '0.0.12',
    accountApp: 'todoist',
    effect: 'write',
    authProp: 'todoist',
    note: 'Creates a Todoist task.',
    approvalRequired: true,
  },
  {
    action: 'create_task',
    app: 'linear_app',
    componentId: 'linear_app-create-issue',
    version: '0.4.21',
    accountApp: 'linear_app',
    effect: 'write',
    authProp: 'linearApp',
    note: 'Creates a Linear issue.',
    approvalRequired: true,
  },
  {
    action: 'retrieve_invoice',
    app: 'stripe',
    componentId: 'stripe-retrieve-invoice',
    version: '0.1.5',
    accountApp: 'stripe',
    effect: 'read',
    authProp: 'app',
    note: 'Reads a Stripe invoice for bills review.',
    approvalRequired: false,
  },
  {
    action: 'list_folder',
    app: 'dropbox',
    componentId: 'dropbox-list-file-folders-in-a-folder',
    version: '0.0.14',
    accountApp: 'dropbox',
    effect: 'read',
    authProp: 'dropbox',
    note: 'Lists files/folders in a Dropbox path.',
    approvalRequired: false,
  },
] as const;

/** Exact app for new Connect links; a display alias never certifies a grant. */
export function connectionApp(slug: string): string | null {
  return DO_PIPEDREAM_ACTION_ENTRIES.find(entry => entry.app === slug || entry.accountApp === slug)?.accountApp ?? null;
}

export function packAppSlugs(): string[] {
  return DO_CONNECTOR_PACK.map((app) => app.slug);
}

export function matchesPackApp(accountSlug: string, packSlug: string): boolean {
  const app = DO_CONNECTOR_PACK.find((entry) => entry.slug === packSlug);
  if (!app) return accountSlug === packSlug;
  if (accountSlug === app.slug) return true;
  return Boolean(app.aliases?.includes(accountSlug));
}

export function householdFloorConnectorRequirements(
  visibility: 'public_template' | 'owner_private',
): DoConnectorRequirement[] {
  const gmail = DO_CONNECTOR_PACK.find((app) => app.slug === 'gmail')!;
  const calendar = DO_CONNECTOR_PACK.find((app) => app.slug === 'google_calendar')!;
  return [
    {
      capabilityKey: 'email_read',
      app: gmail.slug,
      label: gmail.label,
      required: false,
      authority: 'read',
      purpose:
        visibility === 'public_template'
          ? 'Optional school-mail context for the SCHOOL seat (read chosen messages).'
          : 'School admin / family mail for SCHOOL seat via DO Gmail readonly path.',
      safety: gmail.safety,
    },
    {
      capabilityKey: 'calendar_read',
      app: calendar.slug,
      label: calendar.label,
      required: false,
      authority: 'prepare',
      purpose: 'Optional custody / pickup calendar context for TRAVEL and DESK seats.',
      safety: calendar.safety,
    },
  ];
}

export function actionMapFromPack(): Record<string, Record<string, DoMappedAction>> {
  const map: Record<string, Record<string, DoMappedAction>> = {};
  for (const entry of DO_PIPEDREAM_ACTION_ENTRIES) {
    map[entry.action] ??= {};
    map[entry.action][entry.app] = { ...entry };
  }
  return map;
}
