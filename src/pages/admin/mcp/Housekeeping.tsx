import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, GitBranch, Database, Trash2, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

const DUPLICATE_ROUTERS = [
  { name: "iho", category: "iho_router" },
  { name: "iho-router", category: "iho_router" },
  { name: "iho-intent-router", category: "iho_router" },
];

export default function McpHousekeepingPage() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: decisions } = useQuery({
    queryKey: ["housekeeping-decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housekeeping_decisions")
        .select("*")
        .order("decided_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const decide = useMutation({
    mutationFn: async ({
      category,
      item_name,
      decision,
      note,
    }: {
      category: string;
      item_name: string;
      decision: string;
      note: string;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("housekeeping_decisions").insert({
        category,
        item_name,
        decision,
        decided_by: u.user?.id ?? null,
        notes: note,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["housekeeping-decisions"] });
      toast.success("Decision recorded");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const exportHangaPlan = () => {
    const csv = [
      "from_table,to_table,strategy",
      "hanga_consents,waihanga_consent_checks,backfill+verify",
      "hanga_inspections,waihanga_inspections,backfill+verify",
      "hanga_subbies,waihanga_subbie_compliance,column-map needed",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hanga-to-waihanga-plan.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Migration plan exported");
  };

  const decidedFor = (category: string, item: string) =>
    decisions?.find((d: any) => d.category === category && d.item_name === item);

  const Section = ({
    icon: Icon,
    title,
    subtitle,
    children,
  }: any) => (
    <div
      className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
      style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <Icon className="w-5 h-5 text-pounamu mt-0.5" />
        <div>
          <h3 className="font-display text-lg">{title}</h3>
          <p className="text-sm text-foreground/60">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <AdminMcpLayout>
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">
          Audit · Issues #3 + #6
        </p>
        <h2 className="font-display text-2xl mt-0.5">Housekeeping</h2>
        <p className="text-sm text-foreground/60 mt-1">
          Decisions only — nothing auto-deletes. You press the button.
        </p>
      </header>

      <Section
        icon={GitBranch}
        title="Duplicate routers"
        subtitle="Three iho-style routers detected. Mark one canonical."
      >
        <div className="space-y-2">
          {DUPLICATE_ROUTERS.map((r) => {
            const decided = decidedFor("duplicate_router", r.name);
            return (
              <div
                key={r.name}
                className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-sm">{r.name}</span>
                  {decided && (
                    <span className="text-[11px] uppercase tracking-wider text-pounamu inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {decided.decision}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={notes[r.name] ?? ""}
                    onChange={(e) => setNotes((p) => ({ ...p, [r.name]: e.target.value }))}
                    placeholder="Note"
                    className="h-8 w-40 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      decide.mutate({
                        category: "duplicate_router",
                        item_name: r.name,
                        decision: "canonical",
                        note: notes[r.name] ?? "",
                      })
                    }
                  >
                    Mark canonical
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      decide.mutate({
                        category: "duplicate_router",
                        item_name: r.name,
                        decision: "deprecate",
                        note: notes[r.name] ?? "",
                      })
                    }
                  >
                    Deprecate
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        icon={Database}
        title="Legacy hanga_* vs waihanga_* tables"
        subtitle="Export a migration plan; no automatic data move."
      >
        <Button onClick={exportHangaPlan} className="gap-2">
          <Download className="w-4 h-4" /> Export migration plan CSV
        </Button>
      </Section>

      <Section
        icon={Trash2}
        title="Unused agent_triggers"
        subtitle="Empty table; today's symbiotic flows live in workflow_templates."
      >
        <Button
          variant="outline"
          onClick={() =>
            decide.mutate({
              category: "unused_table",
              item_name: "agent_triggers",
              decision: "deprecate",
              note: "Replaced by workflow_templates",
            })
          }
        >
          Mark agent_triggers for deprecation
        </Button>
      </Section>
    </AdminMcpLayout>
  );
}
