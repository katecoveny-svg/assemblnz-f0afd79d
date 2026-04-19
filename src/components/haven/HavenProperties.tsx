import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Home, Phone, Mail, Edit2, Trash2, ChevronRight, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface Property {
  id: string;
  address: string;
  suburb: string;
  region: string;
  tenant_name: string | null;
  tenant_phone: string | null;
  tenant_email: string | null;
  notes: string | null;
  image_url: string | null;
  next_inspection_date: string | null;
  created_at: string;
}

const HAVEN_PINK = "#D4A843";

const HavenProperties = ({ onSendToChat }: { onSendToChat: (msg: string) => void }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ address: "", suburb: "", region: "Auckland", tenant_name: "", tenant_phone: "", tenant_email: "", notes: "" });
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});

  const fetchProperties = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load properties"); console.error(error); }
    else setProperties(data || []);

    // Fetch open job counts
    const { data: jobs } = await supabase.from("maintenance_jobs").select("property_id, status").neq("status", "completed").neq("status", "invoice_uploaded");
    if (jobs) {
      const counts: Record<string, number> = {};
      jobs.forEach(j => { counts[j.property_id] = (counts[j.property_id] || 0) + 1; });
      setJobCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.address || !form.suburb) { toast.error("Address and suburb are required"); return; }
    if (editingId) {
      const { error } = await supabase.from("properties").update({ ...form }).eq("id", editingId);
      if (error) toast.error("Failed to update"); else { toast.success("Property updated"); fetchProperties(); }
    } else {
      const { error } = await supabase.from("properties").insert({ ...form, user_id: user.id });
      if (error) toast.error("Failed to add property"); else { toast.success("Property added"); fetchProperties(); }
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ address: "", suburb: "", region: "Auckland", tenant_name: "", tenant_phone: "", tenant_email: "", notes: "" });
  };

  const handleEdit = (p: Property) => {
    setEditingId(p.id);
    setForm({ address: p.address, suburb: p.suburb, region: p.region, tenant_name: p.tenant_name || "", tenant_phone: p.tenant_phone || "", tenant_email: p.tenant_email || "", notes: p.notes || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property and all associated data?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error("Failed to delete"); else { toast.success("Property removed"); fetchProperties(); }
  };

  const filtered = properties.filter(p =>
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.suburb.toLowerCase().includes(search.toLowerCase()) ||
    (p.tenant_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-bold text-base text-foreground">Properties</h2>
          <p className="text-[11px] font-body text-muted-foreground">{properties.length} properties in portfolio</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ address: "", suburb: "", region: "Auckland", tenant_name: "", tenant_phone: "", tenant_email: "", notes: "" }); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: HAVEN_PINK + "15", color: HAVEN_PINK, border: `1px solid ${HAVEN_PINK}25` }}>
          <Plus size={14} /> Add Property
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by address, suburb, or tenant…"
          className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-body bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-pink-400/30" />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="rounded-xl p-4 space-y-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-foreground">{editingId ? "Edit Property" : "New Property"}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X size={14} className="text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address *"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))} placeholder="Suburb *"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="Region"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.tenant_name} onChange={e => setForm(f => ({ ...f, tenant_name: e.target.value }))} placeholder="Tenant Name"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.tenant_phone} onChange={e => setForm(f => ({ ...f, tenant_phone: e.target.value }))} placeholder="Tenant Phone"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input value={form.tenant_email} onChange={e => setForm(f => ({ ...f, tenant_email: e.target.value }))} placeholder="Tenant Email"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes"
            className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none h-16" />
          <button onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: HAVEN_PINK + "20", color: HAVEN_PINK, border: `1px solid ${HAVEN_PINK}30` }}>
            {editingId ? "Update Property" : "Add Property"}
          </button>
        </div>
      )}

      {/* Property Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Home size={32} className="mx-auto text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground font-body">{properties.length === 0 ? "No properties yet" : "No matches found"}</p>
          {properties.length === 0 && (
            <button onClick={() => onSendToChat("Add a property at 14 Rosewood Drive, Ponsonby, Auckland")}
              className="text-xs font-body underline" style={{ color: HAVEN_PINK }}>Try adding via chat</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="rounded-xl p-3 space-y-2 border transition-all hover:border-opacity-20 group"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-xs text-foreground truncate">{p.address}</p>
                  <p className="text-[10px] font-body text-muted-foreground">{p.suburb}, {p.region}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(p)} className="p-1 rounded hover:bg-muted"><Edit2 size={12} className="text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-muted"><Trash2 size={12} className="text-muted-foreground" /></button>
                </div>
              </div>
              {p.tenant_name && (
                <div className="space-y-0.5">
                  <p className="text-[11px] font-body text-foreground">{p.tenant_name}</p>
                  <div className="flex items-center gap-3">
                    {p.tenant_phone && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone size={9} />{p.tenant_phone}</span>}
                    {p.tenant_email && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Mail size={9} />{p.tenant_email}</span>}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                {jobCounts[p.id] ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: "#FF6D0015", color: "#FF6D00" }}>
                    <AlertTriangle size={9} /> {jobCounts[p.id]} open {jobCounts[p.id] === 1 ? "job" : "jobs"}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-body">No open jobs</span>
                )}
                {p.next_inspection_date && (
                  <span className="text-[10px] text-muted-foreground font-body">
                    Inspection: {new Date(p.next_inspection_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HavenProperties;
