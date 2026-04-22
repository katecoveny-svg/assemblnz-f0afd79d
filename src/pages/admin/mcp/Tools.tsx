import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

type ToolForm = {
  name: string;
  toolset_id: string;
  description: string;
  agent_code: string;
  edge_function_url: string;
  input_schema_json: string;
  is_ga: boolean;
  requires_auth_scope: string;
};

const EMPTY: ToolForm = {
  name: "",
  toolset_id: "",
  description: "",
  agent_code: "",
  edge_function_url: "",
  input_schema_json: "{}",
  is_ga: false,
  requires_auth_scope: "",
};

export default function McpToolsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ToolForm>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-tools"],
    queryFn: async () => {
      const [tools, toolsets] = await Promise.all([
        supabase.from("mcp_tools").select("*").order("name"),
        supabase.from("mcp_toolsets").select("id, slug, display_name").order("slug"),
      ]);
      return { tools: tools.data ?? [], toolsets: toolsets.data ?? [] };
    },
  });

  const create = useMutation({
    mutationFn: async (input: ToolForm) => {
      let parsedSchema: unknown = {};
      try {
        parsedSchema = JSON.parse(input.input_schema_json || "{}");
      } catch {
        throw new Error("Input schema must be valid JSON");
      }
      const { error } = await supabase.from("mcp_tools").insert({
        name: input.name.trim(),
        toolset_id: input.toolset_id,
        description: input.description || null,
        agent_code: input.agent_code || null,
        edge_function_url: input.edge_function_url || null,
        input_schema_json: parsedSchema as any,
        is_ga: input.is_ga,
        requires_auth_scope: input.requires_auth_scope || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tool created");
      setOpen(false);
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["mcp-tools"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mcp_tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tool deleted");
      qc.invalidateQueries({ queryKey: ["mcp-tools"] });
    },
  });

  return (
    <AdminMcpLayout>
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/65">
          Register tools and route them to a Supabase edge function.
        </p>
        <Button onClick={() => setOpen(true)} className="bg-kowhai text-foreground hover:bg-kowhai/90">
          <Plus className="w-4 h-4 mr-2" />
          New tool
        </Button>
      </div>

      <div
        className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 overflow-hidden"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
      >
        {isLoading ? (
          <div className="p-8 flex items-center justify-center text-foreground/55">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : data?.tools.length === 0 ? (
          <div className="p-10 text-center text-sm text-foreground/55">
            No tools yet. Click <span className="font-medium text-foreground">New tool</span> to add one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-foreground/55 border-b border-foreground/10">
                <th className="py-3 px-5 font-medium">Name</th>
                <th className="py-3 px-5 font-medium">Agent</th>
                <th className="py-3 px-5 font-medium">Scope</th>
                <th className="py-3 px-5 font-medium">GA</th>
                <th className="py-3 px-5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {data?.tools.map((t: any) => (
                <tr key={t.id} className="border-b border-foreground/5">
                  <td className="py-3 px-5 font-mono">{t.name}</td>
                  <td className="py-3 px-5">{t.agent_code ?? "—"}</td>
                  <td className="py-3 px-5 font-mono text-xs">{t.requires_auth_scope ?? "—"}</td>
                  <td className="py-3 px-5">{t.is_ga ? "✓" : "—"}</td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => remove.mutate(t.id)}
                      className="text-foreground/45 hover:text-destructive transition"
                      aria-label={`Delete ${t.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New tool</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="aura_booking_check"
                className="mt-1.5 font-mono"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">Toolset</label>
              <Select
                value={form.toolset_id}
                onValueChange={(v) => setForm({ ...form, toolset_id: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pick a toolset" />
                </SelectTrigger>
                <SelectContent>
                  {data?.toolsets.map((ts: any) => (
                    <SelectItem key={ts.id} value={ts.id}>
                      {ts.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">
                Description
              </label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">
                  Agent code
                </label>
                <Input
                  value={form.agent_code}
                  onChange={(e) => setForm({ ...form, agent_code: e.target.value })}
                  placeholder="AURA"
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">
                  Auth scope
                </label>
                <Input
                  value={form.requires_auth_scope}
                  onChange={(e) => setForm({ ...form, requires_auth_scope: e.target.value })}
                  placeholder="manaaki:read"
                  className="mt-1.5 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">
                Edge function URL
              </label>
              <Input
                value={form.edge_function_url}
                onChange={(e) => setForm({ ...form, edge_function_url: e.target.value })}
                placeholder="https://…/functions/v1/aura-booking-check"
                className="mt-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-foreground/55">
                Input schema (JSON)
              </label>
              <Textarea
                rows={5}
                value={form.input_schema_json}
                onChange={(e) => setForm({ ...form, input_schema_json: e.target.value })}
                className="mt-1.5 font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2">
              <span className="text-sm">Generally available</span>
              <Switch checked={form.is_ga} onCheckedChange={(v) => setForm({ ...form, is_ga: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => create.mutate(form)}
              disabled={!form.name || !form.toolset_id || create.isPending}
              className="bg-kowhai text-foreground hover:bg-kowhai/90"
            >
              {create.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create tool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminMcpLayout>
  );
}
