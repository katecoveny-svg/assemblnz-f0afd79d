import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, Link } from "react-router-dom";
import { Loader2, ArrowLeftRight, GitCompare, History, Filter } from "lucide-react";
import { diffLines, type Change } from "diff";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BrandNav from "@/components/BrandNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface PromptVersion {
  id: string;
  prompt_id: string;
  agent_name: string;
  pack: string;
  display_name: string;
  system_prompt: string;
  version: number;
  change_note: string | null;
  changed_by: string | null;
  created_at: string;
}

interface CurrentPrompt {
  id: string;
  agent_name: string;
  pack: string;
  display_name: string;
  system_prompt: string;
  version: number | null;
  updated_at: string;
}

const SYNTHETIC_CURRENT_ID = "__current__";

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminPromptDiffPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [packs, setPacks] = useState<string[]>([]);
  const [selectedPack, setSelectedPack] = useState<string>("");
  const [agents, setAgents] = useState<CurrentPrompt[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<CurrentPrompt | null>(null);
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>(SYNTHETIC_CURRENT_ID);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Bootstrap pack list
  useEffect(() => {
    const loadPacks = async () => {
      const { data, error } = await supabase
        .from("agent_prompts")
        .select("pack")
        .order("pack");
      if (error) {
        toast.error("Could not load packs");
        return;
      }
      const unique = Array.from(new Set((data ?? []).map((r) => r.pack))).filter(Boolean);
      setPacks(unique);
      if (unique.length > 0 && !selectedPack) setSelectedPack(unique[0]);
    };
    if (user) loadPacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load agents in pack
  useEffect(() => {
    if (!selectedPack) return;
    const loadAgents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("agent_prompts")
        .select("id, agent_name, pack, display_name, system_prompt, version, updated_at")
        .eq("pack", selectedPack)
        .order("display_name");
      setLoading(false);
      if (error) {
        toast.error("Could not load agents");
        return;
      }
      setAgents(data ?? []);
      setSelectedAgentId("");
      setVersions([]);
      setCurrentPrompt(null);
    };
    loadAgents();
  }, [selectedPack]);

  // Load versions for selected agent
  useEffect(() => {
    if (!selectedAgentId) return;
    const loadVersions = async () => {
      setLoading(true);
      const current = agents.find((a) => a.id === selectedAgentId) ?? null;
      setCurrentPrompt(current);

      const { data, error } = await supabase
        .from("agent_prompt_versions")
        .select("*")
        .eq("prompt_id", selectedAgentId)
        .order("version", { ascending: false });
      setLoading(false);
      if (error) {
        toast.error("Could not load history");
        return;
      }
      const v = data ?? [];
      setVersions(v);
      // Default selections: left = oldest snapshot, right = current
      setRightId(SYNTHETIC_CURRENT_ID);
      setLeftId(v.length > 0 ? v[v.length - 1].id : "");
    };
    loadVersions();
  }, [selectedAgentId, agents]);

  const getPromptText = (id: string): { text: string; meta: string } => {
    if (id === SYNTHETIC_CURRENT_ID && currentPrompt) {
      return {
        text: currentPrompt.system_prompt,
        meta:
          "Current (v" +
          (currentPrompt.version ?? "?") +
          ") · updated " +
          formatDate(currentPrompt.updated_at),
      };
    }
    const v = versions.find((x) => x.id === id);
    if (!v) return { text: "", meta: "—" };
    return {
      text: v.system_prompt,
      meta:
        "v" +
        v.version +
        " · " +
        formatDate(v.created_at) +
        (v.change_note ? " · " + v.change_note : ""),
    };
  };

  const diffParts: Change[] = useMemo(() => {
    if (!leftId || !rightId) return [];
    const left = getPromptText(leftId).text || "";
    const right = getPromptText(rightId).text || "";
    return diffLines(left, right);
  }, [leftId, rightId, versions, currentPrompt]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const part of diffParts) {
      const lines = part.value.split("\n").filter(Boolean).length;
      if (part.added) added += lines;
      else if (part.removed) removed += lines;
    }
    return { added, removed };
  }, [diffParts]);

  const filteredAgents = useMemo(
    () =>
      agents.filter((a) =>
        (a.display_name + " " + a.agent_name)
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [agents, search],
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;

  const swap = () => {
    const a = leftId;
    setLeftId(rightId);
    setRightId(a);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Prompt diff viewer · Assembl admin</title>
        <meta
          name="description"
          content="Audit system prompt changes between snapshots for each industry kete."
        />
      </Helmet>
      <BrandNav />

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/admin" className="hover:underline">
              Admin
            </Link>
            <span>/</span>
            <Link to="/admin/agents/prompts" className="hover:underline">
              Prompts
            </Link>
            <span>/</span>
            <span>Diff viewer</span>
          </div>
          <h1 className="font-display text-4xl text-foreground mb-2">
            System prompt diff viewer
          </h1>
          <p className="text-muted-foreground">
            Compare snapshots from <code className="font-mono text-xs">agent_prompt_versions</code> against
            the current live prompt — per pack, per agent.
          </p>
        </div>

        <Card className="p-6 mb-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-[hsl(var(--border))]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                Pack
              </label>
              <Select value={selectedPack} onValueChange={setSelectedPack}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose pack" />
                </SelectTrigger>
                <SelectContent>
                  {packs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                Filter agents
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filteredAgents.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">No agents in this pack.</p>
            )}
            {filteredAgents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgentId(a.id)}
                className={
                  "px-3 py-1.5 rounded-full text-sm transition-colors border " +
                  (selectedAgentId === a.id
                    ? "bg-[#D9BC7A] text-[#6F6158] border-[#D9BC7A]"
                    : "bg-white/60 hover:bg-white text-foreground border-[hsl(var(--border))]")
                }
              >
                {a.display_name}
                <span className="ml-2 text-xs font-mono opacity-60">{a.agent_name}</span>
              </button>
            ))}
          </div>
        </Card>

        {selectedAgentId && (
          <Card className="p-6 mb-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#9D8C7D]" />
                <h2 className="font-display text-xl text-[#9D8C7D]">
                  Compare snapshots
                </h2>
                <Badge variant="outline" className="ml-2">
                  {versions.length} historical · 1 current
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-700">+{stats.added}</span>
                <span className="text-rose-700">−{stats.removed}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end mb-6">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                  Left (base)
                </label>
                <Select value={leftId} onValueChange={setLeftId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose snapshot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SYNTHETIC_CURRENT_ID}>
                      Current live prompt
                    </SelectItem>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.version} · {formatDate(v.created_at)}
                        {v.change_note ? " · " + v.change_note.slice(0, 40) : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {getPromptText(leftId).meta}
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={swap}
                title="Swap left and right"
                className="self-center mt-5"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                  Right (compare)
                </label>
                <Select value={rightId} onValueChange={setRightId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose snapshot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SYNTHETIC_CURRENT_ID}>
                      Current live prompt
                    </SelectItem>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.version} · {formatDate(v.created_at)}
                        {v.change_note ? " · " + v.change_note.slice(0, 40) : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {getPromptText(rightId).meta}
                </p>
              </div>
            </div>

            <div className="border border-[hsl(var(--border))] rounded-2xl overflow-hidden bg-[#FBF8F3]">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 border-b border-[hsl(var(--border))]">
                <GitCompare className="h-4 w-4 text-[#9D8C7D]" />
                <span className="font-mono text-xs text-muted-foreground">
                  Unified line diff
                </span>
              </div>
              <ScrollArea className="h-[60vh]">
                <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {diffParts.length === 0 && (
                    <span className="text-muted-foreground">Pick two snapshots to compare.</span>
                  )}
                  {diffParts.map((part, i) => {
                    if (part.added) {
                      return (
                        <span
                          key={i}
                          className="block bg-emerald-50 text-emerald-900 border-l-2 border-emerald-400 pl-2"
                        >
                          {part.value
                            .split("\n")
                            .map((l, j, arr) =>
                              j === arr.length - 1 && l === "" ? null : "+ " + l + "\n",
                            )
                            .join("")}
                        </span>
                      );
                    }
                    if (part.removed) {
                      return (
                        <span
                          key={i}
                          className="block bg-rose-50 text-rose-900 border-l-2 border-rose-400 pl-2"
                        >
                          {part.value
                            .split("\n")
                            .map((l, j, arr) =>
                              j === arr.length - 1 && l === "" ? null : "− " + l + "\n",
                            )
                            .join("")}
                        </span>
                      );
                    }
                    return (
                      <span key={i} className="block text-foreground/70 pl-2">
                        {part.value}
                      </span>
                    );
                  })}
                </pre>
              </ScrollArea>
            </div>

            {versions.length === 0 && currentPrompt && (
              <p className="text-sm text-muted-foreground mt-4">
                No snapshots yet for this agent. Take a snapshot from the{" "}
                <Link to="/admin/agents/prompts" className="underline">
                  prompt editor
                </Link>{" "}
                to start tracking history.
              </p>
            )}
          </Card>
        )}

        {!selectedAgentId && selectedPack && (
          <Card className="p-12 text-center bg-white/60 rounded-3xl border border-[hsl(var(--border))]">
            <p className="text-muted-foreground">
              Pick an agent above to see its prompt history.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminPromptDiffPage;
