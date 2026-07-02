import { NextResponse } from 'next/server';
import { PWA_TENANTS } from '@/lib/pwa/tenants';

/**
 * Per-tenant web app manifest, served INSIDE the workspace path so the
 * demo-host rewrite works: demo.assembl.co.nz/aironaut/manifest.webmanifest
 * rewrites to /customers/aironaut/manifest.webmanifest and hits this handler.
 *
 * `start_url` and `scope` are RELATIVE to the manifest URL, so the same JSON
 * yields scope `/aironaut/` on the demo host and `/customers/aironaut/` on
 * www — the install always stays inside the workspace the visitor is on.
 *
 * Deliberately NOT behind any pilot gate: manifest, icons, and the service
 * worker must be fetchable without auth or the phone install breaks. The
 * manifest leaks nothing — names and icon paths only.
 */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const tenant = PWA_TENANTS[slug];
  if (!tenant) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const iconBase = `/brand/pwa/${slug}`;
  const manifest = {
    id: `./`,
    name: tenant.name,
    short_name: tenant.shortName,
    description: tenant.description,
    // Relative to the manifest URL → resolves under whichever host/base the
    // visitor installed from. "./ops" opens straight into the workspace.
    start_url: './ops',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#FBFAF6',
    background_color: '#FBFAF6',
    icons: [
      { src: `${iconBase}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${iconBase}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: `${iconBase}/icon-maskable-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `${iconBase}/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
  });
}
