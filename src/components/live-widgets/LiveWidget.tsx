import { useWidgetData } from "@/hooks/useWidgetData";
import { getWidget } from "@/config/dashboard-widgets";
import type { WidgetRole } from "@/config/widget-types";
import { LiveWidgetShell } from "./LiveWidgetShell";
import { LiveWeatherBody } from "./renderers/LiveWeatherBody";
import { LiveFuelBody } from "./renderers/LiveFuelBody";
import { LiveComplianceBody } from "./renderers/LiveComplianceBody";
import { LiveKbSourcesBody } from "./renderers/LiveKbSourcesBody";
import { LiveTableBody } from "./renderers/LiveTableBody";
import type {
  FeedEnvelope,
  WeatherPayload,
  FuelPricesPayload,
  CompliancePayload,
  KbSourcesPayload,
} from "./types";

export interface LiveWidgetProps {
  widgetId: string;
  viewerRole?: WidgetRole;
  enabledToolsets?: string[];
  className?: string;
}

/**
 * LiveWidget — generic dispatcher.
 *
 * Looks up the widget config, fetches via `useWidgetData`, and renders
 * the right body component based on the data source. Unknown sources
 * fall back to a JSON dump (admin-only diagnostic).
 */
export function LiveWidget({
  widgetId,
  viewerRole = "public",
  enabledToolsets = [],
  className,
}: LiveWidgetProps) {
  const widget = getWidget(widgetId);
  const { data, loading, error, forbidden, refetch } = useWidgetData<unknown>(widgetId, {
    viewerRole,
    enabledToolsets,
  });

  if (!widget) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
        Unknown widget: <span className="font-mono">{widgetId}</span>
      </div>
    );
  }

  const ds = widget.dataSource;
  const isEmpty = computeIsEmpty(ds.kind, data);

  return (
    <LiveWidgetShell
      widget={widget}
      loading={loading}
      error={error}
      forbidden={forbidden}
      isEmpty={isEmpty}
      onRefetch={refetch}
      className={className}
    >
      {ds.kind === "dashboard_feed" && ds.feedSource === "weather" && (
        <LiveWeatherBody envelope={data as FeedEnvelope<WeatherPayload>} />
      )}
      {ds.kind === "dashboard_feed" && ds.feedSource === "fuel_prices" && (
        <LiveFuelBody envelope={data as FeedEnvelope<FuelPricesPayload>} />
      )}
      {ds.kind === "dashboard_feed" && ds.feedSource === "compliance_updates" && (
        <LiveComplianceBody envelope={data as FeedEnvelope<CompliancePayload>} />
      )}
      {ds.kind === "dashboard_feed" && ds.feedSource === "kb_sources" && (
        <LiveKbSourcesBody envelope={data as FeedEnvelope<KbSourcesPayload>} />
      )}
      {ds.kind === "table" && <LiveTableBody rows={(data as unknown[]) ?? []} />}
      {ds.kind === "edge_function" && (
        <pre className="overflow-auto rounded-xl bg-muted/40 p-3 text-[11px] leading-snug font-mono max-h-48">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      {ds.kind === "static" && (
        <p className="text-sm text-muted-foreground">Static widget — no live data source.</p>
      )}
    </LiveWidgetShell>
  );
}

function computeIsEmpty(kind: string, data: unknown): boolean {
  if (data == null) return true;
  if (kind === "table") return Array.isArray(data) && data.length === 0;
  if (kind === "dashboard_feed") {
    const env = data as { data?: unknown };
    const inner = (env?.data ?? data) as Record<string, unknown>;
    if (!inner || typeof inner !== "object") return true;
    if ("error" in inner) return true;
    if ("updates" in inner && Array.isArray(inner.updates) && inner.updates.length === 0)
      return true;
    if ("sources" in inner && Array.isArray(inner.sources) && inner.sources.length === 0)
      return true;
  }
  return false;
}
