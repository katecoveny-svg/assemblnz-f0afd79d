import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Layers } from "lucide-react";

const ROLE_OPTIONS = ["free", "starter", "pro", "business"] as const;

const AdminPacksPage = () => {
  const { user } = useAuth();
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email?.toLowerCase().trim() === "assembl@assembl.co.nz" || user?.email?.toLowerCase().trim() === "kate@assembl.co.nz";

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("pack_visibility").select("*").order("display_order")
      .then(({ data }) => { setPacks(data || []); setLoading(false); });
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const updatePack = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase.from("pack_visibility").update(updates).eq("id", id);
    if (error) { toast.error("Update failed"); return; }
    setPacks(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast.success("Pack updated");
  };

  const moveOrder = async (idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= packs.length) return;
    const a = packs[idx], b = packs[swapIdx];
    await supabase.from("pack_visibility").update({ display_order: b.display_order }).eq("id", a.id);
    await supabase.from("pack_visibility").update({ display_order: a.display_order }).eq("id", b.id);
    const next = [...packs];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    const reordered = next.map((p, i) => ({ ...p, display_order: i + 1 }));
    setPacks(reordered);
    toast.success("Reordered");
  };

  return (
    <AdminShell
      title="Pack Management"
      subtitle="Industry pack visibility & ordering"
      icon={<Layers size={18} style={{ color: "#D4A843" }} />}
      backTo="/admin/dashboard"
    >

        {loading ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Loading…</p>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(74,165,168,0.15)" }}>
            <table className="w-full text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(74,165,168,0.1)" }}>
                  {["Order", "Pack", "Public", "Min Role", "Agents", "Subscribers", "Updated"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider" style={{ color: "#6B7280", fontSize: "10px", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packs.map((pack, idx) => (
                  <tr key={pack.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-white/5 disabled:opacity-20"><ArrowUp size={12} color="#A8A8B8" /></button>
                        <button onClick={() => moveOrder(idx, 1)} disabled={idx === packs.length - 1} className="p-1 rounded hover:bg-white/5 disabled:opacity-20"><ArrowDown size={12} color="#A8A8B8" /></button>
                        <span className="ml-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6B7280" }}>{pack.display_order}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold" style={{ color: "#1A1D29" }}>{pack.pack_name}</p>
                      <p style={{ color: "#9CA3AF", fontSize: "10px" }}>{pack.pack_slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updatePack(pack.id, { is_public: !pack.is_public })}
                        className="w-10 h-5 rounded-full relative transition-all"
                        style={{ background: pack.is_public ? "#3A7D6E" : "rgba(255,255,255,0.1)" }}
                      >
                        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: pack.is_public ? "22px" : "2px" }} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={pack.requires_role}
                        onChange={(e) => updatePack(pack.id, { requires_role: e.target.value })}
                        className="bg-transparent border rounded px-2 py-1 text-xs"
                        style={{ borderColor: "rgba(255,255,255,0.1)", color: "#1A1D29" }}
                      >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r} style={{ background: "#FAFBFC" }}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>{pack.agent_count}</td>
                    <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>Coming Soon</td>
                    <td className="px-4 py-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF", fontSize: "10px" }}>
                      {new Date(pack.updated_at).toLocaleDateString("en-NZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </AdminShell>
  );
};

export default AdminPacksPage;
