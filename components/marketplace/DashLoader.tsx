import { PALETTE } from '@/lib/marketplace/agents';
import { AssemblingMark } from '@/components/dash/AssemblingMark';

/**
 * The assembling loader — a brass ring that closes as work is done.
 *
 * Was the fill-the-dog loader: a ghosted dachshund that charged up bottom-to-
 * top with a canary fill. The dog is the retired Birdie identity, and this
 * component renders inside live agent chat, so it was the thing a customer
 * watched every time an agent thought. Same behaviour, current canon.
 *
 * - omit `progress`: demo mode, the ring turns on a loop.
 * - `progress` (0–100): controlled, bind to real agent progress.
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
  const pct = controlled ? Math.max(0, Math.min(100, progress)) : 72;

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`} role="status" aria-live="polite">
      <div
        className="mk-floaty relative shrink-0"
        style={{
          width,
          color: PALETTE.body,
          animation: 'floaty 4.6s ease-in-out infinite',
        }}
      >
        {/* Uncontrolled, the ring turns rather than sitting at a fixed arc, so
            it still reads as "working" when there is no progress to report. */}
        <div
          style={
            controlled
              ? undefined
              : { animation: 'mk-ring-spin 2.6s linear infinite', transformOrigin: '50% 50%' }
          }
        >
          <AssemblingMark pct={pct} title="" />
        </div>
      </div>
      <span className="text-sm" style={{ color: PALETTE.body }}>
        {label}
      </span>
    </div>
  );
}
