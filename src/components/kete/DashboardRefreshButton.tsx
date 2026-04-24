import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface DashboardRefreshButtonProps {
  onReload: () => Promise<void>;
  /** Optional kete accent colour, e.g. "#4AA5A8". Defaults to Mārama Soft Gold. */
  accent?: string;
  /** Compact variant for tight headers. */
  size?: "sm" | "md";
  /** Last successful refresh time — rendered as "Updated X ago". */
  lastUpdatedAt?: Date | null;
}

/**
 * Manual reload button for kete dashboards.
 * Shows a spinning icon while reloading and a small "Updated …" caption when idle.
 */
export default function DashboardRefreshButton({
  onReload,
  accent = "#D9BC7A",
  size = "md",
  lastUpdatedAt,
}: DashboardRefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onReload();
    } finally {
      setIsLoading(false);
    }
  };

  const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const fontSize = size === "sm" ? "text-[10px]" : "text-xs";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div className="inline-flex items-center gap-2">
      {lastUpdatedAt ? (
        <span className="text-[10px] font-mono text-muted-foreground">
          Updated {formatTimeAgo(lastUpdatedAt)}
        </span>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={isLoading ? "Refreshing dashboard" : "Refresh dashboard"}
        className={`inline-flex items-center gap-1.5 rounded-full border transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 ${padding} ${fontSize}`}
        style={{
          background: "rgba(255,255,255,0.85)",
          borderColor: `${accent}40`,
          color: accent,
        }}
      >
        <RefreshCw className={`${iconSize} ${isLoading ? "animate-spin" : ""}`} />
        <span className="font-medium">{isLoading ? "Refreshing…" : "Refresh"}</span>
      </button>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
