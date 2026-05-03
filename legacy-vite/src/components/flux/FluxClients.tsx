import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Phone, Mail, Building2, X, Copy, User } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  notes: string | null;
  created_at: string;
}

const ACCENT = "#00FF94";

export default function FluxClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", business_name: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setClients(data as Client[]); });
  }, [user]);

  const add = async () => {
    if (!user || !form.name.trim()) return;
    const { data } = await supabase.from("clients").insert({
      user_id: user.id, name: form.name, email: form.email || null,
      phone: form.phone || null, business_name: form.business_name || null, notes: form.notes || null,
    }).select().single();
    if (data) { setClients(prev => [data as Client, ...prev]); setShowAdd(false); setForm({ name: "", email: "", phone: "", business_name: "", notes: "" }); }
  };

  const filtered = clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.business_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(c => (
          <div key={c.id} className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                <User size={14} style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="text-xs font-display font-semibold" style={{ color: "#E4E4EC" }}>{c.name}</p>
                {c.business_name && <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>{c.business_name}</p>}
              </div>
            </div>
            {c.email && <p className="text-[10px] font-body flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}><Mail size={9} /> {c.email}</p>}
            {c.phone && <p className="text-[10px] font-body flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}><Phone size={9} /> {c.phone}</p>}
            {c.notes && <p className="text-[10px] font-body line-clamp-2" style={{ color: "rgba(255,255,255,0.3)" }}>{c.notes}</p>}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-xs font-body text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No clients yet</p>}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-3" style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Add Client</h3>
              <button onClick={() => setShowAdd(false)}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            {[
              { key: "name", label: "Name *" },
              { key: "business_name", label: "Business Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "notes", label: "Notes" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
              </div>
            ))}
            <button onClick={add} disabled={!form.name.trim()} className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30"
              style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
              Add Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
