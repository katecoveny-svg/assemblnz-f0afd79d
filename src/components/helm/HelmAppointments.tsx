import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Calendar, Clock, MapPin, User, Bell, Trash2, Check, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { value: "medical", label: "Medical", emoji: "🏥", color: "text-[#C85A54]" },
  { value: "school", label: "School", emoji: "🏫", color: "text-yellow-400" },
  { value: "sport", label: "Sport", emoji: "⚽", color: "text-[#5AADA0]" },
  { value: "social", label: "Social", emoji: "🎉", color: "text-pink-400" },
  { value: "home", label: "Home", emoji: "🏠", color: "text-blue-400" },
  { value: "work", label: "Work", emoji: "💼", color: "text-pounamu" },
  { value: "pet", label: "Pet", emoji: "🐾", color: "text-orange-400" },
  { value: "general", label: "General", emoji: "📌", color: "text-white/60" },
] as const;

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  category: string;
  for_member: string | null;
  status: string;
  recurring: string | null;
  created_at: string;
}

export default function HelmAppointments({ familyId }: { familyId: string | null }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [view, setView] = useState<"upcoming" | "week">("upcoming");
  const [form, setForm] = useState({
    title: "", description: "", location: "", date: new Date().toISOString().slice(0, 10),
    time: "09:00", endTime: "", category: "general", forMember: "", allDay: false,
  });

  useEffect(() => {
    if (!familyId) return;
    const load = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("helm_appointments" as any)
        .select("*")
        .eq("family_id", familyId)
        .gte("start_time", now)
        .neq("status", "cancelled")
        .order("start_time")
        .limit(50);
      setAppointments((data || []) as unknown as Appointment[]);
    };
    load();

    const channel = supabase
      .channel(`appts-${familyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "helm_appointments", filter: `family_id=eq.${familyId}` }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [familyId]);

  const handleAdd = useCallback(async () => {
    if (!form.title.trim() || !familyId || !user) return;
    const startTime = form.allDay
      ? new Date(`${form.date}T00:00:00`).toISOString()
      : new Date(`${form.date}T${form.time}`).toISOString();
    const endTime = form.endTime ? new Date(`${form.date}T${form.endTime}`).toISOString() : null;

    await supabase.from("helm_appointments" as any).insert({
      family_id: familyId,
      title: form.title.trim(),
      description: form.description || null,
      location: form.location || null,
      start_time: startTime,
      end_time: endTime,
      all_day: form.allDay,
      category: form.category,
      for_member: form.forMember || null,
      booked_via: "app",
      created_by: user.id,
    } as any);

    setForm({ title: "", description: "", location: "", date: new Date().toISOString().slice(0, 10), time: "09:00", endTime: "", category: "general", forMember: "", allDay: false });
    setShowForm(false);
  }, [form, familyId, user]);

  const cancelAppt = useCallback(async (id: string) => {
    await supabase.from("helm_appointments" as any).update({ status: "cancelled" } as any).eq("id", id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" });
  };

  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
  const isTomorrow = (iso: string) => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return new Date(iso).toDateString() === t.toDateString();
  };

  // Group appointments by date
  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const key = new Date(appt.start_time).toDateString();
    (acc[key] = acc[key] || []).push(appt);
    return acc;
  }, {});

  if (!familyId) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-10 h-10 text-pounamu/40 mx-auto mb-3" />
        <p className="text-sm text-white/40">Set up your family first to use appointments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pounamu" />
          Appointments
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-pounamu text-foreground inline-flex items-center gap-1">
          <Plus className="w-3 h-3" /> Book
        </button>
      </div>

      {/* Today's count */}
      {appointments.filter(a => isToday(a.start_time)).length > 0 && (
        <div className="bg-pounamu/10 border border-pounamu/20 rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-pounamu">
            {appointments.filter(a => isToday(a.start_time)).length} appointment{appointments.filter(a => isToday(a.start_time)).length !== 1 ? "s" : ""} today
          </p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white/5 border border-gray-200 rounded-xl p-4 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Appointment title (e.g. Max dentist)"
            className="w-full text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pounamu/50"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              type="date"
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground focus:outline-none focus:ring-2 focus:ring-pounamu/50"
            />
            {!form.allDay && (
              <input
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                type="time"
                className="w-28 text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground focus:outline-none focus:ring-2 focus:ring-pounamu/50"
              />
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location (optional)"
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pounamu/50"
            />
            <input
              value={form.forMember}
              onChange={(e) => setForm({ ...form, forMember: e.target.value })}
              placeholder="For who?"
              className="w-28 text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pounamu/50"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setForm({ ...form, category: c.value })}
                className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium ${form.category === c.value ? "bg-pounamu text-foreground border-pounamu" : "bg-white/5 border-gray-200 text-gray-500"}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} className="rounded" />
            All day
          </label>
          <button onClick={handleAdd} className="w-full text-sm py-2 rounded-lg font-semibold bg-pounamu text-foreground">
            Book Appointment
          </button>
        </div>
      )}

      {/* Appointment list grouped by day */}
      {Object.entries(grouped).length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No upcoming appointments</p>
          <p className="text-xs text-pounamu/60 mt-1 font-mono">"Book dentist for Max on Tuesday at 2pm"</p>
        </div>
      )}

      {Object.entries(grouped).map(([dateStr, dayAppts]) => {
        const dateLabel = formatDate(dayAppts[0].start_time);
        const todayHighlight = isToday(dayAppts[0].start_time);
        const tomorrowHighlight = isTomorrow(dayAppts[0].start_time);
        return (
          <div key={dateStr} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-widest ${todayHighlight ? "text-pounamu" : tomorrowHighlight ? "text-cyan-400" : "text-gray-400"}`}>
                {dateLabel}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            {dayAppts.map(appt => {
              const cat = CATEGORIES.find(c => c.value === appt.category);
              return (
                <div key={appt.id} className="bg-white/5 rounded-xl border border-gray-100 p-3.5 flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center">
                    <span className="text-sm">{cat?.emoji || "📌"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/90">{appt.title}</div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {!appt.all_day && (
                        <span className="text-xs text-white/40 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(appt.start_time)}
                          {appt.end_time && ` – ${formatTime(appt.end_time)}`}
                        </span>
                      )}
                      {appt.all_day && <span className="text-xs text-white/40">All day</span>}
                      {appt.location && (
                        <span className="text-xs text-white/40 inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {appt.location}
                        </span>
                      )}
                      {appt.for_member && (
                        <span className="text-xs text-cyan-400/60 inline-flex items-center gap-1">
                          <User className="w-3 h-3" /> {appt.for_member}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => cancelAppt(appt.id)} className="text-white/20 hover:text-[#C85A54] transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
