/**
 * useWidgetData — single resolver for every dashboard widget.
 *
 * Reads the widget's `dataSource` from the registry and dispatches to
 * the right backend (public dashboard-feed, an edge function, or a
 * Supabase table). Widgets must NOT call `fetch` / `supabase.from()`
 * directly — go through this hook so scope checks, refresh policy,
 * and the data-source contract stay uniform.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getWidget } from "@/config/dashboard-widgets";
import type { WidgetConfig, WidgetRole } from "@/config/widget-types";

const ROLE_ORDER: WidgetRole[] = ["public", "free", "starter", "pro", "business", "admin"];

function viewerCanSee(viewerRole: WidgetRole, widget: WidgetConfig): boolean {
  return ROLE_ORDER.indexOf(viewerRole) >= ROLE_ORDER.indexOf(widget.scope.requires);
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
  error: string | null;
  /** True when widget exists but viewer lacks scope. UI should show a lock state. */
  forbidden: boolean;
  refetch: () => Promise<void>;
}

export function useWidgetData<T = unknown>(
  widgetId: string,
  options: UseWidgetDataOptions = {},
): UseWidgetDataResult<T> {
  const { viewerRole = "public", enabledToolsets = [], enabled = true } = options;
  const widget = getWidget(widgetId);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!widget) {
      setError(`Unknown widget: ${widgetId}`);
      return;
    }
    // Scope gate
    if (!viewerCanSee(viewerRole, widget)) {
      setForbidden(true);
      return;
    }
    if (widget.scope.toolsets?.length) {
      const missing = widget.scope.toolsets.find((t) => !enabledToolsets.includes(t));
      if (missing && viewerRole !== "admin") {
        setForbidden(true);
        return;
      }
    }
    setForbidden(false);
    setLoading(true);
    setError(null);

    try {
      const ds = widget.dataSource;
      let result: unknown = null;

      if (ds.kind === "static") {
        result = null;
      } else if (ds.kind === "dashboard_feed") {
        const params = new URLSearchParams({ source: ds.feedSource });
        for (const [k, v] of Object.entries(ds.params ?? {})) {
          params.set(k, String(v));
        }
        const { data: fnData, error: fnErr } = await supabase.functions.invoke(
          `dashboard-feed?${params.toString()}`,
          { method: "GET" },
        );
        if (fnErr) throw fnErr;
        result = fnData;
      } else if (ds.kind === "edge_function") {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(ds.params ?? {})) search.set(k, String(v));
        const path = search.toString() ? `${ds.functionName}?${search}` : ds.functionName;
        const { data: fnData, error: fnErr } = await supabase.functions.invoke(path, {
          method: ds.method ?? "GET",
          body: ds.body,
        });
        if (fnErr) throw fnErr;
        result = fnData;
      } else if (ds.kind === "table") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = (supabase as any).from(ds.table).select(ds.select);
        for (const [col, val] of Object.entries(ds.filter ?? {})) {
          q = q.eq(col, val);
        }
        if (ds.orderBy) q = q.order(ds.orderBy.column, { ascending: ds.orderBy.ascending ?? false });
        if (ds.limit) q = q.limit(ds.limit);
        const { data: rows, error: dbErr } = await q;
        if (dbErr) throw dbErr;
        result = rows;
      } else if (ds.kind === "agent_tool") {
        // Agent tools are proxied via the dashboard-feed whitelist where
        // possible. For tools NOT in the whitelist (e.g. recall_memory)
        // the widget must be marked `pii` and read directly via a
        // dedicated edge function — not here.
        throw new Error(
          `agent_tool data source for "${ds.toolName}" must be wired through dashboard-feed or a dedicated edge function`,
        );
      }

      setData(result as T);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [widget, widgetId, viewerRole, enabledToolsets]);

  // Initial + refresh strategy
  useEffect(() => {
    if (!enabled || !widget) return;
    fetchOnce();
    if (widget.refresh.mode === "interval") {
      intervalRef.current = setInterval(fetchOnce, widget.refresh.seconds * 1000);
    }
    if (widget.refresh.mode === "realtime") {
      channelRef.current = supabase
        .channel(`widget:${widget.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: widget.refresh.channel },
          () => fetchOnce(),
        )
        .subscribe();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [enabled, widget, fetchOnce]);

  return { data, loading, error, forbidden, refetch: fetchOnce };
}
