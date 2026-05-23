import Link from 'next/link';
import type { Metadata } from 'next';

import { MotionAssetView } from '@/components/brand/MotionAssetView';
import { MOTION_ASSETS } from '@/lib/brand/motion-assets';

export const metadata: Metadata = {
  title: '3D motion assets — Press kit',
  description:
    'Interactive 3D motion assets from the assembl brand library. GLB models and Spline scenes for editorial coverage.',
};

export default function MotionGalleryPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
        Press kit · 3D motion
      </p>
      <h1 className="mt-3 font-display text-display-lg text-[color:var(--assembl-pounamu)]">
        3D motion assets
      </h1>
      <p className="mt-4 max-w-2xl text-body-md text-[color:var(--text-body)]">
        Interactive 3D models and Spline scenes from the assembl brand library.
        Free to embed in editorial coverage with attribution to &quot;assembl&quot;
        (lowercase). For commercial or campaign use, email{' '}
        <a
          href="mailto:hello@assembl.co.nz"
          className="text-[color:var(--assembl-pounamu)] underline-offset-2 hover:underline"
        >
          hello@assembl.co.nz
        </a>
        .
      </p>

      <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-secondary)]">
        <Link href="/press" className="underline underline-offset-2">
          ← Back to press kit
        </Link>
      </p>

      <div className="mt-12 space-y-16">
        {MOTION_ASSETS.map((asset) => (
          <article key={asset.id} className="grid gap-6 md:grid-cols-[2fr,1fr] md:items-start">
            <MotionAssetView asset={asset} />
            <div className="space-y-4">
              <div>
                <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                  {asset.kind === 'glb' ? 'GLB model' : 'Spline scene'}
                </p>
                <h2 className="mt-1 font-display text-2xl">{asset.name}</h2>
              </div>
              <p className="text-sm text-[color:var(--text-body)]">{asset.description}</p>

              {asset.kind === 'glb' && (
                <div className="space-y-2 text-sm">
                  <a
                    href={asset.src}
                    download
                    className="inline-block underline underline-offset-2"
                  >
                    Download .glb
                  </a>
                  <p className="text-xs text-[color:var(--text-secondary)]">
                    glTF Binary 2.0 — opens in Blender, Spline, Unity, Three.js, or any
                    glTF-compatible tool.
                  </p>
                </div>
              )}

              {asset.kind === 'spline' && (
                <div className="space-y-2 text-sm">
                  {asset.placeholder ? (
                    <p className="rounded-sm bg-[#F4EFE7] px-3 py-2 font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                      Awaiting prod.spline.design export
                    </p>
                  ) : (
                    <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)] break-all">
                      {asset.sceneUrl}
                    </p>
                  )}
                  {asset.editorUrl && (
                    <a
                      href={asset.editorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block underline underline-offset-2"
                    >
                      View on Spline →
                    </a>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <section className="mt-20 border-t border-[color:var(--border-subtle,#E8E4DE)] pt-10">
        <h2 className="font-display text-display-sm">Usage</h2>
        <ul className="mt-4 space-y-2 text-body-md text-[color:var(--text-body)]">
          <li>Attribute as &quot;assembl&quot; (lowercase). Never &quot;Assembl&quot; or &quot;ASSEMBL&quot;.</li>
          <li>Do not modify the geometry or recolour beyond the supplied palette.</li>
          <li>GLB files may be embedded with any glTF-compatible viewer; Spline scenes require the official Spline runtime.</li>
        </ul>
      </section>
    </main>
  );
}
