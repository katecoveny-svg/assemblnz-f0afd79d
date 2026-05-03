import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

const PAGE_SIZE = 50;

export default function McpLogsPage() {
  const [status, setStatus] = useState<string>("all");
  const [toolset, setToolset] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data: toolsets } = useQuery({
    queryKey: ["toolsets-for-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("mcp_toolsets").select("slug").order("slug");
      return data ?? [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-logs", status, toolset, page],
    queryFn: async () => {
      let q = supabase
        .from("mcp_tool_calls")
        .select("*", { count: "exact" })
        .order("called_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (status !== "all") q = q.eq("status", status);
      if (toolset !== "all") q = q.eq("toolset_slug", toolset);
      const { data, count } = await q;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)),
    [data?.count],
  );

  function exportCsv() {
    if (!data?.rows.length) return;
    const headers = ["called_at", "tool_name", "toolset_slug", "status", "duration_ms", "error_message", "org_id", "user_id"];
    const csv = [
      headers.join(","),
      ...data.rows.map((r: any) =>
        headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcp-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminMcpLayout>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-foreground/55 mb-1.5">Status</div>
          <Select value={status} onValueChange={(v) => { setPage(0); setStatus(v); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-foreground/55 mb-1.5">Toolset</div>
          <Select value={toolset} onValueChange={(v) => { setPage(0); setToolset(v); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {(toolsets ?? []).map((t: any) => (
                <SelectItem key={t.slug} value={t.slug}>{t.slug}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={exportCsv} disabled={!data?.rows.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div
        className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 overflow-hidden"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
      >
        {isLoading ? (
          <div className="p-8 flex items-center justify-center text-foreground/55">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : data?.rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-foreground/55">No calls yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-foreground/55 border-b border-foreground/10">
                <th className="py-3 px-5 font-medium">When</th>
                <th className="py-3 px-5 font-medium">Tool</th>
                <th className="py-3 px-5 font-medium">Toolset</th>
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium">Duration</th>
                <th className="py-3 px-5 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((r: any) => (
                <tr key={r.id} className="border-b border-foreground/5">
                  <td className="py-2.5 px-5 text-xs text-foreground/65">
                    {new Date(r.called_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-5 font-mono text-xs">{r.tool_name}</td>
                  <td className="py-2.5 px-5 font-mono text-xs">{r.toolset_slug ?? "—"}</td>
                  <td className="py-2.5 px-5 text-xs">
                    <span
                      className={
                        r.status === "success"
                          ? "text-pounamu"
                          : r.status === "denied"
                          ? "text-kowhai"
                          : "text-destructive"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-5 text-xs">{r.duration_ms ?? "—"} ms</td>
                  <td className="py-2.5 px-5 text-xs text-foreground/65 truncate max-w-[260px]">
                    {r.error_message ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-foreground/55">
        <span>{data?.count ?? 0} total calls</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Previous
          </Button>
          <span>Page {page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </AdminMcpLayout>
  );
}
