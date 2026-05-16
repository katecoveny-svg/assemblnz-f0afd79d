export function HairlineRule({
  className = '',
  accent = 'var(--assembl-gold)',
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <div
      aria-hidden
      className={`h-px w-full bg-[rgba(35,33,31,0.10)] ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }}
    />
  );
}
