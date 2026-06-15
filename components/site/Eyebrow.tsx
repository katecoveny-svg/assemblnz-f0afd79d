/**
 * Eyebrow — the shared section kicker used across the site: a short accent
 * rule followed by a mono label. Matches the home (HomeLaunch) so every page
 * leads in the same way. Server-friendly; no motion of its own.
 */
export function Eyebrow({
  label,
  accent = 'var(--assembl-pounamu)',
  className = '',
}: {
  label: string;
  accent?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="h-[2px] w-9 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
      <span className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
        {label}
      </span>
    </span>
  );
}
