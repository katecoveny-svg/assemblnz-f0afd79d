'use client';

interface GenerateButtonProps {
  generating: boolean;
  hasReference: boolean;
  onClick: () => void;
  errorMessage: string | null;
  costPreviewUsd: number;
}

export function GenerateButton({
  generating,
  hasReference,
  onClick,
  errorMessage,
  costPreviewUsd,
}: GenerateButtonProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={generating}
        className="flex w-full items-center justify-center gap-3.5 rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--assembl-paper)] px-4 py-4 font-mono text-[12.5px] lowercase tracking-[0.22em] text-[color:var(--text-primary)] transition-colors enabled:hover:bg-[color:var(--assembl-cloud)] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--assembl-gold-thread)]"
      >
        <span>
          {generating
            ? 'generating…'
            : hasReference
              ? 'generate from reference'
              : 'generate'}
        </span>
        {generating && (
          <span className="inline-flex gap-1.5" aria-hidden>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--assembl-gold-thread)] motion-reduce:animate-none" />
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--assembl-gold-thread)] motion-reduce:animate-none"
              style={{ animationDelay: '0.18s' }}
            />
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--assembl-gold-thread)] motion-reduce:animate-none"
              style={{ animationDelay: '0.36s' }}
            />
          </span>
        )}
      </button>

      <div className="text-right font-mono text-[10.5px] tracking-[0.1em] text-[color:var(--text-secondary)]">
        ~${costPreviewUsd.toFixed(2)} usd at flux pro pricing
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-[2px] border border-[#D9C2B6] bg-[#F4E9E4] p-3.5 font-mono text-xs leading-[1.55] text-[#7A2E15]"
        >
          generation failed — {errorMessage}. check your key or try again.
        </div>
      )}
    </div>
  );
}
