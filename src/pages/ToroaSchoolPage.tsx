import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface Newsletter { id: string; title: string; published_at: string; read: boolean; school_name: string | null; }
interface Slip { id: string; event_name: string; event_date: string | null; details: string | null; status: string; child_name: string | null; }
interface Event { id: string; title: string; event_date: string; event_time: string | null; location: string | null; }

type Tab = "newsletters" | "slips" | "events";

export default function ToroaSchoolPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("newsletters");
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("school_newsletters").select("*").eq("user_id", user.id).order("published_at", { ascending: false }),
      supabase.from("permission_slips").select("*").eq("user_id", user.id).order("event_date", { ascending: true }),
      supabase.from("school_events").select("*").eq("user_id", user.id).order("event_date", { ascending: true }),
    ]).then(([n, s, e]) => {
      if (n.data) setNewsletters(n.data as Newsletter[]);
      if (s.data) setSlips(s.data as Slip[]);
      if (e.data) setEvents(e.data as Event[]);
    });
  }, [user]);

  const respondSlip = async (id: string, status: "approved" | "declined") => {
    await supabase.from("permission_slips").update({ status, responded_at: new Date().toISOString() }).eq("id", id);
    setSlips((p) => p.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success(status === "approved" ? "Approved" : "Declined");
  };

  const markRead = async (id: string) => {
    await supabase.from("school_newsletters").update({ read: true }).eq("id", id);
    setNewsletters((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unread = newsletters.filter((n) => !n.read).length;

  const dateBadge = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return "bg-[#D9BC7A]/20";
    if (diff <= 7) return "bg-[#C7D9E8]/30";
    return "bg-[#EEE7DE]";
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <div className="max-w-md mx-auto px-4 pt-6 pb-10">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-[#C7D9E8]" />
            <select className="font-body text-sm bg-transparent text-[#6F6158] focus:outline-none">
              <option>Auckland Primary</option>
              <option>Wellington High</option>
            </select>
          </div>
          <button className="relative p-2 rounded-full bg-white border border-[#EEE7DE]">
            <Bell size={16} className="text-[#9D8C7D]" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D9BC7A] text-[#6F6158] text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
        </header>

        <h1 className="font-display text-2xl text-[#6F6158] mb-5">School</h1>

        <div className="flex gap-2 mb-6">
          {(["newsletters", "slips", "events"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-xs font-body transition-all ${
                tab === t ? "bg-[#C7D9E8]/30 text-[#6F6158] font-medium" : "text-[#9D8C7D] hover:bg-[#EEE7DE]"
              }`}
            >
              {t === "slips" ? "Permissions" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "newsletters" && (
          <div className="space-y-3">
            {newsletters.length === 0 && <div className="text-center text-sm font-body text-[#9D8C7D] py-10">No newsletters yet.</div>}
            {newsletters.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(111,97,88,0.06)] border border-[#EEE7DE] p-4 flex items-start gap-3">
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#D9BC7A] mt-2" />}
                <div className="w-10 h-10 rounded-full bg-[#C7D9E8]/30 flex items-center justify-center font-display text-sm text-[#6F6158]">{(n.school_name ?? "S")[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-body text-sm text-[#6F6158] truncate">{n.title}</div>
                  <div className="font-mono text-xs text-[#9D8C7D] mt-0.5">{new Date(n.published_at).toLocaleDateString("en-NZ")}</div>
                </div>
                <button onClick={() => markRead(n.id)} className="text-xs font-body text-[#9D8C7D] hover:text-[#6F6158]">Read</button>
              </div>
            ))}
          </div>
        )}

        {tab === "slips" && (
          <div className="space-y-3">
            {slips.length === 0 && <div className="text-center text-sm font-body text-[#9D8C7D] py-10">No permission slips.</div>}
            {slips.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(111,97,88,0.06)] border border-[#EEE7DE] p-4">
                <div className="font-body font-medium text-sm text-[#6F6158]">{s.event_name}</div>
                {s.event_date && <div className="font-mono text-xs text-[#9D8C7D] mt-0.5">{s.event_date}</div>}
                {s.details && <div className="font-body text-xs text-[#9D8C7D] mt-2">{s.details}</div>}
                {s.status === "pending" ? (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => respondSlip(s.id, "approved")} className="flex-1 bg-[#C9D8D0] text-[#6F6158] rounded-xl py-2 text-xs font-body font-medium">Approve</button>
                    <button onClick={() => respondSlip(s.id, "declined")} className="flex-1 bg-white border border-[#D8C8B4] text-[#9D8C7D] rounded-xl py-2 text-xs font-body">Decline</button>
                  </div>
                ) : (
                  <div className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-body bg-[#EEE7DE] text-[#6F6158]">{s.status}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-3">
            {events.length === 0 && <div className="text-center text-sm font-body text-[#9D8C7D] py-10">No upcoming events.</div>}
            {events.map((e) => {
              const d = new Date(e.event_date);
              return (
                <div key={e.id} className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(111,97,88,0.06)] border border-[#EEE7DE] p-4 flex items-center gap-4">
                  <div className={`rounded-xl p-2 text-center ${dateBadge(e.event_date)}`}>
                    <div className="font-display text-lg text-[#6F6158] leading-none">{d.getDate()}</div>
                    <div className="font-mono text-[10px] text-[#9D8C7D] uppercase">{d.toLocaleString("en-NZ", { month: "short" })}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm text-[#6F6158]">{e.title}</div>
                    <div className="font-mono text-xs text-[#9D8C7D]">{e.event_time ?? ""} {e.location ? `· ${e.location}` : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
