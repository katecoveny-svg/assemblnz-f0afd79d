import { z } from 'zod';

/**
 * BrandConfig — the single source of truth for a customer's branded ops surface.
 *
 * Six known heroes; hero3D must match one of these scene ids. Everything else is
 * validated at parse-time so a typo in a config file blows up loudly instead of
 * silently rendering the wrong colour.
 */
export const Hero3DSceneId = z.enum([
  'happy-tails',
  'air-nz',
  'everyday-rewards',
  'auckland-zoo',
  'aironaut',
  'lula-inn',
]);
export type Hero3DSceneId = z.infer<typeof Hero3DSceneId>;

export const VoiceTone = z.enum([
  'warm-personal',
  'crisp-corporate',
  'ops-direct',
  'family-conversational',
]);
export type VoiceTone = z.infer<typeof VoiceTone>;

export const CrossBrandPosition = z.enum([
  'footer-only',
  'header-tag',
  'context-panel',
]);
export const CrossBrandDensity = z.enum(['quiet', 'medium', 'bold']);

const HexColour = z
  .string()
  .regex(/^#[0-9a-fA-F]{3,8}$/u, 'must be a css hex colour')
  .transform((s) => s.toLowerCase());

export const BrandConfigSchema = z.object({
  slug: z.string().min(1),
  displayName: z.string().min(1),
  logo: z.object({
    src: z.string().min(1),
    darkSrc: z.string().optional(),
    alt: z.string().min(1),
  }),
  mascot: z
    .object({
      src: z.string().min(1),
      alt: z.string().min(1),
    })
    .optional(),
  colours: z.object({
    bg: HexColour,
    surface: HexColour,
    ink: HexColour,
    muted: HexColour,
    accent: HexColour,
    canary: HexColour,
  }),
  fonts: z.object({
    display: z.string().min(1),
    body: z.string().min(1),
    mono: z.string().min(1),
  }),
  hero3D: Hero3DSceneId,
  voice: z.object({
    greeting: z.string().min(1),
    tone: VoiceTone,
  }),
  crossBrand: z.object({
    position: CrossBrandPosition,
    density: CrossBrandDensity,
  }),
  /**
   * Optional tileable line patterns rendered as subtle CSS backgrounds. `primary`
   * is the dashboard shell watermark; `secondary` is used for empty states. Both
   * are optional so other brands need not specify them.
   */
  patterns: z
    .object({
      primary: z.string().min(1).optional(),
      secondary: z.string().min(1).optional(),
    })
    .optional(),
  /**
   * Optional editorial photography. `anchor` is the brand's signature portrait
   * (used in heroes/fallbacks); `gallery` rotates as visual placeholders in
   * widgets (e.g. per-customer avatars). Both are optional.
   */
  photography: z
    .object({
      anchor: z.string().min(1).optional(),
      gallery: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  /**
   * Optional service-line taxonomy — used by brands whose ops surface fans out
   * across multiple business verticals (e.g. Aironaut's freight / exotic cars /
   * boats / wine). Each entry drives a landing card AND a route slug under
   * `/customers/<slug>/ops/<href>`. Optional so other brands need not specify it.
   *
   * Each entry may also carry an optional `heroImage` (public path) — used by
   * the landing page to render a small tile per service line, and by each
   * sub-page as a full-width hero image.
   */
  serviceLines: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        blurb: z.string().min(1),
        href: z.string().min(1),
        heroImage: z.string().min(1).optional(),
      }),
    )
    .optional(),
  /**
   * Optional rotating taglines. `primary` is the always-on brand tagline (used
   * as the hero headline); `social` and `values` are secondary variants rotated
   * where appropriate. Optional so brands without a formal tagline system need
   * not specify them.
   */
  taglines: z
    .object({
      primary: z.string().min(1).optional(),
      social: z.string().min(1).optional(),
      values: z.string().min(1).optional(),
    })
    .optional(),
  /**
   * Optional call-to-action button copy — brand-specific action language
   * (e.g. Aironaut's "REQUEST A QUOTE"). Used decoratively where the ops
   * surface renders a brand-styled CTA button. Optional.
   */
  ctaLabel: z.string().min(1).optional(),
});

export type BrandConfig = z.infer<typeof BrandConfigSchema>;

/**
 * Parse an untrusted config into a `BrandConfig`. Throws a `ZodError` if the shape
 * or values are wrong — callers get a stack trace with a helpful path.
 */
export function parseBrandConfig(input: unknown): BrandConfig {
  return BrandConfigSchema.parse(input);
}
