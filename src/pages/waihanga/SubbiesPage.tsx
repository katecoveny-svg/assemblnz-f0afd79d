import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, AlertTriangle, Phone, Loader2, X, Send, FileWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Subbie {
  id: string;
  company_name: string;
  trading_name: string | null;
  trade: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  lbp_number: string | null;
  lbp_expiry: string | null;
  site_safe_number: string | null;
  site_safe_expiry: string | null;
  insurance_policy: string | null;
  insurance_expiry: string | null;
  insurance_amount: number | null;
  hs_plan_uploaded: boolean;
  site_induction_signed: boolean;
  site_induction_date: string | null;
  project_name: string | null;
  status: "green" | "amber" | "red" | "black";
  notes: string | null;
}

const STATUS_COLORS = {
  green: { bg: "#3A7D6E", label: "GREEN" },
  amber: { bg: "#E88D67", label: "AMBER" },
  red: { bg: "#C75050", label: "RED" },
  black: { bg: "#3D4250", label: "MISSING" },
};

const daysUntil = (d: string | null) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null;

export default function SubbiesPage() {
  const [subbies, setSubbies] = useState<Subbie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "green" | "amber" | "red">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [chasing, setChasing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    company_name: "", trading_name: "", nzbn: "", trade: "",
    contact_name: "", contact_phone: "", contact_email: "",
    lbp_number: "", lbp_expiry: "",
    site_safe_number: "", site_safe_expiry: "",
    insurance_policy: "", insurance_expiry: "", insurance_amount: "",
    site_induction_date: "", site_induction_signed: false,
    hs_plan_uploaded: false, project_name: "",
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("subcontractor_compliance")
      .select("*")
      .order("status", { ascending: true });
    setSubbies((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? subbies : subbies.filter(s => s.status === filter);
  const counts = {
    green: subbies.filter(s => s.status === "green").length,
    amber: subbies.filter(s => s.status === "amber").length,
    red: subbies.filter(s => s.status === "red" || s.status === "black").length,
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in"); return; }

    const payload: any = {
      ...form,
      tenant_id: "00000000-0000-0000-0000-000000000001",
      user_id: user.id,
      insurance_amount: form.insurance_amount ? Number(form.insurance_amount) : null,
      lbp_expiry: form.lbp_expiry || null,
      site_safe_expiry: form.site_safe_expiry || null,
      insurance_expiry: form.insurance_expiry || null,
      site_induction_date: form.site_induction_date || null,
    };
    Object.keys(payload).forEach(k => payload[k] === "" && (payload[k] = null));

    const { error } = await supabase.from("subcontractor_compliance").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Subbie added");
    setShowAdd(false);
    setForm({ company_name: "", trading_name: "", nzbn: "", trade: "", contact_name: "", contact_phone: "", contact_email: "",
      lbp_number: "", lbp_expiry: "", site_safe_number: "", site_safe_expiry: "",
      insurance_policy: "", insurance_expiry: "", insurance_amount: "",
      site_induction_date: "", site_induction_signed: false, hs_plan_uploaded: false, project_name: "" });
    load();
  };

  const chase = async (subbie: Subbie) => {
    if (!subbie.contact_phone) { toast.error("No phone number on file"); return; }
    setChasing(subbie.id);
    try {
      const { data, error } = await supabase.functions.invoke("subbie-chase", {
        body: { subbie_id: subbie.id, reason: "Compliance docs check-in" },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Send failed");
      toast.success(`Reminder sent to ${subbie.company_name}`);
    } catch (e: any) {
      toast.error(e.message || "Chase failed");
    } finally {
      setChasing(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this subbie?")) return;
    await supabase.from("subcontractor_compliance").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7F3EE" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight" style={{ color: "#F5F0E8", fontFamily: "'Lato', sans-serif" }}>
            Subbie Watchdog
          </h1>
          <p className="text-sm mt-2" style={{ color: "#9CA3AF" }}>
            Real-time compliance for every sub on every site.
          </p>
        </motion.div>

        {/* Traffic light summary */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {([
            { label: "GREEN", count: counts.green, color: "#3A7D6E" },
            { label: "AMBER", count: counts.amber, color: "#E88D67" },
            { label: "RED / MISSING", count: counts.red, color: "#C75050" },
          ]).map(card => (
            <div key={card.label} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${card.color}40`, backdropFilter: "blur(20px)" }}>
              <div className="text-3xl font-light" style={{ color: card.color }}>{card.count}</div>
              <div className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Red alert */}
        {counts.red > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(199,80,80,0.15)", border: "1px solid rgba(199,80,80,0.4)" }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#C75050" }} />
            <div className="text-sm" style={{ color: "#F5F0E8" }}>
              <strong>{counts.red} subbie{counts.red > 1 ? "s" : ""}</strong> with expired or missing compliance — chase now.
            </div>
          </motion.div>
        )}

        {/* Filter bar + add */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "green", "amber", "red"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={{
                  background: filter === f ? "#3A7D6E" : "rgba(255,255,255,0.05)",
                  color: filter === f ? "#F5F0E8" : "#9CA3AF",
                  borderColor: filter === f ? "#3A7D6E" : "rgba(255,255,255,0.1)",
                }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            style={{ background: "#4AA5A8", color: "#F7F3EE" }}>
            <Plus className="w-4 h-4" /> Add subbie
          </button>
        </div>

        {/* Subbie cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center py-20" style={{ color: "#9CA3AF" }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-2 text-center py-20 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}>
              <FileWarning className="w-10 h-10 mx-auto mb-3 opacity-50" />
              No subbies yet. Add your first to start tracking.
            </div>
          ) : filtered.map(s => {
            const status = STATUS_COLORS[s.status];
            const expanded = expandedId === s.id;
            return (
              <div key={s.id} className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: `1px solid ${status.bg}40` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold" style={{ color: "#F5F0E8" }}>{s.company_name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                      {s.trade || "—"} {s.project_name && `· ${s.project_name}`}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: status.bg, color: "#F5F0E8" }}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs" style={{ color: "#E5E7EB" }}>
                  {s.lbp_expiry && <div>LBP: {s.lbp_number || "—"} <span style={{ color: "#9CA3AF" }}>({daysUntil(s.lbp_expiry)}d)</span></div>}
                  {s.site_safe_expiry && <div>Site Safe: <span style={{ color: "#9CA3AF" }}>({daysUntil(s.site_safe_expiry)}d)</span></div>}
                  {s.insurance_expiry && <div>Insurance: ${s.insurance_amount?.toLocaleString() || "—"} <span style={{ color: "#9CA3AF" }}>({daysUntil(s.insurance_expiry)}d)</span></div>}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(s.status === "amber" || s.status === "red") && s.contact_phone && (
                    <button onClick={() => chase(s)} disabled={chasing === s.id}
                      className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: "#3A7D6E", color: "#F5F0E8" }}>
                      {chasing === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Chase
                    </button>
                  )}
                  <button onClick={() => setExpandedId(expanded ? null : s.id)}
                    className="px-3 py-1.5 rounded-full text-xs"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF" }}>
                    {expanded ? "Hide" : "Details"}
                  </button>
                  <button onClick={() => remove(s.id)} className="px-3 py-1.5 rounded-full text-xs"
                    style={{ background: "rgba(199,80,80,0.15)", color: "#C75050" }}>Remove</button>
                </div>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs space-y-1" style={{ color: "#9CA3AF" }}>
                    {s.contact_name && <div>Contact: {s.contact_name}</div>}
                    {s.contact_phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.contact_phone}</div>}
                    <div>H&S plan: {s.hs_plan_uploaded ? "✓ uploaded" : "✗ missing"}</div>
                    <div>Site induction: {s.site_induction_signed ? `✓ ${s.site_induction_date || ""}` : "✗ outstanding"}</div>
                    {s.notes && <div className="mt-2 italic">{s.notes}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(10,22,40,0.85)" }} onClick={() => setShowAdd(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleAdd}
            className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6"
            style={{ background: "#1A2438", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium" style={{ color: "#F5F0E8" }}>Add subcontractor</h2>
              <button type="button" onClick={() => setShowAdd(false)}><X className="w-5 h-5" style={{ color: "#9CA3AF" }} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ["company_name", "Company name *", "text", true],
                ["trading_name", "Trading name", "text"],
                ["nzbn", "NZBN", "text"],
                ["trade", "Trade (e.g. Electrical)", "text"],
                ["contact_name", "Contact person", "text"],
                ["contact_phone", "Phone (e.g. +642...)", "tel"],
                ["contact_email", "Email", "email"],
                ["project_name", "Project assignment", "text"],
                ["lbp_number", "LBP number", "text"],
                ["lbp_expiry", "LBP expiry", "date"],
                ["site_safe_number", "Site Safe passport", "text"],
                ["site_safe_expiry", "Site Safe expiry", "date"],
                ["insurance_policy", "Insurance policy ref", "text"],
                ["insurance_expiry", "Insurance expiry", "date"],
                ["insurance_amount", "Cover amount (NZD)", "number"],
                ["site_induction_date", "Site induction date", "date"],
              ].map(([key, label, type, req]) => (
                <label key={key as string} className="flex flex-col gap-1">
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{label as string}</span>
                  <input
                    required={!!req}
                    type={type as string}
                    value={(form as any)[key as string]}
                    onChange={e => setForm({ ...form, [key as string]: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none"
                    style={{ color: "#F5F0E8" }}
                  />
                </label>
              ))}
              <label className="flex items-center gap-2 sm:col-span-2 mt-2">
                <input type="checkbox" checked={form.hs_plan_uploaded}
                  onChange={e => setForm({ ...form, hs_plan_uploaded: e.target.checked })} />
                <span style={{ color: "#E5E7EB" }}>H&S plan uploaded</span>
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={form.site_induction_signed}
                  onChange={e => setForm({ ...form, site_induction_signed: e.target.checked })} />
                <span style={{ color: "#E5E7EB" }}>Site induction signed</span>
              </label>
            </div>
            <button type="submit" className="mt-6 w-full py-3 rounded-full font-medium"
              style={{ background: "#4AA5A8", color: "#F7F3EE" }}>
              Add subbie
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
