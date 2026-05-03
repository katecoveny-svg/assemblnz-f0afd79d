import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

type ToolRegistryRow = {
  id: string;
  tool_name: string;
  description: string | null;
  tool_category: string | null;
  is_active: boolean;
  tool_schema: any;
};

type Toolset = { id: string; slug: string; display_name: string };

type Suggestion = {
  id: string;
  toolset: string;
  tool_name: string;
  confidence: number;
  reasoning: string;
};

type WizardRow = {
  source: ToolRegistryRow;
  toolset: string;
  tool_name: string;
  reasoning: string;
  skip: boolean;
};

const TOOLSET_SLUGS = ["manaaki", "waihanga", "auaha", "pakihi", "pikau", "core"];

export default function McpMigratePage() {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [rows, setRows] = useState<WizardRow[] | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-migrate-source"],
    queryFn: async () => {
      const [registry, toolsets, existing] = await Promise.all([
        supabase.from("tool_registry").select("*").order("tool_name"),
        supabase.from("mcp_toolsets").select("id, slug, display_name").order("slug"),
        supabase.from("mcp_tools").select("tool_registry_id").not("tool_registry_id", "is", null),
      ]);
      if (registry.error) throw registry.error;
      if (toolsets.error) throw toolsets.error;
      const migrated = new Set((existing.data ?? []).map((r: any) => r.tool_registry_id));
      const pending = (registry.data ?? []).filter((r) => !migrated.has(r.id));
      return {
        registry: pending as ToolRegistryRow[],
        alreadyMigrated: migrated.size,
        toolsets: (toolsets.data ?? []) as Toolset[],
      };
    },
  });

  const requestSuggestions = async () => {
    if (!data?.registry?.length) return;
    setSuggesting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("suggest-toolsets", {
        body: {
          tools: data.registry.map((r) => ({
            id: r.id,
            tool_name: r.tool_name,
            description: r.description,
            tool_category: r.tool_category,
          })),
        },
      });
      if (error) throw error;
      const map = new Map<string, Suggestion>();
      (result?.suggestions ?? []).forEach((s: Suggestion) => map.set(s.id, s));
      setRows(
        data.registry.map((r) => {
          const s = map.get(r.id);
          return {
            source: r,
            toolset: s?.toolset ?? "core",
            tool_name: s?.tool_name ?? r.tool_name,
            reasoning: s?.reasoning ?? "",
            skip: false,
          };
        }),
      );
      toast.success(`Suggestions ready for ${data.registry.length} tools`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Could not get suggestions");
      setRows(
        data.registry.map((r) => ({
          source: r,
          toolset: "core",
          tool_name: r.tool_name,
          reasoning: "",
          skip: false,
        })),
      );
    } finally {
      setSuggesting(false);
    }
  };

  const breakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    let skipped = 0;
    (rows ?? []).forEach((r) => {
      if (r.skip) skipped++;
      else counts[r.toolset] = (counts[r.toolset] ?? 0) + 1;
    });
    return { counts, skipped };
  }, [rows]);

  const warnings = useMemo(() => {
    const warns: string[] = [];
    if (!rows) return warns;
    Object.entries(breakdown.counts).forEach(([slug, n]) => {
      if (n > 30) warns.push(`Toolset "${slug}" has ${n} tools — consider splitting.`);
    });
    const names = new Map<string, number>();
    rows.filter((r) => !r.skip).forEach((r) => {
      const k = `${r.toolset}/${r.tool_name}`;
      names.set(k, (names.get(k) ?? 0) + 1);
    });
    names.forEach((n, k) => {
      if (n > 1) warns.push(`Duplicate name "${k}" appears ${n}×.`);
    });
    TOOLSET_SLUGS.forEach((slug) => {
      if (!breakdown.counts[slug]) warns.push(`Toolset "${slug}" will have 0 tools.`);
    });
    return warns;
  }, [rows, breakdown]);

  const commit = useMutation({
    mutationFn: async () => {
      if (!rows || !data) throw new Error("No rows");
      const toolsetMap = new Map(data.toolsets.map((t) => [t.slug, t.id]));
      const inserts = rows
        .filter((r) => !r.skip)
        .map((r) => ({
          toolset_id: toolsetMap.get(r.toolset),
          tool_registry_id: r.source.id,
          name: r.tool_name,
          agent_code: r.source.tool_name,
          description: r.source.description ?? "",
          input_schema: r.source.tool_schema?.function?.parameters ?? {},
          edge_function_url: null,
          is_ga: false,
          requires_auth_scope: null,
          deprecated: false,
        }));
      const { error } = await supabase.from("mcp_tools").insert(inserts as any);
      if (error) throw error;
      return inserts.length;
    },
    onSuccess: (count) => {
      toast.success(`Migrated ${count} tools to mcp_tools`);
      qc.invalidateQueries({ queryKey: ["mcp-migrate-source"] });
      qc.invalidateQueries({ queryKey: ["mcp-overview"] });
      setStep(1);
      setRows(null);
    },
    onError: (err: any) => toast.error(err.message ?? "Migration failed"),
  });

  const stepCard = "rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5";
  const sparkleShadow = { boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" };

  return (
    <AdminMcpLayout>
      {/* Stepper */}
      <ol className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em]">
        {["Review", "Map", "Preview", "Commit"].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <li
              key={label}
              className={[
                "px-3 py-1.5 rounded-lg border",
                active
                  ? "bg-foreground text-background border-foreground"
                  : done
                    ? "border-pounamu/40 text-pounamu"
                    : "border-foreground/15 text-foreground/55",
              ].join(" ")}
            >
              {n}. {label}
            </li>
          );
        })}
      </ol>

      {/* STEP 1 — Review */}
      {step === 1 && (
        <div className={stepCard} style={sparkleShadow}>
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-foreground/55">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : !data?.registry.length ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 mx-auto text-pounamu" />
              <h3 className="font-display text-xl mt-3">All tools migrated</h3>
              <p className="text-sm text-foreground/60 mt-1">
                {data?.alreadyMigrated ?? 0} tools are already in mcp_tools. Nothing pending.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-display text-2xl text-foreground">
                    {data.registry.length} tools pending migration
                  </h2>
                  <p className="text-sm text-foreground/60 mt-1">
                    {data.alreadyMigrated} already migrated. tool_registry stays read-only as the source of truth.
                  </p>
                </div>
                <Button onClick={requestSuggestions} disabled={suggesting} className="gap-2">
                  {suggesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {rows ? "Re-run suggestions" : "Run AI suggestions"}
                </Button>
              </div>

              {!rows ? (
                <p className="text-sm text-foreground/55">
                  Click <em>Run AI suggestions</em> — one Gemini Flash batch call classifies all{" "}
                  {data.registry.length} tools at once. You can override anything before commit.
                </p>
              ) : (
                <div className="overflow-auto max-h-[60vh] rounded-lg border border-foreground/10">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white/85 backdrop-blur-md text-left text-xs uppercase tracking-[0.18em] text-foreground/55 border-b border-foreground/10">
                      <tr>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Toolset</th>
                        <th className="py-3 px-4">MCP name</th>
                        <th className="py-3 px-4 text-right">Skip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr
                          key={r.source.id}
                          className={[
                            "border-b border-foreground/5",
                            r.skip ? "opacity-40" : "",
                          ].join(" ")}
                        >
                          <td className="py-2.5 px-4">
                            <div className="font-mono text-xs">{r.source.tool_name}</div>
                            <div className="text-xs text-foreground/50 line-clamp-1">
                              {r.source.description}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 w-44">
                            <Select
                              value={r.toolset}
                              onValueChange={(v) =>
                                setRows((prev) =>
                                  prev!.map((x, i) => (i === idx ? { ...x, toolset: v } : x)),
                                )
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TOOLSET_SLUGS.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2.5 px-4 w-64">
                            <input
                              value={r.tool_name}
                              onChange={(e) =>
                                setRows((prev) =>
                                  prev!.map((x, i) =>
                                    i === idx ? { ...x, tool_name: e.target.value } : x,
                                  ),
                                )
                              }
                              className="w-full h-8 px-2 text-xs font-mono rounded border border-foreground/15 bg-white/60"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() =>
                                setRows((prev) =>
                                  prev!.map((x, i) => (i === idx ? { ...x, skip: !x.skip } : x)),
                                )
                              }
                              className={[
                                "text-xs uppercase tracking-wider px-2 py-1 rounded",
                                r.skip
                                  ? "bg-foreground/10 text-foreground"
                                  : "text-foreground/55 hover:text-foreground",
                              ].join(" ")}
                            >
                              {r.skip ? "skipped" : "skip"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {rows && (
                <div className="flex items-center justify-between mt-5">
                  <div className="text-xs text-foreground/55">
                    {rows.filter((r) => !r.skip).length} to migrate · {rows.filter((r) => r.skip).length} skipped
                  </div>
                  <Button onClick={() => setStep(3)} className="gap-2">
                    Preview <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* STEP 3 — Preview */}
      {step === 3 && rows && (
        <div className={stepCard} style={sparkleShadow}>
          <h2 className="font-display text-2xl text-foreground">Preview</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Final state before commit. Nothing has been written yet.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
            {TOOLSET_SLUGS.map((slug) => (
              <div
                key={slug}
                className="rounded-lg border border-foreground/10 bg-white/40 p-3"
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55">
                  {slug}
                </div>
                <div className="text-2xl font-display font-light mt-1">
                  {breakdown.counts[slug] ?? 0}
                </div>
              </div>
            ))}
          </div>

          {warnings.length > 0 && (
            <div className="mt-5 rounded-lg border border-kowhai/40 bg-kowhai/10 p-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <AlertTriangle className="w-4 h-4 text-kowhai" />
                <span className="font-medium">Warnings ({warnings.length})</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                {warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to review
            </Button>
            <Button onClick={() => setStep(4)} className="gap-2">
              Continue to commit <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 — Commit */}
      {step === 4 && rows && (
        <div className={stepCard} style={sparkleShadow}>
          <h2 className="font-display text-2xl text-foreground">Commit migration</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Inserts {rows.filter((r) => !r.skip).length} rows into mcp_tools. tool_registry stays untouched.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button
              onClick={() => commit.mutate()}
              disabled={commit.isPending}
              className="gap-2 bg-pounamu text-white hover:bg-pounamu/90"
            >
              {commit.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Run migration
            </Button>
          </div>
        </div>
      )}
    </AdminMcpLayout>
  );
}
