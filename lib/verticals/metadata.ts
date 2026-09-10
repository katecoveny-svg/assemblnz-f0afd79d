import type { Metadata, Viewport } from 'next';
import type { VerticalSlug } from './config';
import { VERTICALS } from './config';

export const verticalViewport: Viewport = { themeColor: '#240B21', width: 'device-width', initialScale: 1, viewportFit: 'cover', interactiveWidget: 'resizes-content' };

export function verticalMetadata(slug: VerticalSlug): Metadata {
  const v = VERTICALS[slug];
  return {
    applicationName: `${v.name} · assembl`, manifest: `/agents/${slug}/manifest.webmanifest`,
    appleWebApp: { capable: true, title: v.name, statusBarStyle: 'default' },
    icons: { icon: `/brand/vertical-apps/${slug}/icon-192.png`, apple: `/brand/vertical-apps/${slug}/icon-180.png` },
    openGraph: { images: [{ url: `/brand/vertical-apps/${slug}/share.jpg`, width: 1200, height: 630, alt: `${v.name} · ${v.field} · assembl` }] },
    twitter: { card: 'summary_large_image', images: [`/brand/vertical-apps/${slug}/share.jpg`] },
  };
}
