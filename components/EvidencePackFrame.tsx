'use client';

/**
 * EvidencePackFrame — visual mock of an evidence pack that builds up across
 * four reveals: Blank → Attribution → Citations → Sealed.
 *
 * Used as the right-column sticky frame on /evidence-pack. Each reveal layer
 * cross-fades in. The pack itself is plain HTML/CSS — cream paper card with
 * a thin gold border, mono labels, draft watermark, and a green "sealed"
 * stamp at the final stage.
 */
export function EvidencePackFrame({ activeIndex }: { activeIndex: number }) {
  const showAttribution = activeIndex >= 1;
  const showCitations = activeIndex >= 2;
  const sealed = activeIndex >= 3;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-6 md:p-10"
      style={{
        background:
          'linear-gradient(180deg, rgba(232,228,222,0.45) 0%, rgba(184,178,168,0.18) 100%)',
      }}
    >
      <div
        className="relative h-full w-full max-w-[420px] overflow-hidden rounded-[6px] border border-[rgba(212,168,83,0.35)] bg-[#FAF7F2] p-6 transition-shadow duration-700"
        style={{
          boxShadow: sealed
            ? '0 24px 60px rgba(43,107,87,0.18), 0 0 0 1px rgba(43,107,87,0.20)'
            : '0 12px 36px rgba(35,33,31,0.10)',
        }}
      >
        {/* Draft watermark — fades out on Sealed */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700"
          style={{ opacity: sealed ? 0 : 0.06 }}
        >
          <span
            className="select-none font-display text-[7rem] uppercase leading-none tracking-tight text-[color:var(--text-primary)]"
            style={{ transform: 'rotate(-22deg)', fontWeight: 600 }}
          >
            Draft
          </span>
        </div>

        {/* Header — always visible */}
        <header className="relative">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-xl font-medium lowercase text-[color:var(--text-primary)]">
              assembl
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Evidence pack · v1
            </p>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Variation pack · 14 King St, Auckland
          </p>
          <div className="mt-3 h-px bg-[rgba(212,168,83,0.45)]" />
        </header>

        {/* Document body — paragraph lines */}
        <div className="relative mt-4 space-y-2">
          {[0.92, 0.78, 0.86, 0.62, 0.72, 0.58].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-[rgba(35,33,31,0.10)]"
              style={{ width: `${w * 100}%` }}
            />
          ))}
        </div>

        {/* Attribution block — Stage 02 */}
        <div
          className="relative mt-5 rounded-[4px] border bg-[rgba(43,107,87,0.04)] p-3 transition-all duration-700"
          style={{
            opacity: showAttribution ? 1 : 0,
            transform: showAttribution ? 'translateY(0)' : 'translateY(8px)',
            borderColor: showAttribution
              ? 'rgba(43,107,87,0.35)'
              : 'rgba(43,107,87,0)',
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
            Attribution
          </p>
          <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            <dt className="font-mono text-[color:var(--text-secondary)]">Agent</dt>
            <dd className="text-[color:var(--text-primary)]">Whakaaē</dd>
            <dt className="font-mono text-[color:var(--text-secondary)]">Reviewer</dt>
            <dd className="text-[color:var(--text-primary)]">Mere Williams</dd>
            <dt className="font-mono text-[color:var(--text-secondary)]">Drafted</dt>
            <dd className="font-mono text-[color:var(--text-primary)]">2026-05-08 14:32</dd>
          </dl>
        </div>

        {/* Citations footer — Stage 03 */}
        <div
          className="relative mt-4 transition-all duration-700"
          style={{
            opacity: showCitations ? 1 : 0,
            transform: showCitations ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Citations
          </p>
          <ul className="mt-1.5 space-y-1 text-[10px]">
            {[
              'Building Act 2004 · s 14B',
              'NZS 3910:2013 · cl 9.5',
              'Acceptable Solution E2/AS1',
            ].map((cite) => (
              <li key={cite} className="flex items-start gap-2">
                <span className="mt-0.5 font-mono text-[color:var(--assembl-gold-thread)]">§</span>
                <span className="font-mono text-[color:var(--text-primary)]">{cite}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sealed stamp — Stage 04 */}
        <div
          aria-hidden
          className="absolute right-5 top-5 transition-all duration-700"
          style={{
            opacity: sealed ? 1 : 0,
            transform: sealed ? 'rotate(-8deg) scale(1)' : 'rotate(-12deg) scale(0.9)',
          }}
        >
          <div className="flex flex-col items-center justify-center rounded-full border-[2px] border-[color:var(--assembl-pounamu)] bg-[rgba(232,239,233,0.85)] px-4 py-2">
            <p className="font-mono text-[8px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
              Sealed
            </p>
            <p className="mt-0.5 font-mono text-[7px] tracking-wider text-[color:var(--assembl-pounamu)]">
              SHA-256 · a3f9…0c8b
            </p>
          </div>
        </div>

        {/* Pou stamp footer — appears with Sealed */}
        <div
          className="absolute inset-x-6 bottom-5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition-opacity duration-700"
          style={{ opacity: sealed ? 1 : 0 }}
        >
          <span>Rangatiratanga</span>
          <span>·</span>
          <span>Kaitiakitanga</span>
          <span>·</span>
          <span>Manaakitanga</span>
          <span>·</span>
          <span>Whanaungatanga</span>
        </div>
      </div>
    </div>
  );
}
