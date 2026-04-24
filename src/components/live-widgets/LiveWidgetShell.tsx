/**
 * LiveWidgetShell — the unified frame every dashboard widget renders into.
 *
 * Handles:
 *  - kete-accent border + subtitle
 *  - loading skeleton, error state, empty state, forbidden (locked) state
 *  - footer meta line (last updated + scope chip)
 *
 * Renderers (LiveWeatherWidget, LiveComplianceWidget, etc.) pass their
 * `useWidgetData` result in and provide a `children` render prop that
 * only runs when data is ready.
 */

import { type ReactNode } from "react";
import { Lock, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/config/widget-types";
import { getKeteAccent } from "./kete-accents";

export interface LiveWidgetShellProps {
  widget: WidgetConfig;
  loading: boolean;
  error: string | null;
  forbidden: boolean;
  isEmpty: boolean;
  onRefetch: () => void;
  /** Rendered when data is ready and non-empty. */
  children: ReactNode;
  /** Optional rhs in the header (e.g. unit, region). */
  headerMeta?: ReactNode;
  className?: string;
}

export function LiveWidgetShell({
  widget,
  loading,
  error,
  forbidden,
  isEmpty,
  onRefetch,
  children,
  headerMeta,
  className,
}: LiveWidgetShellProps) {
  const accent = getKeteAccent(widget.section);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border bg-card/80 backdrop-blur-md shadow-[0_8px_30px_rgba(111,97,88,0.08)] rounded-3xl",
        className,
      )}
      style={{ borderColor: `${accent.accentHex}66` }}
      data-widget-id={widget.id}
      data-widget-section={widget.section}
    >
      {/* Top accent strip */}
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent.accentHex }} />

      <CardHeader className="pb-2 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: accent.inkHex }}
            >
              {accent.label} · {accent.subtitle}
            </p>
            <CardTitle className="font-display text-lg font-medium text-foreground mt-1 leading-tight">
              {widget.title}
            </CardTitle>
            {widget.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {widget.description}
              </p>
            )}
          </div>
          {headerMeta && <div className="shrink-0 text-right">{headerMeta}</div>}
        </div>
      </CardHeader>

      <CardContent className="pb-5 pt-2">
        {forbidden && <ForbiddenState widget={widget} />}
        {!forbidden && loading && <LoadingState />}
        {!forbidden && !loading && error && (
          <ErrorState message={error} onRetry={onRefetch} />
        )}
        {!forbidden && !loading && !error && isEmpty && (
          <EmptyState message={widget.emptyState ?? "No data available right now."} />
        )}
        {!forbidden && !loading && !error && !isEmpty && children}

        <WidgetFooter widget={widget} loading={loading} onRefetch={onRefetch} />
      </CardContent>
    </Card>
  );
}

// ────────────────── Sub-states ──────────────────

function LoadingState() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-destructive/5 p-3 text-sm">
      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-destructive font-medium">Couldn't load this widget</p>
        <p className="text-xs text-muted-foreground truncate">{message}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 px-2 text-xs">
        Retry
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Inbox className="h-5 w-5 text-muted-foreground mb-2" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function ForbiddenState({ widget }: { widget: WidgetConfig }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-sm">
      <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-foreground">Locked</p>
        <p className="text-xs text-muted-foreground">
          Requires <span className="font-mono">{widget.scope.requires}</span>
          {widget.scope.toolsets?.length
            ? ` + ${widget.scope.toolsets.join(", ")}`
            : ""}
          .
        </p>
      </div>
    </div>
  );
}

function WidgetFooter({
  widget,
  loading,
  onRefetch,
}: {
  widget: WidgetConfig;
  loading: boolean;
  onRefetch: () => void;
}) {
  const refreshLabel =
    widget.refresh.mode === "interval"
      ? `Refreshes every ${formatSeconds(widget.refresh.seconds)}`
      : widget.refresh.mode === "realtime"
      ? "Live"
      : "Static";

  return (
    <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0 h-5 border-border/60"
        >
          {widget.scope.requires}
        </Badge>
        {widget.scope.pii && (
          <Badge
            variant="outline"
            className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0 h-5 border-amber-300 text-amber-700"
          >
            PII
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground">{refreshLabel}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefetch}
        disabled={loading}
        className="h-6 w-6 p-0"
        aria-label="Refresh widget"
      >
        <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
      </Button>
    </div>
  );
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}
