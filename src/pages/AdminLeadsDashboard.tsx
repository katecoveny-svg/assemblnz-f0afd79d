import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Target, Mail, TrendingUp, Users, RefreshCw } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  message: string;
  lead_score: number | null;
  lead_status: string | null;
  follow_up_sent: boolean | null;
  is_read: boolean;
  created_at: string;
}

interface ActivityRow {
  id: string;
  submission_id: string;
  activity_type: string;
  details: string | null;
  created_at: string;
}

export default function AdminLeadsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    const [leadsRes, actRes] = await Promise.all([
      supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("lead_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    setLeads((leadsRes.data as any[]) || []);
    setActivities((actRes.data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [authLoading, user, navigate, fetchData]);

  const scoreLead = async (id: string) => {
    setScoring(id);
    try {
      await supabase.functions.invoke("qualify-lead", { body: { submissionId: id } });
      await fetchData();
    } finally {
      setScoring(null);
    }
  };

  const scoreAll = async () => {
    const unscored = leads.filter((l) => l.lead_score === null);
    for (const lead of unscored) {
      await scoreLead(lead.id);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.lead_status === filter);
  const hotCount = leads.filter((l) => l.lead_status === "hot").length;
  const warmCount = leads.filter((l) => l.lead_status === "warm").length;
  const coldCount = leads.filter((l) => l.lead_status === "cold").length;
  const unscoredCount = leads.filter((l) => l.lead_score === null).length;
  const avgScore = leads.filter((l) => l.lead_score).length > 0
    ? Math.round(leads.filter((l) => l.lead_score).reduce((s, l) => s + (l.lead_score || 0), 0) / leads.filter((l) => l.lead_score).length)
    : 0;

  return (
    <AdminShell
      title="Lead Intelligence"
      subtitle={`${leads.length} contacts tracked`}
      icon={<Target className="w-5 h-5 text-primary" />}
      backTo="/admin/dashboard"
      actions={
        unscoredCount > 0 ? (
          <button onClick={scoreAll} className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            <TrendingUp className="w-4 h-4" />
            Score {unscoredCount} Unscored
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Leads", value: leads.length, icon: Users },
            { label: "Hot Leads", value: hotCount, icon: Target, color: "text-red-400" },
            { label: "Warm Leads", value: warmCount, icon: TrendingUp, color: "text-yellow-400" },
            { label: "Cold Leads", value: coldCount, icon: Mail, color: "text-blue-400" },
            { label: "Avg Score", value: avgScore, icon: Target, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <stat.icon className={`w-5 h-5 mb-2 ${stat.color || "text-muted-foreground"}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {["all", "hot", "warm", "cold"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Leads Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Score</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Follow-up</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-border hover:bg-muted/10">
                    <td className="p-3 font-medium">{lead.name}</td>
                    <td className="p-3 text-muted-foreground">{lead.email}</td>
                    <td className="p-3">
                      {lead.lead_score !== null ? (
                        <span className={`font-bold ${lead.lead_score > 70 ? "text-red-400" : lead.lead_score > 50 ? "text-yellow-400" : "text-blue-400"}`}>
                          {lead.lead_score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="p-3">
                      {lead.lead_status ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          lead.lead_status === "hot" ? "bg-red-500/20 text-red-400"
                            : lead.lead_status === "warm" ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {lead.lead_status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unscored</span>
                      )}
                    </td>
                    <td className="p-3">
                      {lead.follow_up_sent ? (
                        <span className="text-green-400 text-xs">Sent</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => scoreLead(lead.id)}
                        disabled={scoring === lead.id}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${scoring === lead.id ? "animate-spin" : ""}`} />
                        {lead.lead_score !== null ? "Re-score" : "Score"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Lead Activity Feed</h3>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet. Score some leads to get started.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.slice(0, 30).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2 bg-muted/10 rounded-lg text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    a.activity_type === "follow_up_sent" ? "bg-green-500/20 text-green-400"
                      : a.activity_type === "scored" ? "bg-primary/20 text-primary"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {a.activity_type.replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground">{a.details}</span>
                  <span className="ml-auto text-muted-foreground text-xs">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
