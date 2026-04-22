import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Download, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

type Tier = {
  id: string;
  tier_name: string;
  monthly_price_nzd: number;
  included_calls_per_month: number | null;
  per_call_overage_nzd: number;
  included_toolsets: string[];
};

export default function McpBillingPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-billing"],
    queryFn: async () => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const [tiers, calls, tenants, orgToolsets] = await Promise.all([
        supabase.from("mcp_subscription_tiers").select("*"),
        supabase
          .from("mcp_tool_calls")
          .select("org_id, status")
          .gte("called_at", start.toISOString()),
        supabase.from("tenants").select("id, name"),
        supabase.from("mcp_org_toolsets").select("org_id, tier"),
      ]);
      const tierMap = new Map((tiers.data ?? []).map((t: any) => [t.tier_name, t as Tier]));
      const orgTier = new Map(
        (orgToolsets.data ?? []).map((o: any) => [o.org_id, o.tier ?? "starter"]),
      );
      const callsPerOrg = new Map<string, number>();
      (calls.data ?? []).forEach((c: any) => {
        if (!c.org_id) return;
        callsPerOrg.set(c.org_id, (callsPerOrg.get(c.org_id) ?? 0) + 1);
      });
      const rows = (tenants.data ?? []).map((t: any) => {
        const tierName = orgTier.get(t.id) ?? "starter";
        const tier = tierMap.get(tierName);
        const used = callsPerOrg.get(t.id) ?? 0;
        const included = tier?.included_calls_per_month ?? null;
        const overageCalls = included == null ? 0 : Math.max(0, used - included);
        const overageNzd = overageCalls * (tier?.per_call_overage_nzd ?? 0);
        return {
          id: t.id,
          name: t.name,
          tier: tierName,
          used,
          included,
          overageCalls,
          overageNzd,
          monthly: tier?.monthly_price_nzd ?? 0,
          total: (tier?.monthly_price_nzd ?? 0) + overageNzd,
        };
      });
      return rows;
    },
  });

  const totals = useMemo(() => {
    if (!data) return { calls: 0, overage: 0, total: 0 };
    return data.reduce(
      (acc, r) => ({
        calls: acc.calls + r.used,
        overage: acc.overage + r.overageNzd,
        total: acc.total + r.total,
      }),
      { calls: 0, overage: 0, total: 0 },
    );
  }, [data]);

  const snapshot = useMutation({
    mutationFn: async () => {
      const month = new Date();
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("billing_snapshots").insert({
        snapshot_month: monthStr,
        tenant_count: data?.length ?? 0,
        total_calls: totals.calls,
        total_overage_nzd: totals.overage,
        payload: data ?? [],
        created_by: u.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mcp-billing"] });
      toast.success("Month-end snapshot saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Snapshot failed"),
  });

  const exportCsv = () => {
    if (!data) return;
    const csv = [
      "tenant,tier,calls_used,included,overage_calls,overage_nzd,monthly_nzd,total_nzd",
      ...data.map(
        (r) =>
          `"${r.name}",${r.tier},${r.used},${r.included ?? "unlimited"},${r.overageCalls},${r.overageNzd.toFixed(2)},${r.monthly.toFixed(2)},${r.total.toFixed(2)}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcp-billing-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminMcpLayout>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">
            Month to date
          </p>
          <h2 className="font-display text-2xl mt-0.5">Billing</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Manual Stripe reconciliation — webhook automation comes later.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            onClick={() => snapshot.mutate()}
            disabled={snapshot.isPending}
            className="gap-2"
          >
            {snapshot.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            Month-end close
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total calls (MTD)", value: totals.calls.toLocaleString() },
          { label: "Total overage", value: `$${totals.overage.toFixed(2)}` },
          { label: "Total billable", value: `$${totals.total.toFixed(2)}` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 p-5"
            style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
          >
            <div className="text-xs uppercase tracking-[0.18em] text-foreground/55">
              {s.label}
            </div>
            <div className="mt-2 text-3xl font-display font-light">{s.value}</div>
          </div>
        ))}
      </div>

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
            <thead className="text-left text-xs uppercase tracking-[0.18em] text-foreground/55 border-b border-foreground/10">
              <tr>
                <th className="py-3 px-5 font-medium">Tenant</th>
                <th className="py-3 px-5 font-medium">Tier</th>
                <th className="py-3 px-5 font-medium text-right">Calls</th>
                <th className="py-3 px-5 font-medium text-right">Included</th>
                <th className="py-3 px-5 font-medium text-right">Overage NZD</th>
                <th className="py-3 px-5 font-medium text-right">Total NZD</th>
              </tr>
            </thead>
            <tbody>
              {data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-foreground/55">
                    No tenants billed yet this month.
                  </td>
                </tr>
              )}
              {data?.map((r) => (
                <tr key={r.id} className="border-b border-foreground/5">
                  <td className="py-2.5 px-5">{r.name}</td>
                  <td className="py-2.5 px-5 text-xs uppercase tracking-wider">{r.tier}</td>
                  <td className="py-2.5 px-5 text-right">{r.used.toLocaleString()}</td>
                  <td className="py-2.5 px-5 text-right text-foreground/55">
                    {r.included ?? "∞"}
                  </td>
                  <td className="py-2.5 px-5 text-right">${r.overageNzd.toFixed(2)}</td>
                  <td className="py-2.5 px-5 text-right font-medium">
                    ${r.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminMcpLayout>
  );
}
