import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, Link } from "react-router-dom";
import {
  Loader2,
  Search,
  Plus,
  Save,
  Trash2,
  Power,
  PowerOff,
  RotateCcw,
  History,
  PlayCircle,
  RotateCw,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BrandNav from "@/components/BrandNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AgentPrompt {
  id: string;
  agent_name: string;
  pack: string;
  display_name: string;
  icon: string | null;
  system_prompt: string;
  version: number | null;
  is_active: boolean | null;
  model_preference: string | null;
  created_at: string;
  updated_at: string;
}

interface PromptVersion {
  id: string;
  prompt_id: string;
  agent_name: string;
  pack: string;
  display_name: string;
  icon: string | null;
  system_prompt: string;
  model_preference: string | null;
  is_active: boolean | null;
  version: number;
  changed_by: string | null;
  change_note: string | null;
  created_at: string;
}

const MODEL_OPTIONS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash-lite",
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-pro-preview",
  "anthropic/claude-sonnet-4-5",
  "anthropic/claude-opus-4-6",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-5.2",
  "perplexity/sonar-pro",
  "gemini-2.5-flash",
];

const emptyDraft = {
  agent_name: "",
  pack: "",
  display_name: "",
  icon: "",
  system_prompt: "",
  model_preference: "google/gemini-2.5-flash",
  is_active: true,
};

export default function AdminAgentPromptsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<AgentPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [packFilter, setPackFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AgentPrompt>>({});
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newDraft, setNewDraft] = useState({ ...emptyDraft });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PromptVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<PromptVersion | null>(null);
  const [changeNote, setChangeNote] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_prompts")
      .select("*")
      .order("pack", { ascending: true })
      .order("agent_name", { ascending: true });
    if (error) {
      toast.error(`Failed to load: ${error.message}`);
    } else {
      setRows((data ?? []) as AgentPrompt[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  const packs = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.pack))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      if (packFilter !== "all" && r.pack !== packFilter) return false;
      if (!q) return true;
      return (
        r.agent_name.toLowerCase().includes(q) ||
        r.display_name.toLowerCase().includes(q) ||
        r.pack.toLowerCase().includes(q)
      );
    });
  }, [rows, search, packFilter]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId],
  );

  useEffect(() => {
    if (selected) {
      setDraft({
        display_name: selected.display_name,
        icon: selected.icon ?? "",
        system_prompt: selected.system_prompt,
        model_preference: selected.model_preference ?? "google/gemini-2.5-flash",
        is_active: selected.is_active ?? true,
      });
    } else {
      setDraft({});
    }
  }, [selected]);

  const isDirty = useMemo(() => {
    if (!selected) return false;
    return (
      draft.display_name !== selected.display_name ||
      (draft.icon ?? "") !== (selected.icon ?? "") ||
      draft.system_prompt !== selected.system_prompt ||
      draft.model_preference !== (selected.model_preference ?? "") ||
      draft.is_active !== (selected.is_active ?? true)
    );
  }, [draft, selected]);

  const loadHistory = useCallback(async (promptId: string) => {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("agent_prompt_versions")
      .select("*")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistoryLoading(false);
    if (error) {
      toast.error(`History failed: ${error.message}`);
      return;
    }
    setHistory((data ?? []) as PromptVersion[]);
  }, []);

  useEffect(() => {
    setShowHistory(false);
    setPreviewVersion(null);
    setHistory([]);
  }, [selectedId]);

  useEffect(() => {
    if (showHistory && selected) void loadHistory(selected.id);
  }, [showHistory, selected, loadHistory]);

  const snapshotCurrent = async (row: AgentPrompt, note: string | null) => {
    await supabase.from("agent_prompt_versions").insert({
      prompt_id: row.id,
      agent_name: row.agent_name,
      pack: row.pack,
      display_name: row.display_name,
      icon: row.icon,
      system_prompt: row.system_prompt,
      model_preference: row.model_preference,
      is_active: row.is_active,
      version: row.version ?? 1,
      changed_by: user?.id ?? null,
      change_note: note,
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    // Snapshot the OUTGOING version before mutating the row
    await snapshotCurrent(selected, changeNote.trim() || null);
    const newVersion = (selected.version ?? 1) + 1;
    const { error } = await supabase
      .from("agent_prompts")
      .update({
        display_name: draft.display_name ?? selected.display_name,
        icon: draft.icon || null,
        system_prompt: draft.system_prompt ?? selected.system_prompt,
        model_preference: draft.model_preference ?? selected.model_preference,
        is_active: draft.is_active ?? selected.is_active,
        version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast.error(`Save failed: ${error.message}`);
      return;
    }
    setChangeNote("");
    toast.success(`${selected.display_name} updated to v${newVersion}`);
    await load();
    if (showHistory) await loadHistory(selected.id);
  };

  const handleRestore = async (version: PromptVersion) => {
    if (!selected) return;
    if (!confirm(`Restore ${selected.display_name} to v${version.version}? Current state will be saved to history.`)) return;
    await snapshotCurrent(selected, `Auto-snapshot before restore to v${version.version}`);
    const newVersion = (selected.version ?? 1) + 1;
    const { error } = await supabase
      .from("agent_prompts")
      .update({
        display_name: version.display_name,
        icon: version.icon,
        system_prompt: version.system_prompt,
        model_preference: version.model_preference,
        is_active: version.is_active,
        version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    if (error) {
      toast.error(`Restore failed: ${error.message}`);
      return;
    }
    toast.success(`Restored to v${version.version} (now v${newVersion})`);
    setPreviewVersion(null);
    await load();
    await loadHistory(selected.id);
  };


  const handleToggleActive = async (row: AgentPrompt) => {
    const { error } = await supabase
      .from("agent_prompts")
      .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) {
      toast.error(`Toggle failed: ${error.message}`);
      return;
    }
    toast.success(`${row.display_name} ${!row.is_active ? "activated" : "deactivated"}`);
    await load();
  };

  const handleDelete = async (row: AgentPrompt) => {
    if (!confirm(`Delete ${row.display_name} (${row.agent_name})? This cannot be undone.`)) return;
    const { error } = await supabase.from("agent_prompts").delete().eq("id", row.id);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      return;
    }
    if (selectedId === row.id) setSelectedId(null);
    toast.success(`${row.display_name} deleted`);
    await load();
  };

  const handleCreate = async () => {
    if (!newDraft.agent_name || !newDraft.pack || !newDraft.display_name || !newDraft.system_prompt) {
      toast.error("agent_name, pack, display_name and system_prompt are required");
      return;
    }
    const { error } = await supabase.from("agent_prompts").insert({
      agent_name: newDraft.agent_name.trim(),
      pack: newDraft.pack.trim(),
      display_name: newDraft.display_name.trim(),
      icon: newDraft.icon.trim() || null,
      system_prompt: newDraft.system_prompt,
      model_preference: newDraft.model_preference,
      is_active: newDraft.is_active,
      version: 1,
    });
    if (error) {
      toast.error(`Create failed: ${error.message}`);
      return;
    }
    toast.success(`${newDraft.display_name} created`);
    setShowCreate(false);
    setNewDraft({ ...emptyDraft });
    await load();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground/60">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Agent Prompts · Admin · Assembl</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <BrandNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-foreground/55">Admin</p>
            <h1 className="font-display font-light uppercase tracking-[0.06em] text-3xl text-foreground mt-1">
              Agent system prompts
            </h1>
            <p className="text-sm text-foreground/60 mt-2">
              View, edit, version, and activate the system prompt for every agent in the catalogue.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New prompt
          </Button>
        </header>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Search agent name, display name, pack…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={packFilter} onValueChange={setPackFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All packs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packs ({rows.length})</SelectItem>
              {packs.map((p) => (
                <SelectItem key={p} value={p}>
                  {p} ({rows.filter((r) => r.pack === p).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
          {/* List */}
          <Card className="p-2 max-h-[72vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 flex items-center justify-center text-foreground/50">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-foreground/50 text-center">No prompts match.</div>
            ) : (
              <ul className="space-y-1">
                {filtered.map((r) => {
                  const active = r.id === selectedId;
                  return (
                    <li key={r.id}>
                      <button
                        onClick={() => setSelectedId(r.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition border ${
                          active
                            ? "bg-foreground/[0.06] border-foreground/15"
                            : "border-transparent hover:bg-foreground/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{r.display_name}</span>
                          {r.is_active ? (
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                              Off
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground/55">
                          <span className="font-mono">{r.agent_name}</span>
                          <span>·</span>
                          <span>{r.pack}</span>
                          <span>·</span>
                          <span>v{r.version ?? 1}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Editor */}
          <Card className="p-5">
            {!selected ? (
              <div className="h-full min-h-[400px] flex items-center justify-center text-foreground/50 text-sm">
                Select a prompt on the left to view or edit.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-2xl">{selected.display_name}</h2>
                      <Badge variant="outline" className="font-mono text-xs">
                        {selected.agent_name}
                      </Badge>
                      <Badge className="text-xs">{selected.pack}</Badge>
                      <Badge variant="secondary" className="text-xs">v{selected.version ?? 1}</Badge>
                    </div>
                    <p className="text-xs text-foreground/50 mt-1 font-mono">
                      Updated {new Date(selected.updated_at).toLocaleString("en-NZ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(selected)}
                      className="gap-2"
                    >
                      {selected.is_active ? (
                        <>
                          <PowerOff className="w-4 h-4" /> Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4" /> Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selected)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Display name</Label>
                    <Input
                      value={draft.display_name ?? ""}
                      onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Icon (lucide name)</Label>
                    <Input
                      value={draft.icon ?? ""}
                      placeholder="e.g. Shield"
                      onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Model</Label>
                    <Select
                      value={draft.model_preference ?? "google/gemini-2.5-flash"}
                      onValueChange={(v) => setDraft({ ...draft, model_preference: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={draft.is_active ?? false}
                    onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                  />
                  <Label className="text-sm">Active (visible to agent runtime)</Label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">System prompt</Label>
                    <span className="text-[11px] text-foreground/45 font-mono">
                      {(draft.system_prompt ?? "").length.toLocaleString()} chars
                    </span>
                  </div>
                  <Textarea
                    value={draft.system_prompt ?? ""}
                    onChange={(e) => setDraft({ ...draft, system_prompt: e.target.value })}
                    className="font-mono text-xs min-h-[420px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-foreground/10">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setDraft({
                        display_name: selected.display_name,
                        icon: selected.icon ?? "",
                        system_prompt: selected.system_prompt,
                        model_preference: selected.model_preference ?? "google/gemini-2.5-flash",
                        is_active: selected.is_active ?? true,
                      })
                    }
                    disabled={!isDirty || saving}
                  >
                    Discard
                  </Button>
                  <Button onClick={handleSave} disabled={!isDirty || saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save & bump version
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New agent prompt</DialogTitle>
            <DialogDescription>
              Create a new entry in the agent_prompts catalogue. agent_name + pack must be unique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">agent_name *</Label>
                <Input
                  value={newDraft.agent_name}
                  placeholder="e.g. echo"
                  onChange={(e) => setNewDraft({ ...newDraft, agent_name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">pack *</Label>
                <Input
                  value={newDraft.pack}
                  placeholder="e.g. auaha"
                  onChange={(e) => setNewDraft({ ...newDraft, pack: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Icon</Label>
                <Input
                  value={newDraft.icon}
                  placeholder="e.g. Music"
                  onChange={(e) => setNewDraft({ ...newDraft, icon: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Display name *</Label>
              <Input
                value={newDraft.display_name}
                placeholder="e.g. ECHO"
                onChange={(e) => setNewDraft({ ...newDraft, display_name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Model</Label>
              <Select
                value={newDraft.model_preference}
                onValueChange={(v) => setNewDraft({ ...newDraft, model_preference: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">System prompt *</Label>
              <Textarea
                value={newDraft.system_prompt}
                onChange={(e) => setNewDraft({ ...newDraft, system_prompt: e.target.value })}
                className="font-mono text-xs min-h-[240px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newDraft.is_active}
                onCheckedChange={(v) => setNewDraft({ ...newDraft, is_active: v })}
              />
              <Label className="text-sm">Active on create</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
