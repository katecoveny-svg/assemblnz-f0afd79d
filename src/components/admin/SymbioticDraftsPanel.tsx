import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, Sparkles, X } from "lucide-react";

interface DraftRow {
  id: string;
  status: string | null;
  current_step: number | null;
  steps_log: any;
  started_at: string | null;
  workflow_id: string | null;
  template_name?: string;
}

/**
 * SymbioticDraftsPanel
 * Shows pending symbiotic workflow drafts (e.g. Manaaki booking → Auaha thank-you)
 * waiting for human approval. Draft-only — approve/dismiss never sends to a customer.
 */
export default function SymbioticDraftsPanel() {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: execs } = await supabase
      .from("workflow_executions")
      .select("id, status, current_step, steps_log, started_at, workflow_id")
      .eq("status", "pending_approval")
      .order("started_at", { ascending: false })
      .limit(10);

    const ids = (execs || []).map((e) => e.workflow_id).filter(Boolean) as string[];
    let nameMap: Record<string, string> = {};
    if (ids.length) {
      const { data: tmpls } = await supabase
        .from("workflow_templates")
        .select("id, name")
        .in("id", ids);
      nameMap = Object.fromEntries((tmpls || []).map((t) => [t.id, t.name]));
    }

    setDrafts(
      (execs || []).map((e) => ({
        ...e,
        template_name: e.workflow_id ? nameMap[e.workflow_id] : "Symbiotic draft",
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("symbiotic-drafts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workflow_executions" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const approve = async (id: string) => {
    await supabase
      .from("workflow_executions")
      .update({ status: "approved", completed_at: new Date().toISOString() })
      .eq("id", id);
    load();
  };

  const dismiss = async (id: string) => {
    await supabase
      .from("workflow_executions")
      .update({ status: "dismissed", completed_at: new Date().toISOString() })
      .eq("id", id);
    load();
  };

  return (
    <section className="rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/70 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Symbiotic Drafts · awaiting human approval
        </h3>
        <button
          onClick={load}
          className="text-xs text-foreground/60 hover:text-foreground"
        >
          Refresh
        </button>
      </header>

      {loading && <p className="text-sm text-foreground/50">Loading…</p>}

      {!loading && drafts.length === 0 && (
        <div className="text-sm text-foreground/50 italic">
          No pending symbiotic drafts. New ones appear here automatically when (e.g.) a Manaaki booking lands.
        </div>
      )}

      <ul className="space-y-3">
        {drafts.map((d) => {
          const draftStep = Array.isArray(d.steps_log)
            ? d.steps_log.find((s: any) => s.status === "draft_ready")
            : null;
          const ctxStep = Array.isArray(d.steps_log)
            ? d.steps_log.find((s: any) => s.status === "completed")
            : null;
          return (
            <li
              key={d.id}
              className="rounded-xl border border-foreground/10 bg-background/40 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {d.template_name}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-foreground/40">
                  {d.started_at
                    ? new Date(d.started_at).toLocaleString("en-NZ")
                    : "—"}
                </span>
              </div>

              {ctxStep?.guest_name && (
                <p className="text-xs text-foreground/60 mb-1">
                  Trigger: {ctxStep.guest_name}
                  {ctxStep.venue_ref ? ` @ ${ctxStep.venue_ref}` : ""}
                </p>
              )}

              {draftStep?.draft && (
                <blockquote className="text-sm text-foreground/80 border-l-2 border-foreground/20 pl-3 my-2 italic">
                  "{draftStep.draft}"
                </blockquote>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => approve(d.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-80 inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => dismiss(d.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-foreground/20 hover:bg-foreground/5 inline-flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Dismiss
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
