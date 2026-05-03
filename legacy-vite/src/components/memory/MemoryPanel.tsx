import { useState } from "react";
import { Brain, Search, Clock, Sparkles } from "lucide-react";
import { searchMemory, type MemoryResult } from "@/lib/searchMemory";
import { useAuth } from "@/hooks/useAuth";

export default function MemoryPanel() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !user) return;
    setSearching(true);
    setSearched(true);
    const data = await searchMemory(user.id, query, undefined, 10);
    setResults(data);
    setSearching(false);
  };

  const AGENT_LABELS: Record<string, string> = {
    hospitality: "Manaaki",
    construction: "Waihanga",
    creative: "Auaha",
    automotive: "Arataki",
    customs: "Pikau",
    operations: "Helm",
    marketing: "Marketing",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Agent Memory</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Search past conversations indexed for this workspace. Memory coverage is being expanded across kete — Tōro and Manaaki carry context today.
      </p>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search memory… e.g. 'pricing discussion'"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || searching}
          className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-2">
          {results.length === 0 && !searching && (
            <div className="text-center py-8">
              <Sparkles className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No memories found for "{query}"</p>
            </div>
          )}

          {results.map((r, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {AGENT_LABELS[r.agent_id] || r.agent_id}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(r.created_at).toLocaleDateString("en-NZ", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                {r.summary}
              </p>
              {r.key_facts && Object.keys(r.key_facts).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(r.key_facts)
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded-full text-[9px] bg-primary/10 text-primary"
                      >
                        {k}: {String(v).slice(0, 30)}
                      </span>
                    ))}
                </div>
              )}
              <div className="mt-1.5 text-right">
                <span className="text-[9px] text-muted-foreground">
                  relevance: {(r.rank * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
