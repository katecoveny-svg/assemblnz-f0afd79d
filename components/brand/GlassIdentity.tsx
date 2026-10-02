import Image from 'next/image';

/** Locked DO07 artwork, cropped by layout only. Never redraw the primary mark. */
export function GlassIdentity({ kind, size = 44 }: { kind: 'assembl' | 'do'; size?: number }) {
  return <span aria-hidden="true" data-glass-identity={kind} style={{ display: 'inline-block', position: 'relative', overflow: 'hidden', width: size, height: size, flexShrink: 0, borderRadius: '24%' }}>
    <Image src={kind === 'do' ? '/brand/do-assembled-plum.webp?v=glass07' : '/brand/assembl-assembled-plum.webp?v=glass07'} alt="" width={1200} height={800} unoptimized style={{ position: 'absolute', width: '180%', maxWidth: 'none', height: '120%', left: '-40%', top: '-8%', objectFit: 'cover' }} />
  </span>;
}
