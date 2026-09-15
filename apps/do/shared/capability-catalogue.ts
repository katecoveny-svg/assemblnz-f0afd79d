export type DoCapabilityKind = 'connect' | 'platform' | 'spatial';

export type DoCapabilityCard = {
  key: string;
  label: string;
  group: 'communication' | 'work' | 'creative' | 'spatial';
  description: string;
  kind: DoCapabilityKind;
  apps?: Array<{ slug: string; label: string }>;
  authority: 'read' | 'prepare' | 'approval_required';
  status: 'available' | 'connectable' | 'preview';
};

/**
 * User-facing capability catalogue. DO asks for capabilities; connector/provider
 * details stay behind this layer. Only app slugs already exercised in this repo
 * are marked connectable here.
 */
export const DO_CAPABILITY_CATALOGUE: readonly DoCapabilityCard[] = [
  {
    key: 'email_read',
    label: 'Read chosen email',
    group: 'communication',
    description: 'Use a connected mailbox as reviewed context. Gmail currently has the narrowest production pilot path.',
    kind: 'connect',
    apps: [{ slug: 'gmail', label: 'Gmail' }],
    authority: 'read',
    status: 'connectable',
  },
  {
    key: 'email_draft',
    label: 'Prepare email drafts',
    group: 'communication',
    description: 'Prepare an unsent draft in a connected mailbox. Sending remains a separate approval-gated action.',
    kind: 'connect',
    apps: [{ slug: 'microsoft_outlook', label: 'Microsoft Outlook' }],
    authority: 'prepare',
    status: 'connectable',
  },
  {
    key: 'crm_lead',
    label: 'Prepare CRM updates',
    group: 'work',
    description: 'Create a reviewed lead/contact through the existing connector-action approval path.',
    kind: 'connect',
    apps: [{ slug: 'hubspot', label: 'HubSpot' }, { slug: 'salesforce_rest_api', label: 'Salesforce' }],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'sheets_write',
    label: 'Add reviewed data to Sheets',
    group: 'work',
    description: 'Append a reviewed row through the existing connector-action approval path.',
    kind: 'connect',
    apps: [{ slug: 'google_sheets', label: 'Google Sheets' }],
    authority: 'approval_required',
    status: 'connectable',
  },
  {
    key: 'image_generation',
    label: 'Create images',
    group: 'creative',
    description: 'Route visual briefs through Assembl-configured image providers without asking every user for a provider key.',
    kind: 'platform',
    authority: 'prepare',
    status: 'available',
  },
  {
    key: 'video_generation',
    label: 'Create motion/video',
    group: 'creative',
    description: 'Prepare and render short visual outputs through configured Studio/DO production tools.',
    kind: 'platform',
    authority: 'prepare',
    status: 'available',
  },
  {
    key: 'web_3d',
    label: 'Build interactive 3D',
    group: 'spatial',
    description: 'Use the existing Three.js / React Three Fiber stack for interactive product and Office experiences.',
    kind: 'spatial',
    authority: 'prepare',
    status: 'available',
  },
  {
    key: 'gaussian_splats',
    label: 'Use spatial captures / splats',
    group: 'spatial',
    description: 'Candidate pipeline for Gaussian-splat scenes. Renderer/editor adapters must pass performance and license review before promotion.',
    kind: 'spatial',
    authority: 'prepare',
    status: 'preview',
  },
] as const;

export const CONNECTABLE_DO_APPS = new Set(
  DO_CAPABILITY_CATALOGUE.flatMap((cap) => cap.apps?.map((app) => app.slug) ?? []),
);
