import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Zap, Clock, Mail, FileText, Bell, Calendar, Users, BarChart3 } from "lucide-react";

const ACCENT = "#FF8C42";

const DEFAULT_AUTOMATIONS = [
  { title: "Overdue Invoice Chaser", description: "Auto-emails clients 7 days past due", category: "billing", icon: "mail" },
  { title: "Weekly Summary Report", description: "Generates and sends every Monday", category: "reporting", icon: "file-text" },
  { title: "Task Assignment Notifier", description: "Alerts team when tasks are assigned", category: "scheduling", icon: "bell" },
  { title: "Meeting Prep Auto-Brief", description: "Generates brief 1hr before meetings", category: "scheduling", icon: "calendar" },
  { title: "Lead Score Notification", description: "Alerts when a lead turns Hot", category: "client_comms", icon: "zap" },
  { title: "Quote Follow-Up (48hr)", description: "Nudge if quote unopened after 48hrs", category: "client_comms", icon: "clock" },
  { title: "Stale Pipeline Sweep", description: "Flags leads with no activity in 14+ days", category: "client_comms", icon: "bar-chart" },
  { title: "CRM Auto-Update", description: "Syncs notes and status via webhook", category: "general", icon: "users" },
];

const ICON_MAP: Record<string, any> = { zap: Zap, clock: Clock, mail: Mail, "file-text": FileText, bell: Bell, calendar: Calendar, users: Users, "bar-chart": BarChart3 };

export default function AxisAutomations() {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("automations").select("*").eq("user_id", user.id).order("created_at")
      .then(async ({ data }) => {
        if (data && data.length > 0) {
          setAutomations(data);
        } else {
          // Seed defaults
          const inserts = DEFAULT_AUTOMATIONS.map(a => ({ user_id: user.id, ...a }));
          const { data: inserted } = await supabase.from("automations").insert(inserts).select();
          if (inserted) setAutomations(inserted);
        }
      });
  }, [user]);

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("automations").update({ is_active: !active }).eq("id", id);
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !active } : a));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Automations</h2>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>Toggle automations on/off. Active automations run in the background.</p>

      <div className="space-y-2">
        {automations.map(a => {
          const Icon = ICON_MAP[a.icon] || Zap;
          return (
            <div key={a.id} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.is_active ? ACCENT + "20" : "rgba(255,255,255,0.04)"}` }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.is_active ? `${ACCENT}15` : "rgba(255,255,255,0.03)" }}>
                <Icon size={16} style={{ color: a.is_active ? ACCENT : "rgba(255,255,255,0.3)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-display font-semibold" style={{ color: "#E4E4EC" }}>{a.title}</p>
                <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>{a.description}</p>
                {a.run_count > 0 && <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{a.run_count} runs</p>}
              </div>
              <button onClick={() => toggle(a.id, a.is_active)} className="w-10 h-5 rounded-full relative transition-colors shrink-0"
                style={{ background: a.is_active ? `${ACCENT}40` : "rgba(255,255,255,0.08)" }}>
                <div className="w-4 h-4 rounded-full absolute top-0.5 transition-all" style={{ left: a.is_active ? "22px" : "2px", background: a.is_active ? ACCENT : "rgba(255,255,255,0.3)" }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
