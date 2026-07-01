export function DemoRibbon() {
  return (
    // Micro-label per DIRECTION-LOCKED-2026-07-01: uppercase, tracked 0.16em.
    <div
      className="rounded-md border border-dashed border-[color:var(--brand-accent)]/40 bg-[color:var(--brand-canary)]/25 px-3 py-1.5 text-[10px] uppercase text-[color:var(--brand-ink)]"
      style={{ letterSpacing: '0.16em' }}
    >
      demo · placeholder data — nothing here is a real customer or transaction.
    </div>
  );
}
