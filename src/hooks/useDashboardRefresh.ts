import { useEffect, useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Shared dashboard refresh contract.
 *
 * Wraps a set of React Query keys with:
 *  - auto-refresh on a fixed interval (default 30s)
 *  - pause-on-hidden (skips polling when tab is in the background)
 *  - manual reload (returns a promise — useful for toolbar buttons)
 *  - centralised error toast on the first failure of each refresh cycle
 *
 * Each kete dashboard should call this once at the top of the page,
 * passing every query key whose data is rendered on screen.
 */

type DashboardQuery = {
  /** Full React Query key that identifies the query (e.g. ["auaha-dashboard-metrics"]). */
  key: QueryKey;
  /** Human label used inside error toasts ("Metrics", "Recent activity", ...). */
  label: string;
};

interface UseDashboardRefreshOptions {
  queries: DashboardQuery[];
  /** Polling interval in ms. Defaults to 30 000 (30s). Set to 0 to disable auto-refresh. */
  intervalMs?: number;
  /** Pause the timer while the tab is hidden. Defaults to true. */
  pauseWhenHidden?: boolean;
  /** Surface a toast on auto-refresh failures too. Manual reload always toasts. */
  toastOnAutoRefreshError?: boolean;
}

interface UseDashboardRefreshReturn {
  /** Trigger a manual refetch of every registered query. Resolves once they all settle. */
  reload: () => Promise<void>;
  /** True while a manual reload is in flight. */
  isReloading: boolean;
}

export function useDashboardRefresh({
  queries,
  intervalMs = 30_000,
  pauseWhenHidden = true,
  toastOnAutoRefreshError = false,
}: UseDashboardRefreshOptions): UseDashboardRefreshReturn {
  const queryClient = useQueryClient();
  const isReloadingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runRefresh = async (mode: "auto" | "manual"): Promise<void> => {
    const results = await Promise.allSettled(
      queries.map((q) =>
        queryClient.refetchQueries({ queryKey: q.key, exact: false }),
      ),
    );

    const failures = results
      .map((r, i) => ({ r, q: queries[i] }))
      .filter((x): x is { r: PromiseRejectedResult; q: DashboardQuery } => x.r.status === "rejected");

    if (failures.length === 0) return;

    if (mode === "manual" || toastOnAutoRefreshError) {
      const labels = failures.map((f) => f.q.label).join(", ");
      toast.error(`Couldn't refresh: ${labels}`, {
        description: "Check your connection and try again.",
      });
    }
  };

  // Auto-refresh timer
  useEffect(() => {
    if (intervalMs <= 0) return;

    const start = (): void => {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        if (pauseWhenHidden && typeof document !== "undefined" && document.hidden) return;
        void runRefresh("auto");
      }, intervalMs);
    };

    const stop = (): void => {
      if (!timerRef.current) return;
      clearInterval(timerRef.current);
      timerRef.current = null;
    };

    start();

    const onVisibility = (): void => {
      if (!pauseWhenHidden) return;
      if (document.hidden) {
        stop();
      } else {
        // Refetch immediately when the tab becomes visible again, then resume polling.
        void runRefresh("auto");
        start();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      stop();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, pauseWhenHidden, JSON.stringify(queries)]);

  const reload = async (): Promise<void> => {
    if (isReloadingRef.current) return;
    isReloadingRef.current = true;
    try {
      await runRefresh("manual");
    } finally {
      isReloadingRef.current = false;
    }
  };

  return {
    reload,
    isReloading: isReloadingRef.current,
  };
}
