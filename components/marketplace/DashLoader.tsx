import Image from 'next/image';

/**
 * The Dash dachshund "thinking" loader.
 *
 * Reuses the sage-green dachshund mark from the Dash work
 * (`public/images/dash/dash-dog.svg`). Shown while an agent is streaming a
 * reply. The little trot animation lives in globals.css (`.dash-trot`), kept as
 * pure CSS so it can never get stuck on a hydration hiccup.
 */
export function DashLoader({
  label = 'Thinking…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`} role="status" aria-live="polite">
      <span className="dash-trot inline-block w-12 shrink-0">
        <Image
          src="/images/dash/dash-dog.svg"
          alt=""
          width={48}
          height={22}
          priority
          aria-hidden
        />
      </span>
      <span className="text-sm" style={{ color: '#163A23', opacity: 0.7 }}>
        {label}
      </span>
    </div>
  );
}
