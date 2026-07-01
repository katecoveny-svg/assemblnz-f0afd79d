import { SpeciesSilhouette } from './ui';

/** Password gate. Posts to a plain API route (/api/customers/auckland-zoo/unlock)
 *  rather than a server action, so it works even though the middleware edge-gate
 *  rewrites locked /keeper requests here. Server-rendered — no client JS needed. */
export function PasswordGate({ error }: { error?: boolean }) {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-16"
      style={{ background: 'var(--tenant-cream)' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl font-[family-name:var(--font-display)] text-[18px] font-semibold"
            style={{ background: 'var(--tenant-primary)', color: '#fff' }}
            aria-hidden
          >
            AZ
          </span>
          <div className="leading-tight">
            <p className="font-[family-name:var(--font-display)] text-[22px]" style={{ color: 'var(--tenant-ink)' }}>
              Auckland Zoo × Keeper
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--tenant-muted)' }}>
              Concept · pending — private preview
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }}
        >
          <div className="mb-4 flex items-center gap-3" style={{ color: 'var(--tenant-primary)' }}>
            <SpeciesSilhouette slug="kiwi" className="h-8 w-8 opacity-70" />
            <SpeciesSilhouette slug="rhino" className="h-8 w-8 opacity-70" />
            <SpeciesSilhouette slug="giraffe" className="h-8 w-8 opacity-70" />
          </div>
          <h1 className="text-[16px] font-semibold" style={{ color: 'var(--tenant-ink)' }}>
            This is a private preview
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: 'var(--tenant-muted)' }}>
            A design mockup of what an animal-first Keeper workspace could look like for Auckland Zoo. Enter the
            demo password to look around.
          </p>

          <form method="POST" action="/api/customers/auckland-zoo/unlock" className="mt-5">
            <label htmlFor="password" className="sr-only">
              Demo password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              autoFocus
              placeholder="Demo password"
              className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--tenant-primary)]"
              style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-cream)', color: 'var(--tenant-ink)' }}
            />
            {error ? (
              <p className="mt-2 text-[12.5px]" style={{ color: '#9A2B2B' }}>
                That password is not right. Try again, or ask Kate for the demo password.
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-3 w-full rounded-xl px-4 py-3 text-[15px] font-medium text-white transition-opacity"
              style={{ background: 'var(--tenant-primary)' }}
            >
              Enter the preview
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px]" style={{ color: 'var(--tenant-muted)' }}>
          Built by assembl · Aotearoa. Not affiliated with or endorsed by Auckland Zoo.
        </p>
      </div>
    </main>
  );
}
