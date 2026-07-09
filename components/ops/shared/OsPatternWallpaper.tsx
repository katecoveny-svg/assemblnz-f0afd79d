import type { CSSProperties, ReactNode } from 'react';

/**
 * Brand pattern wallpaper — tiled line pattern behind an OS surface.
 * Opacity stays low so content remains primary; pattern is atmosphere only.
 */
export function OsPatternWallpaper({
  src,
  opacity = 0.08,
  size = 360,
  className,
  children,
  style,
}: {
  src: string;
  opacity?: number;
  size?: number;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={['relative', className].filter(Boolean).join(' ')} style={style}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'repeat',
          backgroundSize: `${size}px auto`,
          opacity,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
