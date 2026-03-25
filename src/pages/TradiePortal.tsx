import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, Calendar, Check, X, Clock, User, MapPin, Star, Phone, Mail, ChevronLeft, ChevronRight, Briefcase, Shield } from "lucide-react";

interface TradieProfile {
  id: string;
  name: string;
  trade: string;
  phone: string | null;
  email: string | null;
  service_area: string | null;
  bio: string | null;
  tagline: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  rating: number | null;
  jobs_completed: number | null;
  website: string | null;
  licence_number: string | null;
  insurance_provider: string | null;
}

interface JobOffer {
  id: string;
  status: string | null;
  token: string | null;
  sent_at: string | null;
  job: {
    id: string;
    title: string;
    description: string | null;
    urgency: string | null;
    status: string | null;
    scheduled_date: string | null;
    budget_min: number | null;
    budget_max: number | null;
    access_instructions: string | null;
    property_address?: string;
    property_suburb?: string;
  };
}

interface AvailabilityDay {
  date: string;
  is_available: boolean;
}

const URGENCY_COLORS: Record<string, string> = {
  emergency: "#EF5350",
  high: "#FF6D00",
  medium: "#FFB300",
  low: "#66BB6A",
};

const TradiePortal = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [activeTab, setActiveTab] = useState<"jobs" | "availability" | "profile">("jobs");
  const [tradie, setTradie] = useState<TradieProfile | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile editing
  const [editBio, setEditBio] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) { setError("No access token provided."); setLoading(false); return; }
    try {
      // Get tradie by token
      const { data: tradieData, error: tErr } = await supabase
        .from("tradies")
        .select("*")
        .eq("availability_token", token)
        .single();
      if (tErr || !tradieData) { setError("Invalid or expired token."); setLoading(false); return; }
      setTradie(tradieData as TradieProfile);
      setEditBio(tradieData.bio || "");
      setEditTagline(tradieData.tagline || "");

      // Get job offers
      const { data: offersData } = await supabase
        .from("job_offers")
        .select("id, status, token, sent_at, job_id")
        .eq("tradie_id", tradieData.id);

      if (offersData && offersData.length > 0) {
        const jobIds = offersData.map((o: any) => o.job_id);
        const { data: jobsData } = await supabase
          .from("maintenance_jobs")
          .select("id, title, description, urgency, status, scheduled_date, budget_min, budget_max, access_instructions, property_id")
          .in("id", jobIds);

        const propertyIds = (jobsData || []).map((j: any) => j.property_id).filter(Boolean);
        const { data: propsData } = propertyIds.length > 0
          ? await supabase.from("properties").select("id, address, suburb").in("id", propertyIds)
          : { data: [] };

        const propMap = new Map((propsData || []).map((p: any) => [p.id, p]));
        const jobMap = new Map((jobsData || []).map((j: any) => [j.id, j]));

        const enriched = offersData.map((o: any) => {
          const job = jobMap.get(o.job_id) || {};
          const prop = propMap.get((job as any).property_id);
          return {
            ...o,
            job: {
              ...(job as any),
              property_address: prop?.address,
              property_suburb: prop?.suburb,
            },
          };
        });
        setOffers(enriched as JobOffer[]);
      }

      // Get availability
      const { data: availData } = await supabase
        .from("tradie_availability")
        .select("available_date, is_available")
        .eq("tradie_id", tradieData.id);
      setAvailability((availData || []).map((a: any) => ({ date: a.available_date, is_available: a.is_available })));
    } catch {
      setError("Failed to load portal data.");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const respondToOffer = async (offerId: string, accept: boolean) => {
    await supabase.from("job_offers").update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    }).eq("id", offerId);
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: accept ? "accepted" : "declined" } : o));
  };

  const toggleAvailability = async (dateStr: string) => {
    if (!tradie) return;
    const existing = availability.find(a => a.date === dateStr);
    if (existing) {
      const newVal = !existing.is_available;
      await supabase.from("tradie_availability")
        .update({ is_available: newVal })
        .eq("tradie_id", tradie.id)
        .eq("available_date", dateStr);
      setAvailability(prev => prev.map(a => a.date === dateStr ? { ...a, is_available: newVal } : a));
    } else {
      await supabase.from("tradie_availability").insert({
        tradie_id: tradie.id,
        available_date: dateStr,
        is_available: false,
      });
      setAvailability(prev => [...prev, { date: dateStr, is_available: false }]);
    }
  };

  const saveProfile = async () => {
    if (!tradie) return;
    setSaving(true);
    await supabase.from("tradies").update({ bio: editBio, tagline: editTagline }).eq("id", tradie.id);
    setTradie(prev => prev ? { ...prev, bio: editBio, tagline: editTagline } : null);
    setSaving(false);
  };

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString("en-NZ", { month: "long", year: "numeric" });

  const getAvailStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = availability.find(a => a.date === dateStr);
    if (!entry) return "available";
    return entry.is_available ? "available" : "unavailable";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
      <div className="animate-pulse text-white/50 font-jakarta">Loading portal...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
      <div className="text-center space-y-3">
        <Wrench className="mx-auto" size={48} style={{ color: "#FF80AB" }} />
        <p className="text-white/70 font-jakarta">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090F] text-[#E4E4EC]">
      {/* Header */}
      <header className="border-b border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FF80AB20", border: "1px solid #FF80AB30" }}>
              <Wrench size={20} style={{ color: "#FF80AB" }} />
            </div>
            <div>
              <h1 className="font-syne font-bold text-lg">{tradie?.name}</h1>
              <p className="text-xs font-jakarta" style={{ color: "#FF80AB" }}>{tradie?.trade} · HAVEN Portal</p>
            </div>
          </div>
          {tradie?.rating ? (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} fill="#FFB300" color="#FFB300" />
              <span className="font-mono text-xs">{Number(tradie.rating).toFixed(1)}</span>
            </div>
          ) : null}
        </div>
      </header>

      {/* Tab Bar */}
      <div className="border-b border-white/5 px-4">
        <div className="max-w-3xl mx-auto flex gap-1">
          {(["jobs", "availability", "profile"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-3 text-xs font-medium capitalize transition-colors border-b-2"
              style={{
                borderColor: activeTab === tab ? "#FF80AB" : "transparent",
                color: activeTab === tab ? "#FF80AB" : "rgba(255,255,255,0.4)",
              }}>
              {tab === "jobs" ? "Job Offers" : tab === "availability" ? "Availability" : "My Profile"}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* JOB OFFERS */}
        {activeTab === "jobs" && (
          <>
            {offers.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Briefcase size={40} className="mx-auto" style={{ color: "rgba(255,255,255,0.15)" }} />
                <p className="text-sm text-white/40">No job offers yet</p>
              </div>
            ) : (
              offers.map(offer => (
                <div key={offer.id} className="rounded-xl p-4 space-y-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-syne font-bold text-sm">{offer.job.title}</h3>
                      {(offer.job.property_address || offer.job.property_suburb) && (
                        <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {offer.job.property_address}{offer.job.property_suburb ? `, ${offer.job.property_suburb}` : ""}
                        </p>
                      )}
                    </div>
                    {offer.job.urgency && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: (URGENCY_COLORS[offer.job.urgency] || "#FFB300") + "15",
                          color: URGENCY_COLORS[offer.job.urgency] || "#FFB300",
                        }}>
                        {offer.job.urgency}
                      </span>
                    )}
                  </div>
                  {offer.job.description && <p className="text-xs text-white/50 line-clamp-2">{offer.job.description}</p>}
                  <div className="flex flex-wrap gap-3 text-[10px] text-white/30">
                    {offer.job.scheduled_date && <span className="flex items-center gap-1"><Clock size={10} />{offer.job.scheduled_date}</span>}
                    {(offer.job.budget_min || offer.job.budget_max) && (
                      <span>${offer.job.budget_min || "?"} – ${offer.job.budget_max || "?"} NZD</span>
                    )}
                  </div>
                  {offer.job.access_instructions && (
                    <p className="text-[10px] text-white/30 italic">Access: {offer.job.access_instructions}</p>
                  )}

                  {offer.status === "pending" ? (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => respondToOffer(offer.id, true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97]"
                        style={{ background: "#66BB6A20", color: "#66BB6A", border: "1px solid #66BB6A30" }}>
                        <Check size={14} /> Accept
                      </button>
                      <button onClick={() => respondToOffer(offer.id, false)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97]"
                        style={{ background: "#EF535020", color: "#EF5350", border: "1px solid #EF535030" }}>
                        <X size={14} /> Decline
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-medium capitalize" style={{
                      color: offer.status === "accepted" ? "#66BB6A" : "#EF5350",
                    }}>
                      {offer.status === "accepted" ? " Accepted" : " Declined"}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* AVAILABILITY CALENDAR */}
        {activeTab === "availability" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="font-syne font-bold text-sm">{monthName}</span>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/30 font-mono">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const status = getAvailStatus(day);
                const isPast = new Date(dateStr) < new Date(new Date().toISOString().split("T")[0]);
                return (
                  <button key={day} onClick={() => !isPast && toggleAvailability(dateStr)}
                    disabled={isPast}
                    className="aspect-square rounded-lg text-xs font-mono flex items-center justify-center transition-all active:scale-[0.95]"
                    style={{
                      background: isPast ? "rgba(255,255,255,0.02)" : status === "available" ? "#66BB6A15" : "#EF535015",
                      color: isPast ? "rgba(255,255,255,0.15)" : status === "available" ? "#66BB6A" : "#EF5350",
                      border: `1px solid ${isPast ? "transparent" : status === "available" ? "#66BB6A20" : "#EF535020"}`,
                      cursor: isPast ? "default" : "pointer",
                    }}>
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 text-[10px] text-white/40 justify-center">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[#66BB6A30]" /> Available</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[#EF535030]" /> Unavailable</span>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && tradie && (
          <div className="space-y-6">
            <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold" style={{ background: "#FF80AB20", color: "#FF80AB" }}>
                  {tradie.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-syne font-bold">{tradie.name}</h2>
                  <p className="text-xs" style={{ color: "#FF80AB" }}>{tradie.trade}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {tradie.phone && <div className="flex items-center gap-1.5 text-white/50"><Phone size={12} />{tradie.phone}</div>}
                {tradie.email && <div className="flex items-center gap-1.5 text-white/50"><Mail size={12} />{tradie.email}</div>}
                {tradie.service_area && <div className="flex items-center gap-1.5 text-white/50"><MapPin size={12} />{tradie.service_area}</div>}
                {tradie.licence_number && <div className="flex items-center gap-1.5 text-white/50"><Shield size={12} />{tradie.licence_number}</div>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-white/40 font-mono">Tagline</label>
              <input value={editTagline} onChange={e => setEditTagline(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#FF80AB30]"
                placeholder="e.g. Reliable plumber serving Auckland" />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-white/40 font-mono">Bio</label>
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={5}
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#FF80AB30] resize-none"
                placeholder="Tell property managers about your experience, qualifications, and service..." />
            </div>

            <button onClick={saveProfile} disabled={saving}
              className="w-full py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: "#FF80AB20", color: "#FF80AB", border: "1px solid #FF80AB30" }}>
              {saving ? "Saving..." : "Save Profile"}
            </button>

            {tradie.specialties && tradie.specialties.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-white/40 font-mono">Specialties</span>
                <div className="flex flex-wrap gap-1.5">
                  {tradie.specialties.map(s => (
                    <span key={s} className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#FF80AB10", color: "#FF80AB" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {tradie.certifications && tradie.certifications.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-white/40 font-mono">Certifications</span>
                <div className="flex flex-wrap gap-1.5">
                  {tradie.certifications.map(c => (
                    <span key={c} className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-[10px] text-white/20 font-jakarta">
        HAVEN by Assembl · Tradie Portal
      </footer>
    </div>
  );
};

export default TradiePortal;
