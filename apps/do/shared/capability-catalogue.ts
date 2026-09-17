export type DoCapabilityKind = 'connect' | 'platform' | 'spatial';

export type DoCapabilityCard = {
  key: string;
  label: string;
  group: 'communication' | 'work' | 'creative' | 'spatial' | 'productivity' | 'finance';
  description: string;
  kind: DoCapabilityKind;
  apps?: Array<{ slug: string; label: string }>;
  authority: 'read' | 'prepare' | 'approval_required';
  status: 'available' | 'connectable' | 'preview';
};

/**
 * User-facing capability catalogue. DO asks for capabilities; connector/provider
 * details stay behind this layer. App slugs match the DO connector pack /
 * Pipedream Connect name_slugs where exercised.
 */
export const DO_CAPABILITY_CATALOGUE: readonly DoCapabilityCard[] = [
  {
    key: 'email_read',
    label: 'Read chosen email',
    group: 'communication',
    description: 'Read chosen Gmail messages for a task you approve. This connection cannot change your mail or send messages.',
    kind: 'connect',
    apps: [{ slug: 'gmail', label: 'Gmail' }],
    authority: 'read',
    status: 'connectable',
  },
  {
    key: 'email_draft',
    label: 'Prepare email in DO',
    group: 'communication',
    description: 'Prepare text in DO without connecting a mailbox. Gmail access here is read-only. Saving a draft in Gmail needs a separately approved write permission. Nothing is sent.',
    kind: 'connect',
    apps: [
      { slug: 'gmail', label: 'Gmail' },
      { slug: 'microsoft_outlook', label: 'Microsoft Outlook' },
    ],
    authority: 'prepare',
    status: 'connectable',
  },
  {
    key: 'calendar_read',
    label: 'Read calendar',
    group: 'work',
    description: 'List events from a connected Google Calendar for schedule boards.',
    kind: 'connect',
    apps: [{ slug: 'google_calendar', label: 'Google Calendar' }],
    authority: 'read',
    status: 'connectable',
  },
  {
    key: 'calendar_draft',
    label: 'Create a calendar event',
    group: 'work',
    description: 'Add an event to Google Calendar after you approve the details. This changes your calendar; it is not a draft.',
    kind: 'connect',
    apps: [{ slug: 'google_calendar', label: 'Google Calendar' }],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'sheets_write',
    label: 'Add reviewed data to Sheets',
    group: 'work',
    description: 'Add a row to Google Sheets after you review and approve the contents.',
    kind: 'connect',
    apps: [{ slug: 'google_sheets', label: 'Google Sheets' }],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'drive_read',
    label: 'Read Drive / files',
    group: 'work',
    description: 'Read file metadata from Google Drive or list a Dropbox folder for reviewed context.',
    kind: 'connect',
    apps: [
      { slug: 'google_drive', label: 'Google Drive' },
      { slug: 'dropbox', label: 'Dropbox' },
    ],
    authority: 'read',
    status: 'connectable',
  },
  {
    key: 'slack_post',
    label: 'Post to Slack',
    group: 'communication',
    description: 'Post a message to Slack after you review and approve it. Nothing is posted automatically.',
    kind: 'connect',
    apps: [{ slug: 'slack', label: 'Slack' }],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'crm_lead',
    label: 'Prepare CRM updates',
    group: 'work',
    description: 'Create a lead or contact after you review and approve the details.',
    kind: 'connect',
    apps: [
      { slug: 'hubspot', label: 'HubSpot' },
      { slug: 'salesforce_rest_api', label: 'Salesforce' },
    ],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'notion_write',
    label: 'Create Notion page',
    group: 'productivity',
    description: 'Create a page in Notion after you approve its contents.',
    kind: 'connect',
    apps: [{ slug: 'notion', label: 'Notion' }],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'task_create',
    label: 'Create a task',
    group: 'productivity',
    description: 'Create a Todoist task or Linear issue from a reviewed next action.',
    kind: 'connect',
    apps: [
      { slug: 'todoist', label: 'Todoist' },
      { slug: 'linear_app', label: 'Linear' },
    ],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'billing_read',
    label: 'Read invoices',
    group: 'finance',
    description: 'Retrieve Stripe invoice details for bills review. No charges.',
    kind: 'connect',
    apps: [{ slug: 'stripe', label: 'Stripe' }],
    authority: 'read',
    status: 'connectable',
  },
  {
    key: 'image_generation',
    label: 'Create images',
    group: 'creative',
    description: 'Prepare images from a visual brief using tools provided by assembl. No personal account connection is needed.',
    kind: 'platform',
    authority: 'prepare',
    status: 'available',
  },
  {
    key: 'video_generation',
    label: 'Create motion/video',
    group: 'creative',
    description: 'Planned connection to Studio motion and video tools. Rendering is not yet available from this DO surface.',
    kind: 'platform',
    authority: 'prepare',
    status: 'preview',
  },
  {
    key: 'web_3d',
    label: 'Build interactive 3D',
    group: 'spatial',
    description: 'Prepare interactive 3D product and Office experiences with the tools included in DO.',
    kind: 'spatial',
    authority: 'prepare',
    status: 'available',
  },
  {
    key: 'gaussian_splats',
    label: 'Use spatial captures / splats',
    group: 'spatial',
    description: 'A planned way to work with captured 3D spaces. Not yet available in DO.',
    kind: 'spatial',
    authority: 'prepare',
    status: 'preview',
  },
] as const;

export const CONNECTABLE_DO_APPS = new Set(
  DO_CAPABILITY_CATALOGUE.flatMap((cap) => cap.apps?.map((app) => app.slug) ?? []),
);
