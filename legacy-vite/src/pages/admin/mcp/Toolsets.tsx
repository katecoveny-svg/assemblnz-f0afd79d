import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

type Toolset = {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  industry_pack: string | null;
  is_active: boolean;
};

export default function McpToolsetsPage() {
  const qc = useQueryClient();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-toolsets-with-counts"],
    queryFn: async () => {
      const [{ data: toolsets }, { data: tools }] = await Promise.all([
        supabase.from("mcp_toolsets").select("*").order("slug"),
        supabase.from("mcp_tools").select("id, toolset_id, name, agent_code, is_ga"),
      ]);
      const counts = new Map<string, number>();
      const grouped = new Map<string, typeof tools>();
      (tools ?? []).forEach((t) => {
        counts.set(t.toolset_id, (counts.get(t.toolset_id) ?? 0) + 1);
        const arr = grouped.get(t.toolset_id) ?? [];
        arr.push(t);
        grouped.set(t.toolset_id, arr);
      });
      return {
        toolsets: (toolsets ?? []) as Toolset[],
        counts,
        grouped,
      };
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("mcp_toolsets").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mcp-toolsets-with-counts"] });
      toast.success("Toolset updated");
    },
    onError: () => toast.error("Could not update toolset"),
  });

  const open = data?.toolsets.find((t) => t.slug === openSlug) ?? null;
  const openTools = open ? data?.grouped.get(open.id) ?? [] : [];

  return (
    <AdminMcpLayout>
      <div
        className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 overflow-hidden"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
      >
        {isLoading ? (
          <div className="p-8 flex items-center justify-center text-foreground/55">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-foreground/55 border-b border-foreground/10">
                <th className="py-3 px-5 font-medium">Slug</th>
                <th className="py-3 px-5 font-medium">Display name</th>
                <th className="py-3 px-5 font-medium">Tool count</th>
                <th className="py-3 px-5 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {data?.toolsets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setOpenSlug(t.slug)}
                  className="border-b border-foreground/5 hover:bg-foreground/[0.03] cursor-pointer"
                >
                  <td className="py-3 px-5 font-mono">{t.slug}</td>
                  <td className="py-3 px-5">{t.display_name}</td>
                  <td className="py-3 px-5">{data.counts.get(t.id) ?? 0}</td>
                  <td className="py-3 px-5" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={t.is_active}
                      onCheckedChange={(v) => toggle.mutate({ id: t.id, is_active: v })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenSlug(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{open?.display_name}</SheetTitle>
            <p className="text-sm text-foreground/65">{open?.description ?? "No description yet."}</p>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-foreground/55">
              Tools in this toolset
            </div>
            {openTools.length === 0 ? (
              <p className="text-sm text-foreground/55">No tools registered yet.</p>
            ) : (
              openTools.map((t: any) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-mono">{t.name}</div>
                    <div className="text-xs text-foreground/55">{t.agent_code}</div>
                  </div>
                  <span
                    className={
                      "text-[11px] uppercase tracking-wider " +
                      (t.is_ga ? "text-pounamu" : "text-foreground/45")
                    }
                  >
                    {t.is_ga ? "GA" : "beta"}
                  </span>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </AdminMcpLayout>
  );
}
