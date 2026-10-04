import Image from 'next/image';

/** Approved artwork: transparent DO cutout, existing assembl scene crop. Never redraw either mark. */
export function GlassIdentity({ kind, size = 44 }: { kind: 'assembl' | 'do'; size?: number }) {
  if (kind === 'do') return <span aria-hidden="true" data-glass-identity="do" style={{ display: 'inline-block', width: size, height: size, flexShrink: 0 }}>
    <Image src="/brand/do-glass-D-transparent.png?v=cutout1" alt="" width={1254} height={1254} unoptimized style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
  </span>;
  return <span aria-hidden="true" data-glass-identity={kind} style={{ display: 'inline-block', position: 'relative', overflow: 'hidden', width: size, height: size, flexShrink: 0, borderRadius: '24%' }}>
    <Image src="/brand/assembl-assembled-plum.webp?v=glass07" alt="" width={1200} height={800} unoptimized style={{ position: 'absolute', width: '180%', maxWidth: 'none', height: '120%', left: '-40%', top: '-8%', objectFit: 'cover' }} />
  </span>;
}
