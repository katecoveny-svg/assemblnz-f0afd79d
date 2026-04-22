import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface ChatSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  matchCount: number;
  totalCount: number;
  accentColor?: string;
}

/**
 * In-chat search bar — filters past messages within the current conversation.
 * Collapsed by default to a small icon button; expands to an input on click.
 * Press `/` to open, `Esc` to close.
 */
export default function ChatSearchBar({
  query,
  onQueryChange,
  matchCount,
  totalCount,
  accentColor = "#6F6158",
}: ChatSearchBarProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts: "/" opens, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editing =
        tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if (e.key === "/" && !editing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
        onQueryChange("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onQueryChange]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Search messages (/)"
        aria-label="Search messages"
        className="inline-flex items-center justify-center h-8 w-8 rounded-pill border border-assembl-text-secondary/15 bg-white/70 hover:bg-white transition"
      >
        <Search className="h-3.5 w-3.5" style={{ color: accentColor }} />
      </button>
    );
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-pill border bg-white/85 px-2.5 py-1 shadow-sm"
      style={{ borderColor: `${accentColor}33` }}
    >
      <Search className="h-3.5 w-3.5" style={{ color: accentColor }} />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search messages…"
        className="bg-transparent text-xs text-assembl-text-primary placeholder:text-assembl-text-secondary/70 outline-none w-32 sm:w-44"
        aria-label="Filter messages in this conversation"
      />
      {hasQuery && (
        <span className="text-[10px] font-mono text-assembl-text-secondary tabular-nums">
          {matchCount}/{totalCount}
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          onQueryChange("");
          setOpen(false);
        }}
        title="Close search (Esc)"
        aria-label="Close search"
        className="inline-flex items-center justify-center h-5 w-5 rounded-pill hover:bg-assembl-mist transition"
      >
        <X className="h-3 w-3 text-assembl-text-secondary" />
      </button>
    </div>
  );
}
