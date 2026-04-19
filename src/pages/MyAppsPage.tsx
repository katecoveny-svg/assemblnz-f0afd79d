import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Rocket, ExternalLink, Pause, Play, Trash2, Copy, Eye, CheckCircle2 } from "lucide-react";
import sparkImg from "@/assets/agents/spark.png";

const ACCENT = "#FF6B00";

export default function MyAppsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("spark_apps" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setApps((data || []) as any[]); setLoading(false); });
  }, [user]);

  const toggleStatus = async (app: any) => {
    const newStatus = app.status === "live" ? "paused" : "live";
    await supabase.from("spark_apps" as any).update({ status: newStatus } as any).eq("id", app.id);
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
  };

  const deleteApp = async (id: string) => {
    if (!confirm("Delete this app permanently?")) return;
    await supabase.from("spark_apps" as any).delete().eq("id", id);
    setApps(prev => prev.filter(a => a.id !== id));
  };

  const copyUrl = (app: any) => {
    navigator.clipboard.writeText(`${window.location.origin}/apps/${app.name}`);
    setCopied(app.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "transparent" }}>
        <div className="text-center space-y-3">
          <p className="text-sm font-body" style={{ color: "#6B7280" }}>Sign in to view your deployed apps</p>
          <Link to="/login" className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: `${ACCENT}20`, color: ACCENT }}>Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "transparent" }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/chat/spark" className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.65)" }}>
              <ArrowLeft size={16} style={{ color: "#6B7280" }} />
            </Link>
            <img loading="lazy" decoding="async" src={sparkImg} alt="SPARK" className="w-8 h-8 object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 6px rgba(255,107,0,0.4))" }} />
            <h1 className="text-lg font-display font-bold" style={{ color: "#E4E4EC" }}>My Apps</h1>
          </div>
          <span className="text-[11px] font-mono-jb px-3 py-1 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT }}>
            {apps.length} app{apps.length !== 1 ? "s" : ""} deployed
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-xs" style={{ color: "#9CA3AF" }}>Loading...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Rocket size={32} className="mx-auto" style={{ color: "#D1D5DB" }} />
            <p className="text-sm font-body" style={{ color: "#6B7280" }}>No apps deployed yet</p>
            <p className="text-xs font-body" style={{ color: "#9CA3AF" }}>Build an app with SPARK, then click Deploy to publish it here.</p>
            <Link to="/chat/spark" className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg"
              style={{ background: `${ACCENT}20`, color: ACCENT }}>
              <Rocket size={12} /> Open SPARK
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map(app => (
              <div key={app.id} className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-semibold" style={{ color: "#E4E4EC" }}>{app.display_name}</h3>
                  <span className="text-[9px] font-mono-jb px-2 py-0.5 rounded-full"
                    style={{ background: app.status === "live" ? "rgba(102,187,106,0.1)" : "rgba(255,255,255,0.05)",
                      color: app.status === "live" ? "rgba(102,187,106,0.9)" : "rgba(255,255,255,0.3)" }}>
                    {app.status === "live" ? " Live" : " Paused"}
                  </span>
                </div>

                {app.meta_description && (
                  <p className="text-[10px] font-body line-clamp-2" style={{ color: "#6B7280" }}>{app.meta_description}</p>
                )}

                <div className="flex items-center gap-2 text-[9px] font-mono-jb" style={{ color: "#9CA3AF" }}>
                  <Eye size={10} /> {app.view_count} views
                  <span className="mx-1">·</span>
                  {new Date(app.created_at).toLocaleDateString()}
                </div>

                <div className="flex gap-1.5">
                  <a href={`/apps/${app.name}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                    style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                    <ExternalLink size={10} /> Open
                  </a>
                  <button onClick={() => copyUrl(app)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                    style={{ background: "rgba(255,255,255,0.65)", color: "#6B7280", border: "1px solid rgba(74,165,168,0.15)" }}>
                    {copied === app.id ? <CheckCircle2 size={10} style={{ color: "rgba(102,187,106,0.9)" }} /> : <Copy size={10} />}
                    {copied === app.id ? "Copied" : "URL"}
                  </button>
                  <button onClick={() => toggleStatus(app)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                    style={{ background: "rgba(255,255,255,0.65)", color: "#6B7280", border: "1px solid rgba(74,165,168,0.15)" }}>
                    {app.status === "live" ? <><Pause size={10} /> Pause</> : <><Play size={10} /> Resume</>}
                  </button>
                  <button onClick={() => deleteApp(app.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                    style={{ background: "rgba(255,77,106,0.05)", color: "#C85A54", border: "1px solid rgba(255,77,106,0.1)" }}>
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
