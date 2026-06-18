/**
 * dash by assembl — Dash Loader public API types.
 *
 * Three modes share one dachshund visual but diverge on revenue flow and
 * UI affordances:
 *   - consumer   : end-user opt-in, micro-revenue → keep or donate (B2C)
 *   - whitelabel : customer-branded mascot, internal messages, SaaS sub (B2B)
 *   - publisher  : assembl-fill ad SDK, rev-share contract (embedded)
 *
 * PRIVACY POSTURE (see DashLoader.tsx header): the loader NEVER reads page
 * content, prompts, files, user data or code. It only renders wait-state UI.
 */

export type DashStatus = 'idle' | 'processing' | 'success' | 'error';

// ─── Consumer mode ───────────────────────────────────────────────

export type CharityId = 'spca-nz' | 'trees-that-count' | 'foodbank-nz';
export type SelfMethod = 'prezzy' | 'airpoints' | 'stripe-connect';

export type PayoutDestination =
  | { kind: 'self'; method: SelfMethod }
  | { kind: 'charity'; charityId: CharityId };

export interface ConsumerSettings {
  optedIn: boolean;
  destination: PayoutDestination;
  /** Privacy Act 2020 IPP 3A disclosure acknowledged by the user. */
  hasConsentedToDisclosure: boolean;
}

// ─── Whitelabel mode ─────────────────────────────────────────────

export interface WhitelabelConfig {
  /** URL or imported SVG path that replaces the dachshund. */
  customSvg?: string;
  /** Override the sage body colour for the customer's brand. */
  brandColour?: string;
  /** Cycled inside the mascot body during 'processing'. */
  internalMessages: string[];
  /** Customer's own wordmark / lockup rendered above the mascot. */
  customerLogo?: { src: string; alt: string };
}

// ─── Modes ───────────────────────────────────────────────────────

export type DashLoaderMode =
  | { kind: 'consumer'; userSettings: ConsumerSettings }
  | { kind: 'whitelabel'; brandConfig: WhitelabelConfig }
  | { kind: 'publisher'; publisherId: string; revShareTier: 'standard' | 'anchor' };

// ─── Sponsor line ────────────────────────────────────────────────

export interface SponsorPayload {
  text: string;
  advertiserId: string;
  cpm?: number;
}

// ─── Component props ─────────────────────────────────────────────

export interface DashLoaderProps {
  mode: DashLoaderMode;

  /** Current processing status. */
  status: DashStatus;

  /**
   * Cycled below the dog during 'processing' (consumer + publisher modes).
   * Whitelabel uses brandConfig.internalMessages instead.
   */
  displayMessages?: string[];

  /** Called when the user toggles opt-in or changes destination (consumer). */
  onSettingsChange?: (settings: ConsumerSettings) => void;

  /** Shown briefly during 'error' state. */
  errorMessage?: string;

  /**
   * Override the default sponsor line (consumer + publisher modes only).
   * If omitted, fetched from /api/dash/sponsor.
   */
  sponsorLine?: SponsorPayload;

  /** Force-hide the consumer opt-in card (e.g. on the /dash demo page). */
  hideOptInSurface?: boolean;
}

// ─── Charity registry (display copy is brand-locked) ─────────────

export interface CharityMeta {
  id: CharityId;
  emoji: string;
  name: string;
  sub: string;
}

export const CHARITIES: readonly CharityMeta[] = [
  { id: 'spca-nz', emoji: '🐾', name: 'SPCA NZ', sub: 'Funds rescue dogs while yours waits.' },
  {
    id: 'trees-that-count',
    emoji: '🌳',
    name: 'Trees That Count',
    sub: 'Plant a native tree per 1000 waits.',
  },
  { id: 'foodbank-nz', emoji: '🍎', name: 'Foodbank NZ', sub: 'Meals from your micro-cents.' },
] as const;

/** SPCA NZ is the brand-locked default destination. */
export const DEFAULT_DESTINATION: PayoutDestination = { kind: 'charity', charityId: 'spca-nz' };

export const DEFAULT_CONSUMER_SETTINGS: ConsumerSettings = {
  optedIn: false,
  destination: DEFAULT_DESTINATION,
  hasConsentedToDisclosure: false,
};

export const DEFAULT_DISPLAY_MESSAGES = ['loading.', 'loading..', 'loading...'];

export const LOCALSTORAGE_KEY = 'dash_loader_settings_v1';
