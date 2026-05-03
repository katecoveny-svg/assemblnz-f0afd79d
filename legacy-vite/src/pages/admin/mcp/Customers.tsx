import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

export default function McpCustomersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ org_id: "", toolset_slug: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-org-toolsets"],
    queryFn: async () => {
      const [orgs, toolsets] = await Promise.all([
        supabase.from("mcp_org_toolsets").select("*").order("org_id"),
        supabase.from("mcp_toolsets").select("slug, display_name").order("slug"),
      ]);
      return { rows: orgs.data ?? [], toolsets: toolsets.data ?? [] };
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    (data?.rows ?? []).forEach((r: any) => {
      const arr = map.get(r.org_id) ?? [];
      arr.push(r);
      map.set(r.org_id, arr);
    });
    return Array.from(map.entries());
  }, [data?.rows]);

  const toggle = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("mcp_org_toolsets").update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mcp-org-toolsets"] }),
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!form.org_id || !form.toolset_slug) throw new Error("Org ID and toolset required");
      const { error } = await supabase.from("mcp_org_toolsets").insert({
        org_id: form.org_id.trim(),
        toolset_slug: form.toolset_slug,
        enabled: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer toolset enabled");
      setOpen(false);
      setForm({ org_id: "", toolset_slug: "" });
      qc.invalidateQueries({ queryKey: ["mcp-org-toolsets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminMcpLayout>
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/65">
          Manually enable or disable toolsets per customer org.
        </p>
        <Button onClick={() => setOpen(true)} className="bg-kowhai text-foreground hover:bg-kowhai/90">
          <Plus className="w-4 h-4 mr-2" />
          Enable toolset
        </Button>
      </div>

      <div
        className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
      >
        {isLoading ? (
          <div className="p-6 flex items-center justify-center text-foreground/55">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-foreground/55 py-8 text-center">No customer toolsets configured.</p>
        ) : (
          <div className="space-y-5">
            {grouped.map(([orgId, rows]) => (
              <div key={orgId}>
                <div className="text-xs uppercase tracking-[0.18em] text-foreground/55 mb-2 font-mono">
                  {orgId}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rows.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2 text-sm"
                    >
                      <span className="font-mono">{r.toolset_slug}</span>
                      <Switch
                        checked={r.enabled}
                        onCheckedChange={(v) => toggle.mutate({ id: r.id, enabled: v })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable toolset for an org</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">Org ID (UUID)</label>
              <Input
                value={form.org_id}
                onChange={(e) => setForm({ ...form, org_id: e.target.value })}
                placeholder="00000000-0000-0000-0000-…"
                className="mt-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">Toolset</label>
              <select
                className="mt-1.5 w-full h-10 rounded-md border border-foreground/15 bg-background px-3 text-sm"
                value={form.toolset_slug}
                onChange={(e) => setForm({ ...form, toolset_slug: e.target.value })}
              >
                <option value="">Pick…</option>
                {(data?.toolsets ?? []).map((t: any) => (
                  <option key={t.slug} value={t.slug}>{t.display_name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => add.mutate()}
              disabled={add.isPending}
              className="bg-kowhai text-foreground hover:bg-kowhai/90"
            >
              {add.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminMcpLayout>
  );
}
