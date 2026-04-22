import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
      style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
    >
      <div className="text-xs uppercase tracking-[0.18em] text-foreground/55">{label}</div>
      <div className="mt-2 text-3xl font-display font-light text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-foreground/50">{hint}</div>}
    </div>
  );
}

export default function McpOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["mcp-overview"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [tools, toolsets, calls, errors] = await Promise.all([
        supabase.from("mcp_tools").select("id", { count: "exact", head: true }),
        supabase.from("mcp_toolsets").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("mcp_tool_calls").select("id", { count: "exact", head: true }).gte("called_at", since),
        supabase.from("mcp_tool_calls").select("id", { count: "exact", head: true }).gte("called_at", since).eq("status", "error"),
      ]);
      const callCount = calls.count ?? 0;
      const errorCount = errors.count ?? 0;
      const errorRate = callCount > 0 ? Math.round((errorCount / callCount) * 1000) / 10 : 0;
      return {
        tools: tools.count ?? 0,
        toolsets: toolsets.count ?? 0,
        calls: callCount,
        errorRate,
      };
    },
  });

  return (
    <AdminMcpLayout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total tools" value={isLoading ? "—" : data?.tools ?? 0} />
        <StatCard label="Active toolsets" value={isLoading ? "—" : data?.toolsets ?? 0} />
        <StatCard label="Calls today" value={isLoading ? "—" : data?.calls ?? 0} hint="last 24h" />
        <StatCard
          label="Error rate"
          value={isLoading ? "—" : `${data?.errorRate ?? 0}%`}
          hint="last 24h"
        />
      </div>

      <div
        className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5 text-sm text-foreground/70"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
      >
        <p>
          The MCP router edge function lives at{" "}
          <code className="font-mono text-foreground">supabase/functions/mcp-router/</code>. Auth
          validation, scope checks, and retry behaviour are stubbed for finishing in Claude Code —
          look for <code className="font-mono">TODO</code> markers.
        </p>
      </div>
    </AdminMcpLayout>
  );
}
