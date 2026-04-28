// Conversion analytics helper.
// If a provider (PostHog, GA4, Plausible) is wired into window, we forward to it.
// Otherwise we console.log so call sites are exercised and the wiring is visible.
// Do NOT install a new analytics provider here — that's a separate decision.

export function track(event: string, props: Record<string, unknown> = {}) {
  // eslint-disable-next-line no-console
  console.log("[analytics]", event, props);
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      posthog?: { capture: (e: string, p: Record<string, unknown>) => void };
    };
    w.posthog?.capture?.(event, props);
  }
}
