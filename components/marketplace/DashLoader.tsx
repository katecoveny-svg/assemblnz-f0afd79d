import Image from 'next/image';
import { PALETTE } from '@/lib/marketplace/agents';

/**
 * The signature fill-the-dog loader. The dog IS the progress bar — a ghosted
 * mascot that charges up with the live canary version bottom-to-top, masked to
 * the silhouette, with a glowing white waterline. Spec: HANDOFF.md §5.
 *
 * - omit `progress`: demo mode, loops via the `fillRise` keyframes.
 * - `progress` (0–100): controlled fill height (bind to real agent progress).
 */
export function DashLoader({
  label = 'Thinking…',
  width = 72,
  progress,
  className,
}: {
  label?: string;
  width?: number;
  progress?: number;
  className?: string;
}) {
  const controlled = typeof progress === 'number';
  const fillStyle: React.CSSProperties = controlled
    ? { height: `${Math.max(0, Math.min(100, progress))}%`, transition: 'height .4s var(--ease)' }
    : {};

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`} role="status" aria-live="polite">
      <div className="mk-floaty relative shrink-0" style={{ width, animation: 'floaty 4.6s ease-in-out infinite' }}>
        {/* ghosted (empty) dog */}
        <Image
          src="/images/dash/mascot-dog.png"
          alt=""
          width={width}
          height={Math.round((width * 914) / 984)}
          priority
          aria-hidden
          style={{ display: 'block', width: '100%', height: 'auto', filter: 'grayscale(.75) brightness(1.22) opacity(.28)' }}
        />
        {/* coloured dog rises bottom-up to fill as it loads */}
        <div
          className={controlled ? undefined : 'mk-fill-anim'}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            ...(controlled ? fillStyle : { animation: 'fillRise 5.2s cubic-bezier(.45,0,.2,1) infinite' }),
          }}
        >
          <Image
            src="/images/dash/mascot-dog.png"
            alt=""
            width={width}
            height={Math.round((width * 914) / 984)}
            aria-hidden
            style={{ position: 'absolute', left: 0, bottom: 0, width, height: 'auto', filter: 'drop-shadow(0 0 10px rgba(255,212,42,.5))' }}
          />
          {/* glowing waterline */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 3,
              background: 'linear-gradient(90deg,rgba(255,230,128,0),#ffffff,rgba(255,230,128,0))',
              boxShadow: '0 0 12px rgba(255,212,42,.95)',
            }}
          />
        </div>
      </div>
      <span className="text-sm" style={{ color: PALETTE.body }}>
        {label}
      </span>
    </div>
  );
}
