import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, Link } from "react-router-dom";
import { Loader2, Search, Download, Pencil } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import { useAuth } from "@/hooks/useAuth";
import { allAgents, packs, echoAgent, pilotAgent, type Agent } from "@/data/agents";
import { useAgentOverrides } from "@/hooks/useAgentOverrides";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Build the full inventory: every agent declared in src/data/agents.ts
// plus the special-case `echoAgent` and `pilotAgent` exports used by ChatPage.
const FULL_INVENTORY: Agent[] = [
  ...allAgents,
  ...(allAgents.find((a) => a.id === echoAgent.id) ? [] : [echoAgent]),
  ...(allAgents.find((a) => a.id === pilotAgent.id) ? [] : [pilotAgent]),
];

const packLabel = (id?: string) =>
  packs.find((p) => p.id === id)?.name ?? (id ?? "core");

export default function AdminAgentInventoryPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { overrides, resolveAgent } = useAgentOverrides();
  const [search, setSearch] = useState("");
  const [packFilter, setPackFilter] = useState<string>("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FULL_INVENTORY.filter((a) => {
      if (packFilter !== "all" && (a.pack ?? "core") !== packFilter) return false;
      if (!q) return true;
      const hay = [
        a.id,
        a.name,
        a.role,
        a.designation,
        a.tagline,
        ...a.traits,
        ...a.expertise,
        ...a.starters,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [search, packFilter]);

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify(FULL_INVENTORY.map(resolveAgent), null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-inventory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-foreground/60" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const totals = {
    all: FULL_INVENTORY.length,
    overridden: Object.keys(overrides).length,
    hidden: Object.values(overrides).filter((o) => !o.is_active).length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Agent Inventory · Admin · Assembl</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <BrandNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-foreground/55">Admin</p>
            <h1 className="font-display font-light uppercase tracking-[0.06em] text-3xl mt-1">
              Agent Inventory
            </h1>
            <p className="text-sm text-foreground/65 mt-2 max-w-2xl">
              Read-only list of every agent detected in <code className="text-xs">src/data/agents.ts</code>.
              Use this to confirm the exact set before editing in the catalog.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportJson} className="gap-2">
              <Download className="w-4 h-4" /> Export JSON
            </Button>
            <Button asChild className="gap-2">
              <Link to="/admin/agents">
                <Pencil className="w-4 h-4" /> Open catalog editor
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-3 text-xs text-foreground/65">
          <span className="px-2.5 py-1 rounded-md bg-foreground/[0.05]">
            Total agents: <strong className="text-foreground">{totals.all}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-foreground/[0.05]">
            With overrides: <strong className="text-foreground">{totals.overridden}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-foreground/[0.05]">
            Hidden site-wide: <strong className="text-foreground">{totals.hidden}</strong>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by id, name, role, tag, or starter…"
              className="pl-9"
            />
          </div>
          <select
            value={packFilter}
            onChange={(e) => setPackFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
          >
            <option value="all">All packs</option>
            <option value="core">core</option>
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.04] text-xs uppercase tracking-wider text-foreground/60">
              <tr>
                <th className="text-left px-4 py-3">Agent</th>
                <th className="text-left px-4 py-3">ID / Designation</th>
                <th className="text-left px-4 py-3">Pack</th>
                <th className="text-left px-4 py-3">Tags</th>
                <th className="text-left px-4 py-3">Starters</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((agent) => {
                const merged = resolveAgent(agent);
                const override = overrides[agent.id];
                const tagCount = merged.traits.length + merged.expertise.length;
                return (
                  <tr
                    key={agent.id}
                    className="border-t border-foreground/10 align-top hover:bg-foreground/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-md flex-shrink-0"
                          style={{ backgroundColor: agent.color }}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{merged.name}</div>
                          <div className="text-xs text-foreground/55 truncate">
                            {merged.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <div>{agent.id}</div>
                      <div className="text-foreground/45">{agent.designation}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <Badge variant="outline" className="font-mono">
                        {merged.pack ?? "core"}
                      </Badge>
                      <div className="text-foreground/50 mt-1">
                        {packLabel(merged.pack)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {merged.traits.slice(0, 4).map((t) => (
                          <span
                            key={`t-${t}`}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {t}
                          </span>
                        ))}
                        {merged.expertise.slice(0, 4).map((t) => (
                          <span
                            key={`e-${t}`}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/[0.06] text-foreground/70"
                          >
                            {t}
                          </span>
                        ))}
                        {tagCount > 8 && (
                          <span className="text-[10px] text-foreground/45">
                            +{tagCount - 8} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ol className="list-decimal list-inside space-y-0.5 text-xs text-foreground/75 max-w-sm">
                        {merged.starters.slice(0, 4).map((s, i) => (
                          <li key={i} className="truncate" title={s}>
                            {s}
                          </li>
                        ))}
                        {merged.starters.length === 0 && (
                          <li className="list-none text-foreground/40 italic">
                            No starters defined
                          </li>
                        )}
                      </ol>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex flex-col gap-1">
                        {override ? (
                          <Badge className="bg-primary/15 text-primary border-primary/30 w-fit">
                            Overridden
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">Default</Badge>
                        )}
                        {override && !override.is_active && (
                          <Badge variant="destructive" className="w-fit">Hidden</Badge>
                        )}
                        <Link
                          to="/admin/agents"
                          className="text-primary hover:underline text-[11px] mt-1"
                        >
                          Edit →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-foreground/55">
                    No agents match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-foreground/50">
          Showing {rows.length} of {FULL_INVENTORY.length} agents · Source:{" "}
          <code>src/data/agents.ts</code>
        </p>
      </div>
    </div>
  );
}
