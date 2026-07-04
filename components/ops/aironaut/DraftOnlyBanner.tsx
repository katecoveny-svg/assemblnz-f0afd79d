/**
 * AIRONAUT draft-only banner — appears above CommsDrafts on every service
 * subpage. Warm accent-orange left rule, quiet copy. Nothing here leaves
 * the workspace.
 */
export function AironautDraftOnlyBanner() {
  return (
    <div
      className="rounded-md border border-black/5 bg-[color:var(--brand-surface)] p-3 text-sm text-[color:var(--brand-ink)]"
      style={{ borderLeft: '4px solid var(--brand-accent)' }}
    >
      <strong>Draft only</strong> — nothing leaves the workspace. You review
      and lodge via the live Aironaut system.
    </div>
  );
}
