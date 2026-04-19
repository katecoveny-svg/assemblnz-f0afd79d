import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Phone, Pill, AlertTriangle, Heart, Activity, Home, Shield, TrendingUp, TrendingDown, Minus, Clock, CheckCircle, XCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const KOKKOWAI = "#A52A2A";

const CareDashboard = () => {
  const { seniorId } = useParams();
  const { user } = useAuth();
  const [senior, setSenior] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [safetyAssessments, setSafetyAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !seniorId) return;
    const load = async () => {
      setLoading(true);
      const [seniorRes, checkInsRes, alertsRes, medsRes, journeysRes, safetyRes] = await Promise.all([
        supabase.from("senior_profiles").select("*").eq("id", seniorId).single(),
        supabase.from("check_ins").select("*").eq("senior_id", seniorId).order("scheduled_at", { ascending: false }).limit(14),
        supabase.from("care_alerts").select("*").eq("senior_id", seniorId).is("resolved_at", null).order("created_at", { ascending: false }).limit(10),
        supabase.from("medication_schedules").select("*").eq("senior_id", seniorId).eq("active", true),
        supabase.from("care_journeys").select("*").eq("senior_id", seniorId).order("created_at", { ascending: false }),
        supabase.from("home_safety_assessments").select("*").eq("senior_id", seniorId).order("created_at", { ascending: false }).limit(1),
      ]);
      setSenior(seniorRes.data);
      setCheckIns(checkInsRes.data || []);
      setAlerts(alertsRes.data || []);
      setMedications(medsRes.data || []);
      setJourneys(journeysRes.data || []);
      setSafetyAssessments(safetyRes.data || []);
      setLoading(false);
    };
    load();
  }, [user, seniorId]);

  const latestCheckIn = checkIns[0];
  const moodData = checkIns.filter(c => c.mood_score).map(c => ({
    date: new Date(c.scheduled_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" }),
    mood: c.mood_score,
  })).reverse();

  const moodTrend = moodData.length >= 3 ? (() => {
    const recent = moodData.slice(-3).reduce((s, d) => s + d.mood, 0) / 3;
    const earlier = moodData.slice(-6, -3);
    if (earlier.length === 0) return "stable";
    const earlyAvg = earlier.reduce((s, d) => s + d.mood, 0) / earlier.length;
    return recent > earlyAvg + 0.5 ? "improving" : recent < earlyAvg - 0.5 ? "declining" : "stable";
  })() : "stable";

  const overallStatus = alerts.some(a => a.priority === "critical") ? "red" : alerts.some(a => a.priority === "high") ? "amber" : "green";
  const statusColor = overallStatus === "red" ? KOKKOWAI : overallStatus === "amber" ? KOWHAI : POUNAMU;

  const moodEmoji = (score: number) => score >= 8 ? "😊" : score >= 6 ? "🙂" : score >= 4 ? "😐" : score >= 2 ? "😟" : "😢";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFBFC" }}>
      <div className="animate-pulse text-sm" style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading care dashboard…</div>
    </div>
  );

  if (!senior) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#FAFBFC" }}>
      <p className="text-sm" style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Senior profile not found</p>
      <Link to="/" className="text-xs underline" style={{ color: KOWHAI }}>Back to home</Link>
    </div>
  );

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={className} style={{
      background: "rgba(255,255,255,0.65)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(212, 168, 67, 0.12)",
      borderRadius: "16px",
      padding: "24px",
    }}>{children}</div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#FAFBFC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title={`${senior.preferred_name || senior.first_name} — Care Dashboard`} description="Whānau care dashboard" />
      
      {/* Header */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(212,168,67,0.08)" }}>
        <Link to="/" className="flex items-center gap-2 text-xs mb-4" style={{ color: KOWHAI }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, textTransform: "uppercase", letterSpacing: "4px", fontSize: "24px", color: "#3D4250" }}>
              {senior.preferred_name || senior.first_name} {senior.last_name}
            </h1>
            <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
              {senior.date_of_birth ? `Age ${Math.floor((Date.now() - new Date(senior.date_of_birth).getTime()) / 31557600000)}` : ""} · {senior.city || senior.region || "NZ"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: statusColor }} />
            <span className="text-[10px] uppercase font-semibold" style={{ color: statusColor, fontFamily: "'Lato', sans-serif", letterSpacing: "2px" }}>
              {overallStatus === "red" ? "Needs attention" : overallStatus === "amber" ? "Monitor" : "All good"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto pb-20">
        {/* Last Check-in Summary */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold" style={{ color: KOWHAI, fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>Last check-in</span>
            {latestCheckIn && <span className="text-[10px]" style={{ color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date(latestCheckIn.completed_at || latestCheckIn.scheduled_at).toLocaleString("en-NZ", { dateStyle: "medium", timeStyle: "short" })}
            </span>}
          </div>
          {latestCheckIn ? (
            <div className="flex items-center gap-4">
              <span className="text-3xl">{moodEmoji(latestCheckIn.mood_score || 5)}</span>
              <div>
                <p className="text-sm" style={{ color: "#3D4250" }}>Mood: {latestCheckIn.mood_score || "—"}/10</p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  {latestCheckIn.mood_notes || "No notes from this check-in"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs" style={{ color: "#6B7280" }}>No check-ins yet. Start a check-in with ORA.</p>
          )}
          <div className="flex gap-2 mt-4">
            <Link to="/chat/healthcompanion" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: POUNAMU, color: "#3D4250" }}>
              <Phone size={12} /> Call ORA now
            </Link>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "transparent", border: `1px solid rgba(212,168,67,0.3)`, color: KOWHAI }}>
              <Pill size={12} /> Medications
            </button>
          </div>
        </Card>

        {/* Mood Timeline */}
        {moodData.length > 1 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold" style={{ color: KOWHAI, fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>Mood timeline</span>
              <div className="flex items-center gap-1">
                {moodTrend === "improving" ? <TrendingUp size={12} style={{ color: POUNAMU }} /> : moodTrend === "declining" ? <TrendingDown size={12} style={{ color: KOKKOWAI }} /> : <Minus size={12} style={{ color: "#6B7280" }} />}
                <span className="text-[10px] capitalize" style={{ color: moodTrend === "improving" ? POUNAMU : moodTrend === "declining" ? KOKKOWAI : "rgba(255,255,255,0.4)" }}>{moodTrend}</span>
              </div>
            </div>
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip contentStyle={{ background: "#FAFBFC", border: "1px solid rgba(212,168,67,0.2)", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="mood" stroke={POUNAMU} strokeWidth={2} dot={{ r: 3, fill: POUNAMU }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Card>
            <span className="text-[10px] uppercase font-bold block mb-3" style={{ color: KOKKOWAI, fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>Active alerts</span>
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(165,42,42,0.08)", border: "1px solid rgba(165,42,42,0.15)" }}>
                  <AlertTriangle size={14} style={{ color: a.priority === "critical" ? KOKKOWAI : a.priority === "high" ? "#FF6D00" : KOWHAI, marginTop: 2 }} />
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: "#3D4250" }}>{a.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{a.description}</p>
                    {a.recommended_action && <p className="text-[10px] mt-1 italic" style={{ color: POUNAMU }}>{a.recommended_action}</p>}
                  </div>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold" style={{
                    background: a.priority === "critical" ? "rgba(165,42,42,0.2)" : a.priority === "high" ? "rgba(255,109,0,0.15)" : "rgba(212,168,67,0.15)",
                    color: a.priority === "critical" ? KOKKOWAI : a.priority === "high" ? "#FF6D00" : KOWHAI,
                  }}>{a.priority}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Medication Tracker */}
        <Card>
          <span className="text-[10px] uppercase font-bold block mb-3" style={{ color: POUNAMU, fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>Medications</span>
          {medications.length === 0 ? (
            <p className="text-xs" style={{ color: "#6B7280" }}>No medications tracked yet</p>
          ) : (
            <div className="space-y-2">
              {medications.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(58,125,110,0.06)", border: "1px solid rgba(58,125,110,0.12)" }}>
                  <div className="flex items-center gap-2">
                    <Pill size={13} style={{ color: POUNAMU }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#3D4250" }}>{m.medication_name}</p>
                      <p className="text-[10px]" style={{ color: "#6B7280" }}>{m.dosage} · {m.frequency} {m.purpose ? `— ${m.purpose}` : ""}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Care Journeys */}
        {journeys.length > 0 && (
          <Card>
            <span className="text-[10px] uppercase font-bold block mb-3" style={{ color: "#1A3A5C", fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>Care journeys</span>
            <div className="space-y-3">
              {journeys.map(j => {
                const stages = ['referred', 'waitlisted', 'fsa_scheduled', 'fsa_completed', 'treatment_waitlisted', 'treatment_scheduled', 'treatment_completed', 'recovery', 'discharged'];
                const currentIdx = stages.indexOf(j.status);
                return (
                  <div key={j.id} className="p-3 rounded-xl" style={{ background: "rgba(26,58,92,0.08)", border: "1px solid rgba(26,58,92,0.15)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium" style={{ color: "#3D4250" }}>{j.speciality || j.referral_type}</p>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full" style={{ background: "rgba(26,58,92,0.2)", color: "#5A9ACC", fontFamily: "'JetBrains Mono', monospace" }}>
                        {j.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="flex gap-0.5 mt-2">
                      {stages.slice(0, 7).map((s, i) => (
                        <div key={s} className="h-1 flex-1 rounded-full" style={{ background: i <= currentIdx ? "#1A3A5C" : "rgba(255,255,255,0.5)" }} />
                      ))}
                    </div>
                    {j.facility && <p className="text-[10px] mt-2" style={{ color: "#6B7280" }}>{j.facility} · {j.region}</p>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Home Safety */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold" style={{ color: KOWHAI, fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>Home safety</span>
            {safetyAssessments[0] && <span className="text-[10px]" style={{ color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
              Score: {safetyAssessments[0].risk_score}/10
            </span>}
          </div>
          {safetyAssessments.length === 0 ? (
            <div>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>No safety assessment completed yet</p>
              <Link to="/chat/property" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium w-fit" style={{ background: "transparent", border: `1px solid rgba(212,168,67,0.3)`, color: KOWHAI }}>
                <Home size={12} /> Request assessment
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                Last assessed: {new Date(safetyAssessments[0].created_at).toLocaleDateString("en-NZ")} · Room: {safetyAssessments[0].room || "Full home"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CareDashboard;
