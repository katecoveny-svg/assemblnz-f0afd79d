import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X, BookOpen } from "lucide-react";

const HELM_COLOR = "#3A6A9C";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6];

const DEFAULT_GEAR_RULES: Record<string, string[]> = {
  Swimming: ["Togs", "Towel", "Goggles", "Swim cap"],
  PE: ["Sports shoes", "Drink bottle", "Shorts", "T-shirt"],
  Art: ["Art smock", "Old shirt"],
  Music: ["Instrument", "Music book"],
  Technology: ["Closed-toe shoes", "Apron"],
  Science: ["Safety glasses", "Lab coat"],
  Dance: ["Dance shoes", "Leotard"],
};

interface Child { id: string; name: string; avatar_color: string; }
interface TimetableEntry { id: string; child_id: string; day_of_week: number; period: number; subject: string; }
interface GearRule { id: string; subject: string; items: string[]; }

export default function HelmTimetable({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [gearRules, setGearRules] = useState<GearRule[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ day: number; period: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showGearRules, setShowGearRules] = useState(false);
  const [showAddGear, setShowAddGear] = useState(false);
  const [newGearSubject, setNewGearSubject] = useState("");
  const [newGearItems, setNewGearItems] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
      if (fm) {
        setFamilyId(fm.family_id);
        const [kids, rules] = await Promise.all([
          supabase.from("children").select("*").eq("family_id", fm.family_id),
          supabase.from("gear_rules").select("*").eq("family_id", fm.family_id),
        ]);
        const kidsList = kids.data || [];
        setChildren(kidsList);
        setGearRules(rules.data || []);
        if (kidsList.length > 0) setSelectedChild(kidsList[0].id);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedChild || !familyId) return;
    (async () => {
      const { data } = await supabase.from("timetables").select("*").eq("child_id", selectedChild);
      setTimetable(data || []);
    })();
  }, [selectedChild, familyId]);

  const getSubject = (day: number, period: number) => {
    return timetable.find(t => t.day_of_week === day && t.period === period)?.subject || "";
  };

  const saveCell = async () => {
    if (!editingCell || !selectedChild || !familyId) return;
    const { day, period } = editingCell;
    const existing = timetable.find(t => t.day_of_week === day && t.period === period);
    
    if (editValue.trim()) {
      if (existing) {
        await supabase.from("timetables").update({ subject: editValue.trim() }).eq("id", existing.id);
        setTimetable(timetable.map(t => t.id === existing.id ? { ...t, subject: editValue.trim() } : t));
      } else {
        const { data } = await supabase.from("timetables").insert({
          family_id: familyId, child_id: selectedChild, day_of_week: day, period, subject: editValue.trim()
        }).select().single();
        if (data) setTimetable([...timetable, data]);
      }
    } else if (existing) {
      await supabase.from("timetables").delete().eq("id", existing.id);
      setTimetable(timetable.filter(t => t.id !== existing.id));
    }
    setEditingCell(null);
    setEditValue("");
  };

  const loadDefaults = async () => {
    if (!familyId) return;
    const inserts = Object.entries(DEFAULT_GEAR_RULES).map(([subject, items]) => ({
      family_id: familyId, subject, items,
    }));
    const { data } = await supabase.from("gear_rules").insert(inserts).select();
    if (data) setGearRules([...gearRules, ...data]);
  };

  const addGearRule = async () => {
    if (!familyId || !newGearSubject.trim() || !newGearItems.trim()) return;
    const items = newGearItems.split(",").map(s => s.trim()).filter(Boolean);
    const { data } = await supabase.from("gear_rules").insert({
      family_id: familyId, subject: newGearSubject.trim(), items,
    }).select().single();
    if (data) setGearRules([...gearRules, data]);
    setNewGearSubject(""); setNewGearItems(""); setShowAddGear(false);
  };

  const deleteGearRule = async (id: string) => {
    await supabase.from("gear_rules").delete().eq("id", id);
    setGearRules(gearRules.filter(r => r.id !== id));
  };

  const child = children.find(c => c.id === selectedChild);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "transparent" }}>
      {/* Child Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} style={{ color: HELM_COLOR }} />
          <h2 className="text-sm font-semibold text-white/90">School Timetable</h2>
        </div>
        <div className="flex items-center gap-2">
          {children.length > 1 && (
            <select value={selectedChild || ""} onChange={e => setSelectedChild(e.target.value)}
              className="bg-white/5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-white/80">
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button onClick={() => setShowGearRules(!showGearRules)} className="text-[10px] px-2 py-1 rounded-lg transition hover:bg-white/5" style={{ color: HELM_COLOR }}>
            {showGearRules ? "Timetable" : "Gear Rules"}
          </button>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={32} style={{ color: HELM_COLOR }} className="mx-auto opacity-30 mb-3" />
          <p className="text-sm text-white/40">Add children in Settings to set up timetables</p>
        </div>
      ) : showGearRules ? (
        /* Gear Rules View */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white/60">Subject → Gear Mapping</h3>
            <div className="flex gap-2">
              {gearRules.length === 0 && (
                <button onClick={loadDefaults} className="text-[10px] px-2 py-1 rounded-lg hover:bg-white/5" style={{ color: HELM_COLOR }}>Load NZ Defaults</button>
              )}
              <button onClick={() => setShowAddGear(true)} className="text-[10px] px-2 py-1 rounded-lg hover:bg-white/5" style={{ color: HELM_COLOR }}>+ Add Rule</button>
            </div>
          </div>

          {showAddGear && (
            <div className="rounded-lg p-3 space-y-2" style={{ background: HELM_COLOR + "08", border: `1px solid ${HELM_COLOR}15` }}>
              <input value={newGearSubject} onChange={e => setNewGearSubject(e.target.value)} placeholder="Subject or activity name"
                className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none" />
              <input value={newGearItems} onChange={e => setNewGearItems(e.target.value)} placeholder="Items (comma-separated, e.g. Togs, Towel, Goggles)"
                className="w-full bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={addGearRule} disabled={!newGearSubject.trim() || !newGearItems.trim()}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
                  style={{ background: HELM_COLOR + "20", color: HELM_COLOR }}>Save Rule</button>
                <button onClick={() => { setShowAddGear(false); setNewGearSubject(""); setNewGearItems(""); }}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:bg-white/5">Cancel</button>
              </div>
            </div>
          )}

          {gearRules.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No gear rules set. Load defaults or add custom rules.</p>
          ) : (
            gearRules.map(rule => (
              <div key={rule.id} className="rounded-lg p-3 flex items-start gap-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex-1">
                  <p className="text-xs font-medium text-white/80 mb-1">{rule.subject}</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.items.map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: HELM_COLOR + "15", color: HELM_COLOR }}>{item}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => deleteGearRule(rule.id)} className="p-1 rounded hover:bg-[#C85A54]/20 transition shrink-0">
                  <X size={10} className="text-[#C85A54]/50" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Timetable Grid */
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-400 font-medium w-12">P</th>
                {DAYS.map(d => <th key={d} className="p-2 text-center text-white/40 font-medium">{d.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period}>
                  <td className="p-1.5 text-white/20 font-mono text-center">{period}</td>
                  {DAYS.map((_, dayIdx) => {
                    const day = dayIdx + 1;
                    const subject = getSubject(day, period);
                    const isEditing = editingCell?.day === day && editingCell?.period === period;
                    const gearRule = gearRules.find(r => r.subject.toLowerCase() === subject.toLowerCase());
                    
                    return (
                      <td key={day} className="p-1">
                        {isEditing ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
                            onBlur={saveCell} onKeyDown={e => e.key === "Enter" && saveCell()}
                            className="w-full bg-white/10 border border-gray-300 rounded px-2 py-1.5 text-xs text-foreground focus:outline-none text-center"
                            style={{ borderColor: HELM_COLOR + "60" }} />
                        ) : (
                          <button onClick={() => { setEditingCell({ day, period }); setEditValue(subject); }}
                            className="w-full rounded-lg px-2 py-2 text-center transition hover:bg-white/5 min-h-[36px] relative"
                            style={{ background: subject ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)", border: `1px solid ${subject ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)"}` }}>
                            <span className="text-white/70">{subject || "—"}</span>
                            {gearRule && <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: HELM_COLOR }} title={gearRule.items.join(", ")} />}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tomorrow's Gear Preview */}
      {!showGearRules && timetable.length > 0 && gearRules.length > 0 && (
        <div className="rounded-lg p-3" style={{ background: HELM_COLOR + "08", border: `1px solid ${HELM_COLOR}15` }}>
          <h3 className="text-[10px] font-semibold mb-2" style={{ color: HELM_COLOR }}>Tomorrow's Gear</h3>
          {(() => {
            const tomorrow = (new Date().getDay() % 5) + 1;
            const subjects = timetable.filter(t => t.day_of_week === tomorrow).map(t => t.subject);
            const gear = new Set<string>();
            subjects.forEach(s => {
              const rule = gearRules.find(r => r.subject.toLowerCase() === s.toLowerCase());
              rule?.items.forEach(i => gear.add(i));
            });
            const items = Array.from(gear);
            return items.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {items.map(i => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60">{i}</span>)}
              </div>
            ) : <p className="text-[10px] text-gray-400">No special gear needed</p>;
          })()}
        </div>
      )}
    </div>
  );
}
