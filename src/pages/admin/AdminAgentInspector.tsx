// ═══════════════════════════════════════════════════════════════════════
// Admin → Agent Inspector
//
// Operator-facing tool to inspect and safely edit:
//   1. agent_status        — is_online + maintenance_message
//   2. model_preference    — stored model on agent_prompts
//   3. pack/name collisions — agents whose lower(agent_name) repeats
//                             across multiple packs (router ambiguity)
//
// Every mutation goes through a small `applyChange` helper that writes
// one row to `audit_log` with a structured request_summary so admin
// activity is reviewable from the standard audit trail.
// ═══════════════════════════════════════════════════════════════════════

import { useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, AlertTriangle, CheckCircle2, Search, RefreshCcw, Power } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MaramaCard } from "@/components/shared/marama";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ─── Constants ──────────────────────────────────────────────────────────────
// Mirrors supabase/functions/_shared/model-router.ts PREFIX_MAP. Keep the two
// in sync so admins can only choose models the router can resolve.
const MODEL_OPTIONS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-pro",
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-pro-preview",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-5.2",
  "anthropic/claude-sonnet-4-5",
] as const;

// ─── Types ──────────────────────────────────────────────────────────────────
interface AgentRow {
  id: string;
  agent_name: string;
  display_name: string;
  pack: string;
  is_active: boolean | null;
  model_preference: string | null;
}

interface StatusRow {
  agent_id: string;
  is_online: boolean;
  maintenance_message: string | null;
  updated_at: string;
}

interface CollisionGroup {
  slug: string;
  rows: AgentRow[];
}

interface DraftStatus {
  is_online: boolean;
  maintenance_message: string;
}

// ─── Audit helper ───────────────────────────────────────────────────────────
async function writeAudit(params: {
  userId: string;
  agentName: string;
  action: string;
  before: unknown;
  after: unknown;
  passed: boolean;
}) {
  const { error } = await supabase.from("audit_log").insert({
    user_id: params.userId,
    agent_code: params.agentName,
    agent_name: params.agentName,
    model_used: "admin/agent-inspector",
    request_summary: `admin.${params.action}`,
    response_summary: JSON.stringify({
      action: params.action,
      before: params.before,
      after: params.after,
    }).slice(0, 4000),
    compliance_passed: params.passed,
    data_classification: "INTERNAL",
  });
  if (error) {
    // Audit failure is non-fatal for the user-facing action but loud in the console.
    console.error("[agent-inspector] audit insert failed:", error.message);
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AdminAgentInspector() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, DraftStatus>>({});
  const [modelDrafts, setModelDrafts] = useState<Record<string, string>>({});

  // Agents
  const { data: agents, isLoading: agentsLoading, refetch: refetchAgents } = useQuery({
    queryKey: ["inspector-agents"],
    queryFn: async (): Promise<AgentRow[]> => {
      const { data, error } = await supabase
        .from("agent_prompts")
        .select("id, agent_name, display_name, pack, is_active, model_preference")
        .order("pack", { ascending: true })
        .order("agent_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AgentRow[];
    },
  });

  // Statuses
  const { data: statuses, isLoading: statusLoading, refetch: refetchStatuses } = useQuery({
    queryKey: ["inspector-statuses"],
    queryFn: async (): Promise<Record<string, StatusRow>> => {
      const { data, error } = await supabase
        .from("agent_status")
        .select("agent_id, is_online, maintenance_message, updated_at");
      if (error) throw error;
      const map: Record<string, StatusRow> = {};
      (data ?? []).forEach((row) => {
        map[row.agent_id] = row as StatusRow;
      });
      return map;
    },
  });

  // Collisions — derived from agents
  const collisions: CollisionGroup[] = useMemo(() => {
    if (!agents) return [];
    const groups = new Map<string, AgentRow[]>();
    for (const a of agents) {
      const slug = a.agent_name.trim().toLowerCase();
      if (!groups.has(slug)) groups.set(slug, []);
      groups.get(slug)!.push(a);
    }
    return Array.from(groups.entries())
      .filter(([, rows]) => rows.length > 1)
      .map(([slug, rows]) => ({ slug, rows }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
  }, [agents]);

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.agent_name.toLowerCase().includes(q) ||
        a.display_name.toLowerCase().includes(q) ||
        a.pack.toLowerCase().includes(q),
    );
  }, [agents, search]);

  const onlineCount = useMemo(() => {
    if (!statuses || !agents) return 0;
    return agents.filter((a) => statuses[a.agent_name]?.is_online !== false).length;
  }, [agents, statuses]);

  // ─── Mutations ──────────────────────────────────────────────────────────
  const saveStatus = useCallback(
    async (agent: AgentRow) => {
      if (!user) {
        toast.error("Not signed in");
        return;
      }
      const draft = statusDrafts[agent.agent_name];
      if (!draft) return;
      const before = statuses?.[agent.agent_name] ?? { is_online: true, maintenance_message: null };
      setSavingKey(`status:${agent.agent_name}`);
      const { error } = await supabase
        .from("agent_status")
        .upsert(
          {
            agent_id: agent.agent_name,
            is_online: draft.is_online,
            maintenance_message: draft.maintenance_message.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "agent_id" },
        );
      setSavingKey(null);
      if (error) {
        toast.error(`Save failed: ${error.message}`);
        await writeAudit({
          userId: user.id,
          agentName: agent.agent_name,
          action: "status.upsert.error",
          before,
          after: draft,
          passed: false,
        });
        return;
      }
      toast.success(`Status saved for ${agent.display_name}`);
      await writeAudit({
        userId: user.id,
        agentName: agent.agent_name,
        action: "status.upsert",
        before: { is_online: before.is_online, maintenance_message: before.maintenance_message },
        after: { is_online: draft.is_online, maintenance_message: draft.maintenance_message.trim() || null },
        passed: true,
      });
      setStatusDrafts((prev) => {
        const next = { ...prev };
        delete next[agent.agent_name];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["inspector-statuses"] });
    },
    [user, statusDrafts, statuses, queryClient],
  );

  const saveModel = useCallback(
    async (agent: AgentRow) => {
      if (!user) {
        toast.error("Not signed in");
        return;
      }
      const next = modelDrafts[agent.agent_name];
      if (!next || next === agent.model_preference) return;
      setSavingKey(`model:${agent.agent_name}`);
      const { error } = await supabase
        .from("agent_prompts")
        .update({ model_preference: next, updated_at: new Date().toISOString() })
        .eq("id", agent.id);
      setSavingKey(null);
      if (error) {
        toast.error(`Save failed: ${error.message}`);
        await writeAudit({
          userId: user.id,
          agentName: agent.agent_name,
          action: "model_preference.update.error",
          before: { model_preference: agent.model_preference },
          after: { model_preference: next },
          passed: false,
        });
        return;
      }
      toast.success(`Model preference updated for ${agent.display_name}`);
      await writeAudit({
        userId: user.id,
        agentName: agent.agent_name,
        action: "model_preference.update",
        before: { model_preference: agent.model_preference },
        after: { model_preference: next },
        passed: true,
      });
      setModelDrafts((prev) => {
        const n = { ...prev };
        delete n[agent.agent_name];
        return n;
      });
      queryClient.invalidateQueries({ queryKey: ["inspector-agents"] });
    },
    [user, modelDrafts, queryClient],
  );

  const deactivateRow = useCallback(
    async (row: AgentRow) => {
      if (!user) {
        toast.error("Not signed in");
        return;
      }
      const ok = window.confirm(
        `Deactivate "${row.display_name}" (${row.pack})?\n\nThis sets is_active=false on this row only — the other agents sharing the slug "${row.agent_name.toLowerCase()}" remain unchanged. The action is reversible from the Agent Catalog.`,
      );
      if (!ok) return;
      setSavingKey(`collision:${row.id}`);
      const { error } = await supabase
        .from("agent_prompts")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      setSavingKey(null);
      if (error) {
        toast.error(`Deactivate failed: ${error.message}`);
        await writeAudit({
          userId: user.id,
          agentName: row.agent_name,
          action: "collision.deactivate.error",
          before: { is_active: row.is_active, pack: row.pack, id: row.id },
          after: { is_active: false },
          passed: false,
        });
        return;
      }
      toast.success(`Deactivated ${row.display_name}`);
      await writeAudit({
        userId: user.id,
        agentName: row.agent_name,
        action: "collision.deactivate",
        before: { is_active: row.is_active, pack: row.pack, id: row.id },
        after: { is_active: false },
        passed: true,
      });
      queryClient.invalidateQueries({ queryKey: ["inspector-agents"] });
    },
    [user, queryClient],
  );

  // ─── UI ─────────────────────────────────────────────────────────────────
  const isLoading = agentsLoading || statusLoading;

  return (
    <div className="min-h-screen bg-background py-12">
      <Helmet>
        <title>Agent Inspector · Assembl Admin</title>
        <meta
          name="description"
          content="Inspect and safely edit agent_status, model preferences, and pack collisions with audit logging."
        />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Admin · Diagnostics
          </p>
          <h1 className="font-display text-4xl font-light text-[hsl(22_12%_35%)]">
            Agent inspector
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-2xl">
            Read and edit live agent configuration. Every change is written to{" "}
            <code className="font-mono text-xs">audit_log</code> with the previous and new
            values for review.
          </p>
        </header>

        {/* Summary */}
        <MaramaCard className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div>
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">
                Agents
              </div>
              <div className="font-mono text-lg text-foreground">{agents?.length ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">
                Online
              </div>
              <div className="font-mono text-lg text-[hsl(150_30%_28%)]">{onlineCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">
                Collisions
              </div>
              <div
                className={`font-mono text-lg ${
                  collisions.length > 0 ? "text-[hsl(35_55%_28%)]" : "text-[hsl(150_30%_28%)]"
                }`}
              >
                {collisions.length}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              refetchAgents();
              refetchStatuses();
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-[hsla(22,12%,50%,0.2)] px-4 py-2 text-[13px] font-medium text-foreground hover:bg-[hsla(22,12%,50%,0.05)] disabled:opacity-50 transition-colors"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </MaramaCard>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by agent name, display name, or pack…"
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="status" className="space-y-4">
          <TabsList>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="models">Model preference</TabsTrigger>
            <TabsTrigger value="collisions">
              Collisions
              {collisions.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[hsl(35_55%_88%)] px-1.5 text-[10px] font-medium text-[hsl(35_55%_28%)]">
                  {collisions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Status tab */}
          <TabsContent value="status">
            <MaramaCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[hsla(22,12%,50%,0.04)]">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Pack</th>
                      <th className="px-4 py-3 font-medium">Online</th>
                      <th className="px-4 py-3 font-medium">Maintenance message</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      filteredAgents.map((agent) => {
                        const current = statuses?.[agent.agent_name];
                        const draft = statusDrafts[agent.agent_name] ?? {
                          is_online: current?.is_online ?? true,
                          maintenance_message: current?.maintenance_message ?? "",
                        };
                        const dirty =
                          draft.is_online !== (current?.is_online ?? true) ||
                          draft.maintenance_message !== (current?.maintenance_message ?? "");
                        const isSaving = savingKey === `status:${agent.agent_name}`;
                        return (
                          <tr
                            key={agent.id}
                            className="border-t border-[hsla(22,12%,50%,0.08)] hover:bg-[hsla(22,12%,50%,0.03)]"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">
                                {agent.display_name}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                {agent.agent_name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                              {agent.pack}
                            </td>
                            <td className="px-4 py-3">
                              <Switch
                                checked={draft.is_online}
                                onCheckedChange={(v) =>
                                  setStatusDrafts((prev) => ({
                                    ...prev,
                                    [agent.agent_name]: { ...draft, is_online: v },
                                  }))
                                }
                              />
                            </td>
                            <td className="px-4 py-3 min-w-[280px]">
                              <Textarea
                                value={draft.maintenance_message}
                                onChange={(e) =>
                                  setStatusDrafts((prev) => ({
                                    ...prev,
                                    [agent.agent_name]: {
                                      ...draft,
                                      maintenance_message: e.target.value,
                                    },
                                  }))
                                }
                                placeholder={draft.is_online ? "—" : "Optional message shown to users"}
                                rows={1}
                                className="min-h-9 text-xs resize-y"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => saveStatus(agent)}
                                disabled={!dirty || isSaving}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(40_48%_66%)] px-3 py-1.5 text-[12px] font-medium text-[hsl(22_12%_25%)] hover:bg-[hsl(40_48%_60%)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                {isSaving ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                                Save
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </MaramaCard>
          </TabsContent>

          {/* Model preference tab */}
          <TabsContent value="models">
            <MaramaCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[hsla(22,12%,50%,0.04)]">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Pack</th>
                      <th className="px-4 py-3 font-medium">Stored model</th>
                      <th className="px-4 py-3 font-medium">New model</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      filteredAgents.map((agent) => {
                        const draft = modelDrafts[agent.agent_name] ?? agent.model_preference ?? "";
                        const dirty = !!draft && draft !== (agent.model_preference ?? "");
                        const isSaving = savingKey === `model:${agent.agent_name}`;
                        const recognised = !agent.model_preference || MODEL_OPTIONS.includes(agent.model_preference as typeof MODEL_OPTIONS[number]);
                        return (
                          <tr
                            key={agent.id}
                            className="border-t border-[hsla(22,12%,50%,0.08)] hover:bg-[hsla(22,12%,50%,0.03)]"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">
                                {agent.display_name}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                {agent.agent_name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                              {agent.pack}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-mono text-[11px] ${
                                  recognised ? "text-foreground" : "text-[hsl(35_55%_28%)]"
                                }`}
                              >
                                {agent.model_preference ?? "(none)"}
                              </span>
                              {!recognised && (
                                <div className="text-[10px] text-[hsl(35_55%_28%)] mt-0.5 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Unrecognised — router will fall back
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 min-w-[240px]">
                              <Select
                                value={draft}
                                onValueChange={(v) =>
                                  setModelDrafts((prev) => ({ ...prev, [agent.agent_name]: v }))
                                }
                              >
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue placeholder="Select model…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MODEL_OPTIONS.map((m) => (
                                    <SelectItem key={m} value={m} className="font-mono text-xs">
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => saveModel(agent)}
                                disabled={!dirty || isSaving}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(40_48%_66%)] px-3 py-1.5 text-[12px] font-medium text-[hsl(22_12%_25%)] hover:bg-[hsl(40_48%_60%)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                {isSaving ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                                Save
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </MaramaCard>
          </TabsContent>

          {/* Collisions tab */}
          <TabsContent value="collisions">
            {collisions.length === 0 && !isLoading && (
              <MaramaCard className="p-8 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-[hsl(150_30%_28%)] mb-2" />
                <p className="font-body text-sm text-muted-foreground">
                  No pack/name collisions detected. Each lower-cased{" "}
                  <code className="font-mono text-xs">agent_name</code> resolves to a single row.
                </p>
              </MaramaCard>
            )}

            {collisions.length > 0 && (
              <div className="space-y-4">
                <MaramaCard className="p-4 bg-[hsl(40_55%_96%)] border-[hsl(40_55%_82%)]">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-[hsl(35_55%_28%)] flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[hsl(35_55%_28%)]">
                      The model router resolves agents by{" "}
                      <code className="font-mono">lower(agent_name)</code>. When two rows share
                      the same slug, the router picks the first match arbitrarily — choose one to
                      deactivate, or rename the duplicate from the Agent Catalog.
                    </div>
                  </div>
                </MaramaCard>

                {collisions.map((group) => (
                  <MaramaCard key={group.slug} className="overflow-hidden">
                    <div className="px-4 py-3 bg-[hsla(22,12%,50%,0.04)] border-b border-[hsla(22,12%,50%,0.08)] flex items-center justify-between">
                      <div>
                        <div className="font-mono text-sm text-foreground">{group.slug}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {group.rows.length} rows · {group.rows.filter((r) => r.is_active).length}{" "}
                          active
                        </div>
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-2 font-medium">Display name</th>
                          <th className="px-4 py-2 font-medium">Pack</th>
                          <th className="px-4 py-2 font-medium">Active</th>
                          <th className="px-4 py-2 font-medium">Model</th>
                          <th className="px-4 py-2 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => {
                          const isSaving = savingKey === `collision:${row.id}`;
                          return (
                            <tr
                              key={row.id}
                              className="border-t border-[hsla(22,12%,50%,0.08)]"
                            >
                              <td className="px-4 py-3 font-medium text-foreground">
                                {row.display_name}
                              </td>
                              <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                                {row.pack}
                              </td>
                              <td className="px-4 py-3">
                                {row.is_active ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-[hsl(150_30%_28%)]">
                                    <CheckCircle2 className="h-3 w-3" /> active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                    inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                                {row.model_preference ?? "(none)"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => deactivateRow(row)}
                                  disabled={!row.is_active || isSaving}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(10_50%_78%)] bg-[hsl(10_50%_96%)] px-3 py-1.5 text-[12px] font-medium text-[hsl(10_50%_32%)] hover:bg-[hsl(10_50%_92%)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isSaving ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Power className="h-3 w-3" />
                                  )}
                                  Deactivate
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </MaramaCard>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
