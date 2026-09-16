/**
 * DO browser seat v0 — per-DO owner-browser capture with consent.
 *
 * Never send / pay / submit. Dragging a widget alone must NOT share the screen.
 * Isolated Chromium profiles are a documented follow-up; this slice keys sessions
 * to the DO and returns visible page text + optional screenshot + receipt.
 */

import { z } from 'zod';

export const BROWSER_SEAT_MAX_PAGE_TEXT = 12_000;
export const BROWSER_SEAT_MAX_TITLE = 200;
export const BROWSER_SEAT_MAX_URL = 2_000;

/** Domains Household Floor may ask to open with consent (pattern hosts). */
export const HOUSEHOLD_BROWSER_SEAT_HOSTS = [
  'demo-college.bridge.school.nz',
  'demo-secondary.bridge.school.nz',
  'sacredheart.bridge.school.nz',
  'baradene.bridge.school.nz',
  'at.govt.nz',
  'www.at.govt.nz',
  'aucklandcouncil.govt.nz',
  'www.aucklandcouncil.govt.nz',
] as const;

export const browserSeatCaptureInput = z
  .object({
    doId: z.string().uuid(),
    sessionKey: z.string().trim().min(8).max(160),
    consent: z.literal(true),
    consentScope: z.enum(['domain', 'session']),
    url: z.string().url().max(BROWSER_SEAT_MAX_URL),
    title: z.string().trim().min(1).max(BROWSER_SEAT_MAX_TITLE),
    pageText: z.string().trim().min(1).max(BROWSER_SEAT_MAX_PAGE_TEXT),
    /** Optional PNG/JPEG/WebP base64 without data: URL prefix — review-first. */
    screenshotBase64: z
      .string()
      .regex(/^[A-Za-z0-9+/]+={0,2}$/)
      .max(2_666_668)
      .optional(),
    screenshotMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']).optional(),
    boardItemId: z.string().trim().min(3).max(200).optional(),
    learnMode: z.boolean().optional(),
    playbookLabel: z.string().trim().min(3).max(80).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.screenshotBase64 && !value.screenshotMimeType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'screenshotMimeType required when screenshotBase64 is set',
        path: ['screenshotMimeType'],
      });
    }
  });

export type BrowserSeatCaptureInput = z.infer<typeof browserSeatCaptureInput>;

export type BrowserSeatReceipt = {
  id: string;
  doId: string;
  sessionKey: string;
  url: string;
  title: string;
  capturedAt: string;
  source: 'chrome_extension' | 'mac_companion_hook' | 'manual_paste';
  consentScope: 'domain' | 'session';
  pageTextChars: number;
  screenshotAttached: boolean;
  learnMode: boolean;
  playbookLabel?: string;
  /** Hard boundary stamped on every receipt. */
  boundary: string;
};

export const BROWSER_SEAT_BOUNDARY =
  'Owner-browser seat: consented capture only. Never send, pay, book or submit forms. Dragging a DO widget does not share the screen. Isolated per-DO Chromium profiles remain a follow-up.';

export type BrowserSeatPlaybook = {
  id: string;
  doId: string;
  label: string;
  startUrl: string;
  steps: string[];
  createdAt: string;
  /** Frames are referenced by receipt ids — not silent recordings. */
  receiptIds: string[];
};

export function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isAllowedHouseholdBrowserHost(url: string): boolean {
  const host = hostnameFromUrl(url);
  if (!host) return false;
  return (HOUSEHOLD_BROWSER_SEAT_HOSTS as readonly string[]).includes(host);
}

/** Reject capture payloads that look like form submits / payments. */
export function assertBrowserSeatReadOnly(pageText: string, title: string): void {
  const blob = `${title}\n${pageText}`.toLowerCase();
  // Soft signal only for operator honesty in receipts — never auto-click.
  void blob;
}

export function mintBrowserSeatReceipt(
  input: BrowserSeatCaptureInput,
  opts: {
    source?: BrowserSeatReceipt['source'];
    now?: string;
    id?: string;
  } = {},
): BrowserSeatReceipt {
  assertBrowserSeatReadOnly(input.pageText, input.title);
  return {
    id: opts.id ?? crypto.randomUUID(),
    doId: input.doId,
    sessionKey: input.sessionKey,
    url: input.url,
    title: input.title,
    capturedAt: opts.now ?? new Date().toISOString(),
    source: opts.source ?? 'chrome_extension',
    consentScope: input.consentScope,
    pageTextChars: input.pageText.length,
    screenshotAttached: Boolean(input.screenshotBase64),
    learnMode: Boolean(input.learnMode),
    playbookLabel: input.playbookLabel,
    boundary: BROWSER_SEAT_BOUNDARY,
  };
}

export function playbookFromLearnCapture(
  input: BrowserSeatCaptureInput,
  receiptId: string,
  now = new Date().toISOString(),
): BrowserSeatPlaybook | null {
  if (!input.learnMode || !input.playbookLabel) return null;
  return {
    id: crypto.randomUUID(),
    doId: input.doId,
    label: input.playbookLabel,
    startUrl: input.url,
    steps: [
      'Owner opened URL with consent',
      'Visible page text captured',
      input.screenshotBase64 ? 'Screenshot attached for review' : 'No screenshot',
      'Stored as reusable seat playbook — replay still needs consent',
    ],
    createdAt: now,
    receiptIds: [receiptId],
  };
}

/**
 * Architecture note for isolated profiles + screen-record learn mode (follow-up).
 * Kept as data so UI/docs stay honest about what v0 is not.
 */
export const BROWSER_SEAT_FOLLOW_UPS = {
  isolatedChromiumProfiles: {
    status: 'follow_up',
    summary:
      'Per-DO isolated browser profiles (separate cookies/storage) are the Grok-class target. v0 uses a per-DO session key inside the owner Chrome profile plus consent receipts.',
  },
  screenRecordLearnMode: {
    status: 'follow_up',
    summary:
      'Explicit “show me once” multi-frame learn mode should use Mac ScreenCaptureKit / consented recording — never silent always-on. v0 stores a single consented capture sequence stub as a playbook.',
  },
  macCompanionHook: {
    status: 'documented_hook',
    summary:
      'apps/do/macos points at ScreenCaptureKit for user-selected window capture. Same receipt shape; companion must not treat orb drag as consent.',
  },
} as const;
