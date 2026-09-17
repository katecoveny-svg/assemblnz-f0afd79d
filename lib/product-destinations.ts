/**
 * Product entry routes on assembl and the existing hosted workspaces.
 *
 * Pursuit and Creative Studio share the original Sites app. Keep workspace
 * launches as top-level navigations so that its sign-in, owner identity,
 * saved records and reviewed client links remain on the same origin.
 *
 * Sites project appgprj_6aa356a9700081919f7959cc70c9f6d8 was confirmed
 * active at this origin on 15 September 2026. Workspace access remains
 * restricted by the application; these links do not grant membership.
 */
export const PURSUIT_SITE_ORIGIN =
  'https://assembl-pursuit.katecoveny.chatgpt.site';

export const PRODUCT_DESTINATIONS = {
  pursuit: {
    label: 'Pursuit',
    /** Public story page on assembl. */
    overview: '/pursuit',
    example: PURSUIT_SITE_ORIGIN,
    /** Working client hub — public nav / CTAs open here (Kate 2026-09-17). */
    workspace: `${PURSUIT_SITE_ORIGIN}/studios`,
    hub: PURSUIT_SITE_ORIGIN,
    external: true as const,
  },
  do: {
    label: 'DO',
    overview: '/do',
    workspace: '/do',
  },
  studio: {
    label: 'Creative Studio',
    /** Public product page on assembl. */
    overview: '/creative-studio',
    /** Working Creative Studio workspace — public nav / CTAs open here. */
    workspace: `${PURSUIT_SITE_ORIGIN}/agency`,
  },
  /**
   * Assembl agent Studio (koro workbench + Task DO Maker).
   * Not a public product door — splash-gated / not linked from public nav.
   */
  agentStudio: {
    label: 'Assembl Studio',
    overview: '/studio',
    taskDoMaker: '/studio/do-maker',
    /** Mode B partner-facing alias index (redirects into /studio/do-maker?mode=partner). */
    partnerDoMaker: '/do/maker/partner',
  },
} as const;

/** Existing contact route for a single product or a complete system scope. */
export const PRODUCT_ENQUIRY_HREF = '/contact';
