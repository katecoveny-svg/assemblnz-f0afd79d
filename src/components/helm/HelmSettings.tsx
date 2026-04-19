import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X, Users, Baby, Share2, Settings2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import HelmSmsSettings from "./HelmSmsSettings";

const HELM_COLOR = "#3A6A9C";

const NZ_REGIONS = [
  "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay",
  "Manawatū-Whanganui", "Marlborough", "Nelson", "Northland", "Otago",
  "Southland", "Taranaki", "Tasman", "Waikato", "Wellington", "West Coast",
];

interface Family { id: string; name: string; nz_region: string | null; }
interface Child { id: string; name: string; year_level: string | null; school: string | null; avatar_color: string; bus_route_id: string | null; }

export default function HelmSettings() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  
  // Setup form
  const [familyName, setFamilyName] = useState("");
  const [region, setRegion] = useState("Auckland");
  
  // Child form
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [school, setSchool] = useState("");
  const [busRoute, setBusRoute] = useState("");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const { data: fm, error: fmError } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
    if (fmError && fmError.code !== "PGRST116") {
      toast.error("Error loading family data: " + fmError.message);
      setShowSetup(true);
      return;
    }
    if (fm) {
      const [fam, kids, inv] = await Promise.all([
        supabase.from("families").select("*").eq("id", fm.family_id).single(),
        supabase.from("children").select("*").eq("family_id", fm.family_id),
        supabase.from("family_invites").select("code").eq("family_id", fm.family_id).is("used_by", null).limit(1).single(),
      ]);
      if (fam.data) setFamily(fam.data);
      setChildren(kids.data || []);
      setInviteCode(inv.data?.code || null);
    } else {
      setShowSetup(true);
    }
  };

  const createFamily = async () => {
    if (!user || !familyName.trim()) return;
    try {
      // Verify active session before insert
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast.error("Your session has expired. Please sign in again.");
        return;
      }
      console.log("[TORO] Creating family:", familyName, region, "uid:", sessionData.session.user.id);
      const { data: fam, error: famError } = await supabase.from("families").insert({ name: familyName, nz_region: region, created_by: sessionData.session.user.id }).select().single();
      if (famError) { console.error("[TORO] Family insert error:", famError); toast.error("Failed to create family: " + famError.message); return; }
      if (fam) {
        console.log("[TORO] Family created, adding member:", fam.id);
        const { error: memError } = await supabase.from("family_members").insert({ family_id: fam.id, user_id: user.id, role: "admin" });
        if (memError) { console.error("[TORO] Member insert error:", memError); toast.error("Failed to add you as family member: " + memError.message); return; }
        // Invite is optional, don't block on failure
        const { error: invErr } = await supabase.from("family_invites").insert({ family_id: fam.id, created_by: user.id });
        if (invErr) console.warn("[TORO] Invite creation failed (non-blocking):", invErr);
        toast.success("Family created successfully!");
        setShowSetup(false);
        await loadData();
      }
    } catch (e: any) {
      console.error("[TORO] createFamily error:", e);
      toast.error("Error: " + e.message);
    }
  };

  const addChild = async () => {
    if (!family || !childName.trim()) return;
    const colors = ["#3A6A9C", "#D4A843", "#80D8FF", "#A5D6A7", "#FFD54F", "#FF8A65"];
    const color = colors[children.length % colors.length];
    const { error } = await supabase.from("children").insert({
      family_id: family.id, name: childName, year_level: yearLevel || null,
      school: school || null, bus_route_id: busRoute || null, avatar_color: color,
    });
    if (error) { toast.error("Failed to add child: " + error.message); return; }
    toast.success(`${childName} added!`);
    setChildName(""); setYearLevel(""); setSchool(""); setBusRoute("");
    setShowAddChild(false);
    loadData();
  };

  const removeChild = async (id: string) => {
    const { error } = await supabase.from("children").delete().eq("id", id);
    if (error) { toast.error("Failed to remove child: " + error.message); return; }
    setChildren(children.filter(c => c.id !== id));
  };

  const generateInvite = async () => {
    if (!family) return;
    const { data } = await supabase.from("family_invites").insert({ family_id: family.id, created_by: user?.id }).select().single();
    if (data) setInviteCode(data.code);
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#FAFBFC" }}>
        <p className="text-sm text-white/40">Sign in to set up your family</p>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center" style={{ background: "#FAFBFC" }}>
        <div className="max-w-sm w-full space-y-4">
          <div className="text-center mb-6">
            <Users size={32} style={{ color: HELM_COLOR }} className="mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white/90">Set Up Your Family</h2>
            <p className="text-xs text-white/40 mt-1">TORO needs to know about your family to help manage your schedule</p>
          </div>
          <input value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="Family name (e.g. The Smiths)"
            className="w-full bg-white/5 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-gray-300" />
          <select value={region} onChange={e => setRegion(e.target.value)}
            className="w-full bg-white/5 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-white/80"
            style={{ colorScheme: "dark" }}>
            {NZ_REGIONS.map(r => <option key={r} value={r} style={{ background: "#FAFBFC" }}>{r}</option>)}
          </select>
          <button onClick={createFamily} disabled={!familyName.trim()}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-30"
            style={{ background: HELM_COLOR + "20", color: HELM_COLOR, border: `1px solid ${HELM_COLOR}30` }}>
            Create Family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#FAFBFC" }}>
      <div className="flex items-center gap-2">
        <Settings2 size={16} style={{ color: HELM_COLOR }} />
        <h2 className="text-sm font-semibold text-white/90">Family Settings</h2>
      </div>

      {/* Family Info */}
      {family && (
        <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <h3 className="text-xs font-semibold text-white/60 mb-2">Family</h3>
          <p className="text-sm text-white/80">{family.name}</p>
          {family.nz_region && <p className="text-[10px] text-gray-400 mt-0.5">{family.nz_region}</p>}
        </div>
      )}

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white/60 flex items-center gap-1.5"><Baby size={12} /> Children</h3>
          <button onClick={() => setShowAddChild(true)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg hover:bg-white/5" style={{ color: HELM_COLOR }}>
            <Plus size={10} /> Add Child
          </button>
        </div>
        
        {showAddChild && (
          <div className="rounded-lg p-3 mb-3 space-y-2" style={{ background: HELM_COLOR + "08", border: `1px solid ${HELM_COLOR}15` }}>
            <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="Child's name"
              className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none" />
            <div className="flex gap-2">
              <select value={yearLevel} onChange={e => setYearLevel(e.target.value)}
                className="flex-1 bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80">
                <option value="">Year level</option>
                {Array.from({ length: 13 }, (_, i) => <option key={i + 1} value={`${i + 1}`}>Year {i + 1}</option>)}
              </select>
              <input value={school} onChange={e => setSchool(e.target.value)} placeholder="School"
                className="flex-1 bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none" />
            </div>
            <input value={busRoute} onChange={e => setBusRoute(e.target.value)} placeholder="Bus route ID (optional, e.g. 751)"
              className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={addChild} disabled={!childName.trim()} className="flex-1 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
                style={{ background: HELM_COLOR + "20", color: HELM_COLOR }}>Add</button>
              <button onClick={() => setShowAddChild(false)} className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:bg-white/5">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {children.map(child => (
            <div key={child.id} className="rounded-lg p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: child.avatar_color }}>
                {child.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-white/80">{child.name}</p>
                <p className="text-[10px] text-gray-400">{child.year_level ? `Year ${child.year_level}` : ""} {child.school ? `· ${child.school}` : ""}</p>
                {child.bus_route_id && <p className="text-[9px] text-white/20 font-mono">Bus: {child.bus_route_id}</p>}
              </div>
              <button onClick={() => removeChild(child.id)} className="p-1 rounded hover:bg-[#C85A54]/20 transition"><X size={12} className="text-[#C85A54]/50" /></button>
            </div>
          ))}
          {children.length === 0 && <p className="text-xs text-white/25 py-4 text-center">No children added yet</p>}
        </div>
      </div>

      {/* SMS Settings */}
      <HelmSmsSettings familyId={family?.id || null} />

      {/* Invite Co-parent */}
      <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5"><Share2 size={12} /> Invite Co-parent</h3>
        {inviteCode ? (
          <div className="flex items-center gap-2">
            <code className="text-xs px-3 py-1.5 rounded bg-white/5 text-white/70 font-mono flex-1">{inviteCode}</code>
            <button onClick={() => navigator.clipboard.writeText(inviteCode)} className="text-[10px] px-2 py-1 rounded-lg hover:bg-white/5" style={{ color: HELM_COLOR }}>Copy</button>
          </div>
        ) : (
          <button onClick={generateInvite} className="text-[10px] px-3 py-1.5 rounded-lg hover:bg-white/5" style={{ color: HELM_COLOR }}>Generate Invite Code</button>
        )}
        <p className="text-[9px] text-white/20 mt-2">Share this code with your partner to give them access to the family calendar</p>
      </div>
    </div>
  );
}
