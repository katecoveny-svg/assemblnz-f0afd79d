import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Activity, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface HealthCheck {
  id: string;
  checked_at: string;
  service_name: string;
  status: string;
  response_time_ms: number | null;
  error_message: string | null;
}

interface ServiceSummary {
  name: string;
  label: string;
  lastStatus: string;
  lastChecked: string;
  avgResponseMs: number;
  uptimePercent: number;
  recentChecks: HealthCheck[];
}

const SERVICE_LABELS: Record<string, string> = {
  assembl_website: "Assembl Website",
  supabase_api: "Database API",
  chat_function: "Chat Engine",
  stitch_generate: "Image Generation",
  elevenlabs_api: "Voice Engine",
  stripe_api: "Payments",
  tnz_api: "SMS (TNZ)",
  lovable_ai_gateway: "AI Gateway",
  open_meteo_weather: "Weather (Open-Meteo)",
  nz_fuel_prices: "Fuel Prices (MBIE)",
  mapbox_routes: "Routes (MapBox)",
};

export default function AdminHealthDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = useCallback(async () => {
    const { data } = await supabase
      .from("health_checks")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(500);

    if (!data) return;

    const grouped: Record<string, HealthCheck[]> = {};
    data.forEach((row: any) => {
      if (!grouped[row.service_name]) grouped[row.service_name] = [];
      grouped[row.service_name].push(row);
    });

    const summaries: ServiceSummary[] = Object.entries(SERVICE_LABELS).map(([key, label]) => {
      const checks = grouped[key] || [];
      const okCount = checks.filter((c) => c.status === "ok").length;
      const total = checks.length;
      const avgMs = total > 0 ? Math.round(checks.reduce((s, c) => s + (c.response_time_ms || 0), 0) / total) : 0;

      return {
        name: key,
        label,
        lastStatus: checks[0]?.status || "unknown",
        lastChecked: checks[0]?.checked_at || "",
        avgResponseMs: avgMs,
        uptimePercent: total > 0 ? Math.round((okCount / total) * 100 * 10) / 10 : 100,
        recentChecks: checks.slice(0, 20),
      };
    });

    setServices(summaries);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin");
      return;
    }
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, [authLoading, user, navigate, fetchHealthData]);

  const triggerManualCheck = async () => {
    setRefreshing(true);
    try {
      await supabase.functions.invoke("health-check");
      await new Promise((r) => setTimeout(r, 2000));
      await fetchHealthData();
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const allOk = services.every((s) => s.lastStatus === "ok");

  return (
    <AdminShell
      title="System Health"
      subtitle={allOk ? "All systems operational" : "Issues detected"}
      icon={<Activity className="w-5 h-5 text-primary" />}
      backTo="/admin/dashboard"
      actions={
        <button
          onClick={triggerManualCheck}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 disabled:opacity-50 text-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Checking..." : "Run Check"}
        </button>
      }
    >
      <div className="space-y-6">

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {services.map((svc) => (
            <div key={svc.name} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{svc.label}</h3>
                {svc.lastStatus === "ok" ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : svc.lastStatus === "error" ? (
                  <XCircle className="w-6 h-6 text-red-400" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className={`text-xl font-bold ${svc.uptimePercent >= 99 ? "text-green-400" : svc.uptimePercent >= 95 ? "text-yellow-400" : "text-red-400"}`}>
                    {svc.uptimePercent}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                  <p className="text-xl font-bold">{svc.avgResponseMs}ms</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Check</p>
                  <p className="text-sm">{svc.lastChecked ? new Date(svc.lastChecked).toLocaleTimeString() : "Never"}</p>
                </div>
              </div>

              {/* Mini status bar */}
              <div className="flex gap-0.5">
                {svc.recentChecks.slice(0, 20).reverse().map((c, i) => (
                  <div
                    key={i}
                    className={`h-4 flex-1 rounded-sm ${c.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
                    title={`${new Date(c.checked_at).toLocaleString()} - ${c.status}${c.error_message ? `: ${c.error_message}` : ""}`}
                  />
                ))}
                {Array.from({ length: Math.max(0, 20 - svc.recentChecks.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-4 flex-1 rounded-sm bg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Incidents */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Incidents</h3>
          {services.flatMap((s) => s.recentChecks.filter((c) => c.status === "error")).length === 0 ? (
            <p className="text-muted-foreground text-sm">No incidents recorded. All systems healthy.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {services
                .flatMap((s) => s.recentChecks.filter((c) => c.status === "error"))
                .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
                .slice(0, 20)
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-2 bg-red-500/10 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-medium">{SERVICE_LABELS[c.service_name] || c.service_name}</span>
                    <span className="text-muted-foreground">{c.error_message}</span>
                    <span className="ml-auto text-muted-foreground text-xs">{new Date(c.checked_at).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
