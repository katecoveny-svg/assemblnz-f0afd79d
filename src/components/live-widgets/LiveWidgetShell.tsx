/**
 * LiveWidgetShell — the unified frame every dashboard widget renders into.
 *
 * Handles:
 *  - kete-accent border + subtitle
 *  - skeleton loading (variant-aware: stat / list / table / weather)
 *  - error state (with retry + optional stale fallback render)
 *  - empty state, forbidden (locked) state
 *  - footer meta line (last-updated time + scope chip + refresh control)
 *
 * The dispatcher (`LiveWidget`) decides which `skeletonVariant` to use
 * based on the widget's data source so first-paint feels closer to the
 * eventual content shape.
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

export type SkeletonVariant = "stat" | "list" | "table" | "weather" | "json";

export interface LiveWidgetShellProps {
  widget: WidgetConfig;
  loading: boolean;
  /** True only on first load (no cached data). Drives skeleton vs. inline spinner. */
  initialLoading?: boolean;
  /** True when refetching with cached data already shown. */
  refetching?: boolean;
  error: string | null;
  forbidden: boolean;
  isEmpty: boolean;
  /** Epoch ms of the last successful fetch — drives the "Updated …" footer. */
  updatedAt?: number | null;
  onRefetch: () => void;
  /** Rendered when data is ready and non-empty. */
  children: ReactNode;
  /** Optional rhs in the header (e.g. unit, region). */
  headerMeta?: ReactNode;
  /** Visual shape of the loading skeleton — defaults to a generic list. */
  skeletonVariant?: SkeletonVariant;
  /**
   * If true and we have cached `children`, an error is shown as a
   * non-blocking inline banner instead of replacing the body. This is
   * the "stale-while-error" graceful-degradation path.
   */
  hasStaleData?: boolean;
  className?: string;
}

export function LiveWidgetShell({
  widget,
  loading,
  initialLoading = loading,
  refetching = false,
  error,
  forbidden,
  isEmpty,
  updatedAt,
  onRefetch,
  children,
  headerMeta,
  skeletonVariant = "list",
  hasStaleData = false,
  className,
}: LiveWidgetShellProps) {
  const accent = getKeteAccent(widget.section);

  // Fall-through render rules — only block content when we have nothing else to show.
  const showSkeleton = !forbidden && initialLoading && !hasStaleData;
  const showHardError = !forbidden && !!error && !hasStaleData && !initialLoading;
  const showEmpty = !forbidden && !error && !initialLoading && isEmpty && !hasStaleData;
  const showContent =
    !forbidden && !showSkeleton && !showHardError && !showEmpty;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border bg-card/80 backdrop-blur-md shadow-[0_8px_30px_rgba(111,97,88,0.08)] rounded-3xl",
        className,
      )}
      style={{ borderColor: `${accent.accentHex}66` }}
      data-widget-id={widget.id}
      data-widget-section={widget.section}
      data-widget-state={
        forbidden
          ? "forbidden"
          : showSkeleton
            ? "loading"
            : showHardError
              ? "error"
              : showEmpty
                ? "empty"
                : "ready"
      }
    >
      {/* Top accent strip */}
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent.accentHex }} />
      {/* Refetch shimmer — only visible on the second-and-after fetch */}
      {refetching && !initialLoading && (
        <div
          className="absolute inset-x-0 top-[3px] h-[2px] overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full w-1/3 animate-[shimmer_1.4s_ease-in-out_infinite]"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent.accentHex}cc, transparent)`,
            }}
          />
        </div>
      )}

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
        {showSkeleton && <LoadingState variant={skeletonVariant} />}
        {showHardError && <ErrorState message={error!} onRetry={onRefetch} />}
        {showEmpty && (
          <EmptyState message={widget.emptyState ?? "No data available right now."} />
        )}
        {showContent && (
          <>
            {/* Inline non-blocking error banner when serving stale data */}
            {error && hasStaleData && (
              <StaleErrorBanner message={error} onRetry={onRefetch} />
            )}
            {children}
          </>
        )}

        <WidgetFooter
          widget={widget}
          loading={loading}
          updatedAt={updatedAt ?? null}
          onRefetch={onRefetch}
        />
      </CardContent>
    </Card>
  );
}

// ────────────────── Sub-states ──────────────────

function LoadingState({ variant }: { variant: SkeletonVariant }) {
  if (variant === "weather") {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    );
  }
  if (variant === "stat") {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      </div>
    );
  }
  if (variant === "table") {
    return (
      <div className="space-y-2" aria-busy="true" aria-live="polite">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }
  if (variant === "json") {
    return (
      <div className="space-y-1.5" aria-busy="true" aria-live="polite">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    );
  }
  // list (default)
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl bg-destructive/5 p-4 text-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-destructive font-medium">Couldn't load this widget</p>
          <p className="text-xs text-muted-foreground break-words mt-0.5">
            {humanizeError(message)}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="self-end h-7 px-3 text-xs">
        <RefreshCw className="h-3 w-3 mr-1.5" /> Try again
      </Button>
    </div>
  );
}

function StaleErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300/50 bg-amber-50/60 px-2.5 py-1.5 text-[11px] text-amber-800"
      role="status"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span className="flex-1 truncate">
        Showing cached data — couldn't refresh ({humanizeError(message)})
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="h-5 px-1.5 text-[10px] text-amber-900 hover:text-amber-900 hover:bg-amber-100/60"
      >
        Retry
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-6 text-center"
      aria-live="polite"
    >
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
  updatedAt,
  onRefetch,
}: {
  widget: WidgetConfig;
  loading: boolean;
  updatedAt: number | null;
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
      <div className="flex items-center gap-2 min-w-0">
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
        <span className="text-[10px] text-muted-foreground truncate">
          {refreshLabel}
          {updatedAt ? ` · updated ${formatAge(updatedAt)}` : ""}
        </span>
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

function formatAge(updatedAtMs: number): string {
  const diff = Math.max(0, Date.now() - updatedAtMs);
  if (diff < 5_000) return "just now";
  if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
  return `${Math.round(diff / 86_400_000)}d ago`;
}

/** Humanize common edge / network error strings into one-line copy. */
function humanizeError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "Network unreachable — check your connection.";
  }
  if (m.includes("timeout")) return "The request timed out. Try again.";
  if (m.includes("unauthorized") || m.includes("401")) return "Session expired — please sign in again.";
  if (m.includes("forbidden") || m.includes("403")) return "You don't have access to this data source.";
  if (m.includes("not found") || m.includes("404")) return "Data source not found.";
  if (m.includes("rate limit") || m.includes("429")) return "Rate limited — backing off.";
  if (raw.length > 140) return raw.slice(0, 137) + "…";
  return raw;
}
