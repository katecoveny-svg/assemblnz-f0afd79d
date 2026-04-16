import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight, Plus, Check, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";

const HELM_COLOR = "#3A6A9C";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// NZ School Terms 2026
const NZ_TERMS_2026 = [
  { term: 1, start: new Date(2026, 1, 3), end: new Date(2026, 3, 2) },
  { term: 2, start: new Date(2026, 3, 20), end: new Date(2026, 6, 3) },
  { term: 3, start: new Date(2026, 6, 20), end: new Date(2026, 8, 25) },
  { term: 4, start: new Date(2026, 9, 12), end: new Date(2026, 11, 15) },
];

const NZ_HOLIDAYS_2026 = [
  { name: "New Year's Day", date: new Date(2026, 0, 1) },
  { name: "Day after New Year's", date: new Date(2026, 0, 2) },
  { name: "Waitangi Day", date: new Date(2026, 1, 6) },
  { name: "Good Friday", date: new Date(2026, 3, 3) },
  { name: "Easter Monday", date: new Date(2026, 3, 6) },
  { name: "ANZAC Day", date: new Date(2026, 3, 25) },
  { name: "King's Birthday", date: new Date(2026, 5, 1) },
  { name: "Matariki", date: new Date(2026, 6, 10) },
  { name: "Labour Day", date: new Date(2026, 9, 26) },
  { name: "Christmas Day", date: new Date(2026, 11, 25) },
  { name: "Boxing Day", date: new Date(2026, 11, 26) },
];

function isSchoolDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  if (NZ_HOLIDAYS_2026.some(h => isSameDay(h.date, date))) return false;
  return NZ_TERMS_2026.some(t => date >= t.start && date <= t.end);
}

function getCurrentTerm(date: Date) {
  return NZ_TERMS_2026.find(t => date >= t.start && date <= t.end);
}

interface Event { id: string; title: string; start_at: string; location?: string; child_id?: string; notes?: string; }
interface Task { id: string; title: string; due_at?: string; completed: boolean; child_id?: string; }
interface Child { id: string; name: string; avatar_color: string; }
interface PackingItem { id: string; item_name: string; packed: boolean; event_id?: string; child_id?: string; }
interface GearRule { id: string; subject: string; items: string[]; }
interface TimetableEntry { id: string; child_id: string; day_of_week: number; period: number; subject: string; }

export default function HelmThisWeek({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [gearRules, setGearRules] = useState<GearRule[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
      if (fm) {
        setFamilyId(fm.family_id);
        const weekEnd = addDays(weekStart, 7);
        const [evts, tsks, kids, packing, rules, tt] = await Promise.all([
          supabase.from("events").select("*").eq("family_id", fm.family_id).gte("start_at", weekStart.toISOString()).lt("start_at", weekEnd.toISOString()).order("start_at"),
          supabase.from("tasks").select("*").eq("family_id", fm.family_id).eq("completed", false).order("due_at"),
          supabase.from("children").select("*").eq("family_id", fm.family_id),
          supabase.from("packing_items").select("*").eq("family_id", fm.family_id).eq("packed", false),
          supabase.from("gear_rules").select("*").eq("family_id", fm.family_id),
          supabase.from("timetables").select("*").eq("family_id", fm.family_id),
        ]);
        setEvents(evts.data || []);
        setTasks(tsks.data || []);
        setChildren(kids.data || []);
        setPackingItems(packing.data || []);
        setGearRules(rules.data || []);
        setTimetableEntries(tt.data || []);
      }
    })();
  }, [user, weekStart]);

  const toggleTask = async (id: string) => {
    await supabase.from("tasks").update({ completed: true }).eq("id", id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const togglePacking = async (id: string) => {
    await supabase.from("packing_items").update({ packed: true }).eq("id", id);
    setPackingItems(packingItems.filter(p => p.id !== id));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const term = getCurrentTerm(new Date());
  const dayEvents = events.filter(e => isSameDay(new Date(e.start_at), selectedDay));

  const getChildName = (id?: string) => children.find(c => c.id === id)?.name;
  const getChildColor = (id?: string) => children.find(c => c.id === id)?.avatar_color || HELM_COLOR;

  // Demo data if no family set up
  const showDemo = !familyId;
  const demoEvents = [
    { id: "d1", title: "Swimming Sports", start_at: addDays(weekStart, 1).toISOString(), location: "Parnell Baths" },
    { id: "d2", title: "Science Fair Prep", start_at: addDays(weekStart, 2).toISOString(), location: "School Hall" },
    { id: "d3", title: "Dental Appointment", start_at: addDays(weekStart, 3).toISOString(), location: "Ponsonby Dental" },
    { id: "d4", title: "Cricket Practice", start_at: addDays(weekStart, 4).toISOString(), location: "Cornwall Park" },
  ];
  const demoTasks = [
    { id: "dt1", title: "Return library books", completed: false },
    { id: "dt2", title: "Pay school trip — $15", completed: false },
    { id: "dt3", title: "Sign permission slip", completed: false },
  ];

  const displayEvents = showDemo ? demoEvents : dayEvents;
  const displayTasks = showDemo ? demoTasks : tasks.slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#FAFBFC" }}>
      {/* Week Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-1.5 rounded-lg hover:bg-white/5 transition"><ChevronLeft size={16} className="text-gray-500" /></button>
        <div className="text-center">
          <h2 className="text-sm font-semibold text-white/90">{format(weekStart, "d MMM")} — {format(addDays(weekStart, 6), "d MMM yyyy")}</h2>
          {term && <p className="text-[10px] mt-0.5" style={{ color: HELM_COLOR }}>Term {term.term}</p>}
        </div>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-1.5 rounded-lg hover:bg-white/5 transition"><ChevronRight size={16} className="text-gray-500" /></button>
      </div>

      {/* Day Pills */}
      <div className="flex gap-1.5">
        {weekDays.map((day, i) => {
          const hasEvents = (showDemo ? demoEvents : events).some(e => isSameDay(new Date(e.start_at), day));
          const school = isSchoolDay(day);
          const selected = isSameDay(day, selectedDay);
          return (
            <button key={i} onClick={() => setSelectedDay(day)} className="flex-1 rounded-lg py-2 text-center transition-all relative"
              style={{ background: selected ? HELM_COLOR + "20" : "rgba(255,255,255,0.02)", border: `1px solid ${selected ? HELM_COLOR + "40" : "rgba(255,255,255,0.04)"}` }}>
              <div className="text-[9px] font-medium" style={{ color: selected ? HELM_COLOR : "rgba(255,255,255,0.4)" }}>{DAYS[i]}</div>
              <div className={`text-sm font-semibold ${isToday(day) ? "text-foreground" : "text-white/70"}`}>{format(day, "d")}</div>
              {hasEvents && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: HELM_COLOR }} />}
              {!school && day.getDay() !== 0 && day.getDay() !== 6 && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500/60" title="No school" />
              )}
            </button>
          );
        })}
      </div>

      {showDemo && (
        <div className="rounded-lg p-3 text-center" style={{ background: HELM_COLOR + "10", border: `1px solid ${HELM_COLOR}30` }}>
          <p className="text-xs text-white/70">Demo mode — <button onClick={() => onSendToChat?.("Set up my family")} className="underline" style={{ color: HELM_COLOR }}>set up your family</button> to see your real schedule</p>
        </div>
      )}

      {/* Events for Selected Day */}
      <div>
        <h3 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5">
          <Calendar size={12} style={{ color: HELM_COLOR }} />
          {format(selectedDay, "EEEE d MMMM")}
          {!isSchoolDay(selectedDay) && selectedDay.getDay() !== 0 && selectedDay.getDay() !== 6 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-[#D4A843]">Holiday</span>
          )}
        </h3>
        {displayEvents.length === 0 ? (
          <div className="rounded-lg p-4 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-xs text-gray-400">Nothing scheduled</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayEvents.map(evt => (
              <div key={evt.id} className="rounded-lg p-3 flex gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderLeft: `3px solid ${getChildColor((evt as any).child_id)}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90">{evt.title}</p>
                  {evt.location && <p className="text-[11px] text-white/40 mt-0.5">{evt.location}</p>}
                  {(evt as any).child_id && <span className="text-[9px] px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ background: getChildColor((evt as any).child_id) + "20", color: getChildColor((evt as any).child_id) }}>{getChildName((evt as any).child_id)}</span>}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">{format(new Date(evt.start_at), "h:mm a")}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto Gear List from Timetable */}
      {gearRules.length > 0 && isSchoolDay(selectedDay) && (
        <div>
          <h3 className="text-xs font-semibold text-white/60 mb-2"> Gear Needed — {format(selectedDay, "EEEE")}</h3>
          {(() => {
            const dayOfWeek = selectedDay.getDay() === 0 ? 7 : selectedDay.getDay(); // 1=Mon
            const daySubjects = timetableEntries
              .filter(t => t.day_of_week === dayOfWeek)
              .map(t => t.subject);
            const gearItems = new Map<string, string[]>();
            daySubjects.forEach(subject => {
              const rule = gearRules.find(r => r.subject.toLowerCase() === subject.toLowerCase());
              if (rule) {
                rule.items.forEach(item => {
                  if (!gearItems.has(item)) gearItems.set(item, []);
                  if (!gearItems.get(item)!.includes(subject)) gearItems.get(item)!.push(subject);
                });
              }
            });
            const items = Array.from(gearItems.entries());
            return items.length > 0 ? (
              <div className="space-y-1">
                {items.map(([item, subjects]) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: HELM_COLOR }} />
                    <span className="text-xs text-white/70 flex-1">{item}</span>
                    <span className="text-[9px] text-white/25">{subjects.join(", ")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 px-3 py-2">No special gear needed from timetable</p>
            );
          })()}
        </div>
      )}

      {/* Manual Packing List */}
      {packingItems.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/60 mb-2"> Packing List</h3>
          <div className="space-y-1">
            {packingItems.slice(0, 10).map(item => (
              <button key={item.id} onClick={() => togglePacking(item.id)} className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-4 h-4 rounded border flex items-center justify-center" style={{ borderColor: HELM_COLOR + "40" }}>
                  {item.packed && <Check size={10} style={{ color: HELM_COLOR }} />}
                </div>
                <span className="text-xs text-white/70">{item.item_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div>
        <h3 className="text-xs font-semibold text-white/60 mb-2"> Tasks This Week</h3>
        <div className="space-y-1">
          {displayTasks.map(task => (
            <button key={task.id} onClick={() => !showDemo && toggleTask(task.id)} className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="w-4 h-4 rounded border flex items-center justify-center" style={{ borderColor: HELM_COLOR + "40" }}>
                {task.completed && <Check size={10} style={{ color: HELM_COLOR }} />}
              </div>
              <span className="text-xs text-white/70">{task.title}</span>
            </button>
          ))}
          {displayTasks.length === 0 && <p className="text-xs text-gray-400 px-3 py-2">No tasks this week </p>}
        </div>
      </div>
    </div>
  );
}
