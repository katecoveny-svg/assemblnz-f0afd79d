import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Plus, X, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

const HAVEN_PINK = "#D4A843";
const STATUS_COLORS: Record<string, string> = { compliant: "#66BB6A", due_soon: "#FFB300", overdue: "#EF5350", not_checked: "rgba(255,255,255,0.2)" };

const HEALTHY_HOMES_TEMPLATES = [
  { category: "Safety", title: "Smoke Alarm Check" },
  { category: "Safety", title: "Carbon Monoxide Detector" },
  { category: "Insulation", title: "Ceiling Insulation Compliance" },
  { category: "Insulation", title: "Underfloor Insulation Check" },
  { category: "Healthy Homes", title: "Heating Source Compliance" },
  { category: "Healthy Homes", title: "Ventilation Compliance" },
  { category: "Healthy Homes", title: "Moisture & Drainage Check" },
  { category: "Inspection", title: "Routine Inspection" },
];

interface ComplianceItem {
  id: string; property_id: string; category: string; title: string;
  status: string; due_date: string | null; last_completed: string | null;
  reminder_enabled: boolean; notes: string | null;
}

const HavenCompliance = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [properties, setProperties] = useState<{ id: string; address: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProperty, setFilterProperty] = useState("all");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [compRes, propsRes] = await Promise.all([
      supabase.from("compliance_items").select("*").order("due_date", { ascending: true }),
      supabase.from("properties").select("id, address"),
    ]);
    setItems(compRes.data || []);
    setProperties(propsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const addTemplatesForProperty = async (propertyId: string) => {
    if (!user) return;
    const inserts = HEALTHY_HOMES_TEMPLATES.map(t => ({
      user_id: user.id, property_id: propertyId, category: t.category, title: t.title, status: "not_checked" as const,
    }));
    const { error } = await supabase.from("compliance_items").insert(inserts);
    if (error) toast.error("Failed to add"); else { toast.success("Healthy Homes templates added"); fetchData(); }
  };

  const toggleReminder = async (id: string, current: boolean) => {
    await supabase.from("compliance_items").update({ reminder_enabled: !current }).eq("id", id);
    fetchData();
  };

  const computeStatus = (item: ComplianceItem): string => {
    if (!item.due_date) return item.status;
    const now = new Date();
    const due = new Date(item.due_date);
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "overdue";
    if (diff <= 30) return "due_soon";
    if (item.last_completed) return "compliant";
    return item.status;
  };

  const filtered = items.filter(i => filterProperty === "all" || i.property_id === filterProperty);
  const propMap = Object.fromEntries(properties.map(p => [p.id, p]));

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div>
        <h2 className="font-display font-bold text-base text-foreground">Compliance</h2>
        <p className="text-[11px] font-body text-muted-foreground">NZ Healthy Homes Standards</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs bg-card border border-border text-foreground">
          <option value="all">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
        </select>
        {properties.length > 0 && (
          <select onChange={e => { if (e.target.value) addTemplatesForProperty(e.target.value); e.target.value = ""; }}
            className="px-3 py-1.5 rounded-lg text-xs bg-card border border-border text-foreground">
            <option value="">+ Add Healthy Homes templates…</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
          </select>
        )}
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        {(["compliant", "due_soon", "overdue", "not_checked"] as const).map(s => {
          const count = filtered.filter(i => computeStatus(i) === s).length;
          return (
            <div key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: STATUS_COLORS[s] + "15", color: STATUS_COLORS[s] }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
              {s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}: {count}
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Shield size={32} className="mx-auto text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No compliance items yet</p>
          <p className="text-[10px] text-muted-foreground">Add Healthy Homes templates to a property above</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(item => {
            const status = computeStatus(item);
            return (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                  <div>
                    <span className="text-xs font-body text-foreground">{item.title}</span>
                    <p className="text-[10px] text-muted-foreground">{item.category} · {propMap[item.property_id]?.address || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.due_date && <span className="text-[10px] text-muted-foreground">{new Date(item.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>}
                  <button onClick={() => toggleReminder(item.id, item.reminder_enabled)} className="p-1 rounded hover:bg-muted">
                    {item.reminder_enabled ? <Bell size={11} style={{ color: HAVEN_PINK }} /> : <BellOff size={11} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HavenCompliance;
