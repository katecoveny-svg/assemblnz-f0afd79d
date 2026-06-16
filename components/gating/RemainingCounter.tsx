'use client';

/**
 * "X remaining" pill shown to anonymous and email-tier visitors so the usage
 * limit is visible before they hit it. Render nothing for paid/unlimited.
 *
 * Feed `remaining` from the `X-Gate-Remaining` response header after each run,
 * or from GET /api/gating/status on first load.
 */
export function RemainingCounter({
  remaining,
  noun = 'run',
}: {
  remaining: number | 'unlimited' | null;
  noun?: string; // 'run', 'message'
}) {
  if (remaining === null || remaining === 'unlimited') return null;
  const plural = remaining === 1 ? noun : `${noun}s`;
  const tone =
    remaining === 0
      ? 'text-[#9A3412] border-[rgba(154,52,18,0.3)] bg-[rgba(154,52,18,0.06)]'
      : 'text-[color:var(--text-secondary)] border-[rgba(35,33,31,0.14)] bg-white/55';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}
      aria-live="polite"
    >
      {remaining === 0 ? 'Limit reached' : `${remaining} ${plural} remaining`}
    </span>
  );
}
