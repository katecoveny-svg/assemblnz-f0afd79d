import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Save, RotateCcw, Search, X } from "lucide-react";
import { Navigate } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import { useAuth } from "@/hooks/useAuth";
import { allAgents, packs, type Agent } from "@/data/agents";
import {
  fetchAgentOverrides,
  upsertAgentOverride,
  deleteAgentOverride,
  mergeAgentOverride,
  type AgentOverride,
} from "@/lib/agentOverrides";
import { useAgentOverrides } from "@/hooks/useAgentOverrides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DraftRow {
  base: Agent;
  override: AgentOverride;
  dirty: boolean;
}

const emptyOverride = (a: Agent): AgentOverride => ({
  agent_id: a.id,
  name: a.name,
  role: a.role,
  tagline: a.tagline,
  pack: a.pack ?? "core",
  is_active: true,
  traits: [...a.traits],
  expertise: [...a.expertise],
  starters: [...a.starters],
});

function parseList(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function AdminAgentCatalogPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { refresh } = useAgentOverrides();
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [packFilter, setPackFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    (async () => {
      const live = await fetchAgentOverrides();
      const next: Record<string, DraftRow> = {};
      for (const a of allAgents) {
        const o = live[a.id];
        next[a.id] = {
          base: a,
          override: o ? { ...emptyOverride(a), ...o, traits: o.traits, expertise: o.expertise, starters: o.starters } : emptyOverride(a),
          dirty: false,
        };
      }
      setDrafts(next);
      setLoading(false);
    })();
  }, [authLoading, isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Object.values(drafts).filter((d) => {
      if (packFilter !== "all" && (d.override.pack ?? "core") !== packFilter) return false;
      if (!q) return true;
      const hay = [d.base.id, d.base.name, d.override.name, d.override.role, d.override.tagline]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [drafts, search, packFilter]);

  const updateDraft = (agentId: string, patch: Partial<AgentOverride>) => {
    setDrafts((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        override: { ...prev[agentId].override, ...patch },
        dirty: true,
      },
    }));
  };

  const handleSave = async (agentId: string) => {
    const row = drafts[agentId];
    if (!row) return;
    setSaving(agentId);
    const result = await upsertAgentOverride(row.override);
    setSaving(null);
    if (!result.ok) {
      toast.error(`Save failed: ${result.error}`);
      return;
    }
    toast.success(`Saved ${row.override.name ?? row.base.name}`);
    setDrafts((prev) => ({ ...prev, [agentId]: { ...prev[agentId], dirty: false } }));
    refresh();
  };

  const handleReset = async (agentId: string) => {
    const row = drafts[agentId];
    if (!row) return;
    setSaving(agentId);
    const result = await deleteAgentOverride(agentId);
    setSaving(null);
    if (!result.ok) {
      toast.error(`Reset failed: ${result.error}`);
      return;
    }
    toast.success(`Reset ${row.base.name} to defaults`);
    setDrafts((prev) => ({
      ...prev,
      [agentId]: { base: row.base, override: emptyOverride(row.base), dirty: false },
    }));
    refresh();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Agent Catalog · Admin · Assembl</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <BrandNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.32em] text-foreground/55">Admin</p>
          <h1 className="font-display font-light uppercase tracking-[0.06em] text-3xl mt-1">
            Agent Catalog
          </h1>
          <p className="text-sm text-foreground/65 mt-2 max-w-2xl">
            Edit display names, roles, taglines, tags, and starter questions for any agent.
            Changes apply instantly across the site. Reset returns an agent to its code-defined defaults.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, or id…"
              className="pl-9"
            />
          </div>
          <select
            value={packFilter}
            onChange={(e) => setPackFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All packs ({Object.keys(drafts).length})</option>
            <option value="core">Core</option>
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-foreground/40" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => {
              const merged = mergeAgentOverride(row.base, row.override);
              const isOpen = expanded === row.base.id;
              return (
                <div
                  key={row.base.id}
                  className="rounded-xl border border-foreground/10 bg-foreground/[0.03] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : row.base.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-foreground/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: row.base.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{merged.name}</span>
                          <span className="text-xs text-foreground/45">{row.base.designation}</span>
                          {!row.override.is_active && (
                            <Badge variant="secondary" className="text-[10px]">Hidden</Badge>
                          )}
                          {row.dirty && (
                            <Badge className="text-[10px] bg-warning/20 text-warning-foreground border-warning/30">
                              Unsaved
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground/55 truncate">{merged.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-foreground/40 flex-shrink-0 ml-3">
                      {merged.pack ?? "core"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-foreground/10 p-4 space-y-4 bg-background/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Display name</Label>
                          <Input
                            value={row.override.name ?? ""}
                            onChange={(e) => updateDraft(row.base.id, { name: e.target.value })}
                            placeholder={row.base.name}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Role</Label>
                          <Input
                            value={row.override.role ?? ""}
                            onChange={(e) => updateDraft(row.base.id, { role: e.target.value })}
                            placeholder={row.base.role}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Tagline</Label>
                        <Textarea
                          rows={2}
                          value={row.override.tagline ?? ""}
                          onChange={(e) => updateDraft(row.base.id, { tagline: e.target.value })}
                          placeholder={row.base.tagline}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Pack</Label>
                          <select
                            value={row.override.pack ?? "core"}
                            onChange={(e) => updateDraft(row.base.id, { pack: e.target.value })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                          >
                            <option value="core">core</option>
                            {packs.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.id}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                          <Switch
                            checked={row.override.is_active}
                            onCheckedChange={(v) => updateDraft(row.base.id, { is_active: v })}
                          />
                          <Label className="text-sm">
                            {row.override.is_active ? "Active" : "Hidden site-wide"}
                          </Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Traits (one per line)</Label>
                          <Textarea
                            rows={4}
                            value={row.override.traits.join("\n")}
                            onChange={(e) =>
                              updateDraft(row.base.id, { traits: parseList(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Expertise (one per line)</Label>
                          <Textarea
                            rows={4}
                            value={row.override.expertise.join("\n")}
                            onChange={(e) =>
                              updateDraft(row.base.id, { expertise: parseList(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Starter questions (one per line, max 4 shown)</Label>
                        <Textarea
                          rows={4}
                          value={row.override.starters.join("\n")}
                          onChange={(e) =>
                            updateDraft(row.base.id, { starters: parseList(e.target.value) })
                          }
                          placeholder={row.base.starters.join("\n")}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          onClick={() => handleSave(row.base.id)}
                          disabled={!row.dirty || saving === row.base.id}
                          className="gap-2"
                        >
                          {saving === row.base.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReset(row.base.id)}
                          disabled={saving === row.base.id}
                          className="gap-2"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset to defaults
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setExpanded(null)}
                          className="gap-2 ml-auto"
                        >
                          <X className="w-4 h-4" /> Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-foreground/55 text-center py-12">
                No agents match the current filter.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
