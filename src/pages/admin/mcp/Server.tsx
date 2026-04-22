import { useQuery } from "@tanstack/react-query";
import { Loader2, Server, Download, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

export default function McpServerPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["mcp-server-status"],
    queryFn: async () => {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const [tools, lastCall] = await Promise.all([
        supabase
          .from("mcp_tools")
          .select("id, name, agent_code, description, input_schema, requires_auth_scope, deprecated, mcp_toolsets(slug)")
          .eq("deprecated", false),
        supabase
          .from("mcp_tool_calls")
          .select("called_at")
          .gte("called_at", since)
          .order("called_at", { ascending: false })
          .limit(1),
      ]);
      return {
        tools: tools.data ?? [],
        lastCall: lastCall.data?.[0]?.called_at ?? null,
      };
    },
  });

  const exportToolsList = () => {
    if (!data) return;
    const tools = data.tools.map((t: any) => ({
      name: t.name,
      description: t.description,
      toolset: t.mcp_toolsets?.slug,
      requires_auth_scope: t.requires_auth_scope,
      inputSchema: t.input_schema,
    }));
    const blob = new Blob([JSON.stringify({ tools }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcp-tools.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${tools.length} tool definitions`);
  };

  return (
    <AdminMcpLayout>
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">Runtime</p>
        <h2 className="font-display text-2xl mt-0.5">Server health</h2>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center p-10 text-foreground/55">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
            style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-foreground/55">
              <Heart className="w-3.5 h-3.5 text-pounamu" /> Last router call
            </div>
            <div className="mt-2 text-base font-display">
              {data?.lastCall ? new Date(data.lastCall).toLocaleString() : "no traffic in last hour"}
            </div>
          </div>
          <div
            className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
            style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-foreground/55">
              <Server className="w-3.5 h-3.5" /> Deployed function
            </div>
            <div className="mt-2 font-mono text-sm">supabase/functions/mcp-router</div>
            <div className="text-xs text-foreground/55 mt-1">
              Scaffold v0.1 — finish 10 TODOs in Claude Code.
            </div>
          </div>
          <div
            className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
            style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
          >
            <div className="text-xs uppercase tracking-[0.18em] text-foreground/55">
              GA tools available
            </div>
            <div className="mt-2 text-3xl font-display font-light">
              {data?.tools.length ?? 0}
            </div>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
      >
        <h3 className="font-display text-lg">Regenerate tool definitions</h3>
        <p className="text-sm text-foreground/60 mt-1 max-w-xl">
          Exports all non-deprecated <code className="font-mono">mcp_tools</code> as an
          MCP-spec JSON file you can serve at <code className="font-mono">/mcp/tools/list</code>.
        </p>
        <Button onClick={exportToolsList} className="mt-4 gap-2">
          <Download className="w-4 h-4" /> Download mcp-tools.json
        </Button>
      </div>
    </AdminMcpLayout>
  );
}
