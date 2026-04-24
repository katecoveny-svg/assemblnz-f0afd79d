/**
 * useWidgetData — single resolver for every dashboard widget.
 *
 * Reads the widget's `dataSource` from the registry and dispatches to
 * the right backend (public dashboard-feed, an edge function, or a
 * Supabase table). Widgets must NOT call `fetch` / `supabase.from()`
 * directly — go through this hook so scope checks, refresh policy,
 * caching, retry/backoff, and the data-source contract stay uniform.
 *
 * Caching:
 *  - Backed by React Query for request dedup, stale-while-revalidate,
 *    and exponential-backoff retries on transient failures.
 *  - `staleTime` / `refetchInterval` are derived from the widget's
 *    declared refresh strategy:
 *       interval → poll at that cadence, stale halfway through
 *       realtime → never stale on time alone; postgres_changes invalidates
 *       static   → cache for 1 hour
 *  - Window-focus refetch is on for interval widgets (cheap recovery
 *    when a user comes back to the tab) and off for realtime ones.
 */

import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getWidget } from "@/config/dashboard-widgets";
import type { WidgetConfig, WidgetRole } from "@/config/widget-types";

const ROLE_ORDER: WidgetRole[] = ["public", "free", "starter", "pro", "business", "admin"];

function viewerCanSee(viewerRole: WidgetRole, widget: WidgetConfig): boolean {
  return ROLE_ORDER.indexOf(viewerRole) >= ROLE_ORDER.indexOf(widget.scope.requires);
}

function checkScope(
  viewerRole: WidgetRole,
  widget: WidgetConfig,
  enabledToolsets: string[],
): { ok: boolean; reason?: "role" | "toolset" } {
  if (!viewerCanSee(viewerRole, widget)) return { ok: false, reason: "role" };
  if (widget.scope.toolsets?.length) {
    const missing = widget.scope.toolsets.find((t) => !enabledToolsets.includes(t));
    if (missing && viewerRole !== "admin") return { ok: false, reason: "toolset" };
  }
  return { ok: true };
}

export interface UseWidgetDataOptions {
  /** Viewer's role. Defaults to "public" so unauth widgets still resolve. */
  viewerRole?: WidgetRole;
  /** MCP toolsets enabled for the org — used for fine-grained gates. */
  enabledToolsets?: string[];
  /** Skip fetching (e.g. tab not visible). */
  enabled?: boolean;
}

export interface UseWidgetDataResult<T> {
  data: T | null;
  loading: boolean;
  /** True only on the very first load (no cached data yet). */
  initialLoading: boolean;
  /** True for any refetch — used to drive the spinner without flashing skeletons. */
  refetching: boolean;
  error: string | null;
  /** True when widget exists but viewer lacks scope. UI should show a lock state. */
  forbidden: boolean;
  /** Timestamp of the most recent successful fetch (ms epoch). */
  updatedAt: number | null;
  refetch: () => Promise<void>;
}

async function fetchWidget(widget: WidgetConfig): Promise<unknown> {
  const ds = widget.dataSource;

  if (ds.kind === "static") return null;

  if (ds.kind === "dashboard_feed") {
    const params = new URLSearchParams({ source: ds.feedSource });
    for (const [k, v] of Object.entries(ds.params ?? {})) params.set(k, String(v));
    const { data, error } = await supabase.functions.invoke(
      `dashboard-feed?${params.toString()}`,
      { method: "GET" },
    );
    if (error) throw error;
    return data;
  }

  if (ds.kind === "edge_function") {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(ds.params ?? {})) search.set(k, String(v));
    const path = search.toString() ? `${ds.functionName}?${search}` : ds.functionName;
    const { data, error } = await supabase.functions.invoke(path, {
      method: ds.method ?? "GET",
      body: ds.body,
    });
    if (error) throw error;
    return data;
  }

  if (ds.kind === "table") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = (supabase as any).from(ds.table).select(ds.select);
    for (const [col, val] of Object.entries(ds.filter ?? {})) q = q.eq(col, val);
    if (ds.orderBy) {
      q = q.order(ds.orderBy.column, { ascending: ds.orderBy.ascending ?? false });
    }
    if (ds.limit) q = q.limit(ds.limit);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  if (ds.kind === "agent_tool") {
    throw new Error(
      `agent_tool data source for "${ds.toolName}" must be wired through dashboard-feed or a dedicated edge function`,
    );
  }

  return null;
}

/**
 * Build a stable query key from the widget config so cache hits are
 * shared across components that render the same widget id.
 */
function buildQueryKey(widget: WidgetConfig): readonly unknown[] {
  const ds = widget.dataSource;
  return ["widget", widget.id, ds.kind, "params" in ds ? ds.params ?? {} : {}];
}

export function useWidgetData<T = unknown>(
  widgetId: string,
  options: UseWidgetDataOptions = {},
): UseWidgetDataResult<T> {
  const { viewerRole = "public", enabledToolsets = [], enabled = true } = options;
  const widget = getWidget(widgetId);
  const queryClient = useQueryClient();

  const scope = useMemo(
    () => (widget ? checkScope(viewerRole, widget, enabledToolsets) : { ok: false }),
    [widget, viewerRole, enabledToolsets],
  );
  const forbidden = !!widget && !scope.ok;

  // Compute caching policy from the refresh strategy.
  const { staleTime, refetchInterval, refetchOnWindowFocus } = useMemo(() => {
    if (!widget) return { staleTime: 0, refetchInterval: false as const, refetchOnWindowFocus: false };
    const r = widget.refresh;
    if (r.mode === "interval") {
      const ms = r.seconds * 1000;
      return {
        staleTime: Math.floor(ms / 2),
        refetchInterval: ms,
        refetchOnWindowFocus: true,
      } as const;
    }
    if (r.mode === "realtime") {
      // Realtime widgets get their freshness from postgres_changes, not
      // a timer — keep the cache hot and don't piggy-back on focus.
      return { staleTime: 60_000, refetchInterval: false, refetchOnWindowFocus: false } as const;
    }
    // static
    return { staleTime: 60 * 60 * 1000, refetchInterval: false, refetchOnWindowFocus: false } as const;
  }, [widget]);

  const queryKey = useMemo(() => (widget ? buildQueryKey(widget) : ["widget", widgetId, "missing"]), [widget, widgetId]);

  const query = useQuery<unknown, Error>({
    queryKey,
    queryFn: () => fetchWidget(widget!),
    enabled: enabled && !!widget && !forbidden,
    staleTime,
    gcTime: Math.max(staleTime * 2, 5 * 60 * 1000),
    refetchInterval: refetchInterval || false,
    refetchOnWindowFocus,
    refetchOnReconnect: true,
    retry: (failureCount, err) => {
      // Don't retry scope / not-found / 4xx-ish errors; do retry transient failures.
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("forbidden") || msg.includes("unauthorized") || msg.includes("not found")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  // Realtime bridge — invalidate on postgres_changes for the configured table.
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  useEffect(() => {
    if (!widget || forbidden || !enabled) return;
    if (widget.refresh.mode !== "realtime") return;
    const channel = supabase
      .channel(`widget:${widget.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: widget.refresh.channel },
        () => {
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [widget, forbidden, enabled, queryClient, queryKey]);

  return {
    data: forbidden ? null : ((query.data ?? null) as T | null),
    loading: forbidden ? false : query.isLoading || query.isFetching,
    initialLoading: forbidden ? false : query.isLoading,
    refetching: forbidden ? false : query.isFetching && !query.isLoading,
    error: forbidden ? null : query.error?.message ?? null,
    forbidden,
    updatedAt: query.dataUpdatedAt || null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
