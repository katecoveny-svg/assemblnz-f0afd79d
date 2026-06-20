/**
 * Drifting "woven light" sparkle — the dash brand's signature texture, rendered
 * as a sprinkle of slow-twinkling motes in cream and soft gold at low opacity.
 *
 * Pure CSS (see `.sparkle` in dash-kit.css). Positions are a fixed list so the
 * server and client render identically (no hydration mismatch), and the whole
 * layer self-disables under prefers-reduced-motion.
 */
const MOTES = [
  { top: '14%', left: '8%', size: 4, delay: 0, dur: 4.5, gold: false },
  { top: '22%', left: '78%', size: 6, delay: 1.2, dur: 5.5, gold: true },
  { top: '38%', left: '46%', size: 3, delay: 0.6, dur: 4, gold: false },
  { top: '12%', left: '62%', size: 5, delay: 2.1, dur: 6, gold: true },
  { top: '64%', left: '18%', size: 4, delay: 1.6, dur: 5, gold: false },
  { top: '74%', left: '70%', size: 3, delay: 0.3, dur: 4.2, gold: false },
  { top: '48%', left: '88%', size: 5, delay: 2.6, dur: 5.8, gold: true },
  { top: '30%', left: '28%', size: 3, delay: 3.1, dur: 4.6, gold: false },
  { top: '82%', left: '40%', size: 4, delay: 0.9, dur: 5.2, gold: true },
  { top: '56%', left: '58%', size: 3, delay: 1.9, dur: 4.4, gold: false },
  { top: '18%', left: '36%', size: 5, delay: 2.4, dur: 6.2, gold: false },
  { top: '68%', left: '90%', size: 4, delay: 3.4, dur: 5, gold: true },
] as const;

export function Sparkles({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {MOTES.map((m, i) => (
        <span
          key={i}
          className={`sparkle${m.gold ? ' sparkle--gold' : ''}`}
          style={{
            top: m.top,
            left: m.left,
            width: m.size,
            height: m.size,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
