// ═══════════════════════════════════════════════════════════════
// startupDependencyCheck — verify required runtime deps at boot
// ───────────────────────────────────────────────────────────────
// Some components (chat panels, markdown renderers, charting) rely on
// optional-feeling deps that are easy to miss after a refactor or a fresh
// clone. Rather than discover the gap at the moment a user opens the
// affected screen (and seeing a blank page from a stale Vite chunk), we
// probe each declared dep at app boot via a dynamic import and surface a
// single, actionable console.error per failure:
//
//   [startup] Missing dependency: react-markdown
//     Used by: ToroTutorChat (Tōro chat panels)
//     Fix:     npm install react-markdown
//     Detail:  <original error message>
//
// The check is a no-op in production builds — it only runs in dev so it
// doesn't add latency to user sessions. It's also fire-and-forget: it
// never throws or blocks rendering.
// ═══════════════════════════════════════════════════════════════

interface DependencyProbe {
  /** npm package name (also used in the install hint). */
  name: string;
  /** Lazy import — must be a literal so Vite can resolve it statically. */
  load: () => Promise<unknown>;
  /** What this dep is used for, surfaced in the error log. */
  usedBy: string;
}

const PROBES: DependencyProbe[] = [
  {
    name: "react-markdown",
    load: () => import("react-markdown"),
    usedBy: "ToroTutorChat (Tōro chat panels)",
  },
  {
    name: "sonner",
    load: () => import("sonner"),
    usedBy: "Toast notifications across the app",
  },
  {
    name: "lucide-react",
    load: () => import("lucide-react"),
    usedBy: "Icon set used by every page",
  },
];

let hasRun = false;

export function runStartupDependencyCheck(): void {
  if (hasRun) return;
  hasRun = true;
  if (!import.meta.env.DEV) return;

  void Promise.allSettled(
    PROBES.map(async (probe) => {
      try {
        await probe.load();
        return { probe, ok: true as const };
      } catch (e) {
        return { probe, ok: false as const, error: e as Error };
      }
    }),
  ).then((results) => {
    const missing = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((v): v is { probe: DependencyProbe; ok: false; error: Error } =>
        v !== null && v.ok === false,
      );

    if (missing.length === 0) {
      // eslint-disable-next-line no-console
      console.info(
        `[startup] Dependency check passed (${PROBES.length} probes).`,
      );
      return;
    }

    // eslint-disable-next-line no-console
    console.group(
      `[startup] ${missing.length} required dependenc${missing.length === 1 ? "y is" : "ies are"} missing or failed to load`,
    );
    for (const { probe, error } of missing) {
      // eslint-disable-next-line no-console
      console.error(
        `Missing dependency: ${probe.name}\n  Used by: ${probe.usedBy}\n  Fix:     npm install ${probe.name}\n  Detail:  ${error?.message ?? "unknown error"}`,
      );
    }
    // eslint-disable-next-line no-console
    console.info(
      `Tip: after installing, restart the dev server and clear Vite's pre-bundle cache:\n  rm -rf node_modules/.vite && npm run dev`,
    );
    // eslint-disable-next-line no-console
    console.groupEnd();
  });
}
