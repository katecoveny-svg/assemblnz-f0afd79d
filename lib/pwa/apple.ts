/**
 * iOS PWA metadata helpers for the pilot workspaces.
 *
 * Apple ignores most of the web app manifest, so each tenant layout exports
 * Next metadata built from these: apple-touch-icon, apple-mobile-web-app-*
 * meta, and apple-touch-startup-image links per device size.
 *
 * Splash PNGs are generated into public/brand/pwa/<slug>/ (paper white,
 * tenant mark centred) — see the icon inventory in the PR.
 */

/** Portrait splash sizes we ship: [cssWidth, cssHeight, dpr]. */
const SPLASH_DEVICES: Array<[number, number, number]> = [
  [375, 667, 2], // iPhone SE 2nd/3rd gen → 750×1334
  [390, 844, 3], // iPhone 12/13/14 → 1170×2532
  [393, 852, 3], // iPhone 14/15 Pro → 1179×2556
  [428, 926, 3], // iPhone 14 Plus → 1284×2778
  [430, 932, 3], // iPhone 14/15 Pro Max → 1290×2796
  [810, 1080, 2], // iPad 10.2" portrait → 1620×2160
  [1024, 1366, 2], // iPad Pro 12.9" portrait → 2048×2732
];

export function appleStartupImages(slug: string): Array<{ url: string; media: string }> {
  return SPLASH_DEVICES.map(([w, h, dpr]) => ({
    url: `/brand/pwa/${slug}/splash-${w * dpr}x${h * dpr}.png`,
    media: `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
  }));
}

/** The Next `metadata` fragments a PWA tenant layout spreads in. */
export function tenantPwaMetadata(slug: string, shortName: string) {
  return {
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default' as const,
      title: shortName,
      startupImage: appleStartupImages(slug),
    },
    // Next 16 emits only the modern `mobile-web-app-capable`; older iOS Safari
    // still reads the apple-prefixed variants, so emit those explicitly too.
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    },
    icons: {
      apple: `/brand/pwa/${slug}/apple-touch-icon.png`,
      icon: [
        { url: `/brand/pwa/${slug}/favicon-48.png`, sizes: '48x48', type: 'image/png' },
        { url: `/brand/pwa/${slug}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      ],
    },
  };
}
