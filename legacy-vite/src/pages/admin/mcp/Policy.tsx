import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

type Stage = "kahu_pre" | "ta_inflight" | "mana_post";
type Rule = {
  id: string;
  rule_code: string;
  rule_type: string;
  applies_to_toolset: string[] | null;
  applies_to_tool: string[] | null;
  rule_logic: any;
  enforcement_stage: Stage;
  is_active: boolean;
  reasoning_maori: string | null;
};

const STAGE_LABEL: Record<Stage, string> = {
  kahu_pre: "Kahu (pre-flight)",
  ta_inflight: "Tā (in-flight)",
  mana_post: "Mana (post-flight)",
};

export default function McpPolicyPage() {
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-policy-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_policy_rules")
        .select("*")
        .order("enforcement_stage")
        .order("rule_code");
      if (error) throw error;
      return data as Rule[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("mcp_policy_rules")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mcp-policy-rules"] });
      toast.success("Rule updated");
    },
    onError: () => toast.error("Could not update rule"),
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<Rule> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await supabase.from("mcp_policy_rules").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mcp-policy-rules"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const grouped: Record<Stage, Rule[]> = {
    kahu_pre: [],
    ta_inflight: [],
    mana_post: [],
  };
  (data ?? []).forEach((r) => grouped[r.enforcement_stage]?.push(r));

  const open = data?.find((r) => r.id === openId) ?? null;

  return (
    <AdminMcpLayout>
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">Mana Trust Layer</p>
          <h2 className="font-display text-2xl text-foreground mt-0.5">Policy rules</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Runtime guardrails enforced by the MCP router across the three stages.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center p-10 text-foreground/55">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="kahu_pre">
          <TabsList>
            {(Object.keys(STAGE_LABEL) as Stage[]).map((s) => (
              <TabsTrigger key={s} value={s}>
                {STAGE_LABEL[s]} · {grouped[s].length}
              </TabsTrigger>
            ))}
          </TabsList>
          {(Object.keys(STAGE_LABEL) as Stage[]).map((s) => (
            <TabsContent key={s} value={s} className="mt-4 space-y-2">
              {grouped[s].length === 0 && (
                <p className="text-sm text-foreground/55 px-2">No rules in this stage.</p>
              )}
              {grouped[s].map((r) => (
                <div
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  className="cursor-pointer rounded-xl bg-white/55 backdrop-blur-md border border-foreground/10 p-4 flex items-start justify-between gap-4 hover:bg-white/70 transition"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.12)" }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-pounamu" />
                      <span className="font-mono text-sm">{r.rule_code}</span>
                      <span className="text-[10px] uppercase tracking-wider text-foreground/45">
                        {r.rule_type}
                      </span>
                    </div>
                    {r.reasoning_maori && (
                      <p className="text-xs text-foreground/65 mt-1.5 line-clamp-2">
                        {r.reasoning_maori}
                      </p>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={r.is_active}
                      onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono text-base">{open.rule_code}</SheetTitle>
                <SheetDescription>
                  {open.rule_type} · {STAGE_LABEL[open.enforcement_stage]}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-4">
                <div>
                  <Label>Reasoning (te reo / tikanga)</Label>
                  <Textarea
                    defaultValue={open.reasoning_maori ?? ""}
                    rows={3}
                    onBlur={(e) =>
                      update.mutate({ id: open.id, reasoning_maori: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Applies to toolsets (comma-separated, blank = all)</Label>
                  <Input
                    defaultValue={(open.applies_to_toolset ?? []).join(", ")}
                    onBlur={(e) =>
                      update.mutate({
                        id: open.id,
                        applies_to_toolset: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>rule_logic (JSON)</Label>
                  <Textarea
                    defaultValue={JSON.stringify(open.rule_logic ?? {}, null, 2)}
                    rows={10}
                    className="font-mono text-xs"
                    onBlur={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        update.mutate({ id: open.id, rule_logic: parsed });
                      } catch {
                        toast.error("Invalid JSON — not saved");
                      }
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.info("Test simulator — wire to mcp-router test endpoint in Claude Code")
                  }
                >
                  Test rule against sample payload
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminMcpLayout>
  );
}
