import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, MapPin, FileText, TrendingUp } from "lucide-react";

const NAVY = "#1A3A5C";
const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

interface VitaeCareJourneysProps {
  onSendToChat: (msg: string) => void;
}

const STAGES = [
  { key: "referred", label: "Referred" },
  { key: "waitlisted", label: "Waitlisted" },
  { key: "fsa_scheduled", label: "FSA Scheduled" },
  { key: "fsa_completed", label: "FSA Done" },
  { key: "treatment_waitlisted", label: "Treatment Wait" },
  { key: "treatment_scheduled", label: "Treatment Scheduled" },
  { key: "treatment_completed", label: "Treatment Done" },
  { key: "recovery", label: "Recovery" },
  { key: "discharged", label: "Discharged" },
];

const VitaeCareJourneys = ({ onSendToChat }: VitaeCareJourneysProps) => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("care_journeys").select("*, senior_profiles(first_name, preferred_name, last_name)").order("updated_at", { ascending: false });
      setJourneys(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-xs animate-pulse" style={{ color: "rgba(255,255,255,0.3)" }}>Loading journeys…</p></div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div>
        <p className="text-[10px] uppercase font-bold" style={{ color: NAVY, fontFamily: "'Lato', sans-serif", letterSpacing: "4px" }}>VITAE — CARE JOURNEYS</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Track referrals, waitlists, and specialist appointments</p>
      </div>

      {journeys.length === 0 ? (
        <div className="p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(212,168,67,0.12)" }}>
          <FileText size={24} style={{ color: NAVY, margin: "0 auto 12px" }} />
          <p className="text-sm font-medium" style={{ color: "#3D4250" }}>No care journeys tracked</p>
          <p className="text-xs mt-1 mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Ask VITAE to help you track a referral or specialist appointment.</p>
          <button onClick={() => onSendToChat("I have a specialist referral I'd like to track. Help me log the details.")}
            className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: NAVY, color: "#3D4250" }}>
            Track a referral
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {journeys.map(j => {
            const currentIdx = STAGES.findIndex(s => s.key === j.status);
            const seniorName = j.senior_profiles ? (j.senior_profiles.preferred_name || j.senior_profiles.first_name) + " " + j.senior_profiles.last_name : "Unknown";
            const daysSinceReferral = j.referral_date ? Math.floor((Date.now() - new Date(j.referral_date).getTime()) / 86400000) : null;

            return (
              <div key={j.id} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(26,58,92,0.2)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#3D4250" }}>{j.speciality || j.referral_type}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{seniorName}</p>
                  </div>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(26,58,92,0.2)", color: "#5A9ACC", fontFamily: "'JetBrains Mono', monospace" }}>
                    {j.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex gap-0.5 my-3">
                  {STAGES.map((s, i) => (
                    <div key={s.key} className="h-1.5 flex-1 rounded-full transition-all" style={{ background: i <= currentIdx ? NAVY : "rgba(255,255,255,0.5)" }} />
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {j.facility && <span className="flex items-center gap-1"><MapPin size={10} /> {j.facility}</span>}
                  {daysSinceReferral !== null && <span className="flex items-center gap-1"><Clock size={10} /> {daysSinceReferral} days since referral</span>}
                </div>

                <button
                  onClick={() => onSendToChat(`Update me on the care journey for ${seniorName}'s ${j.speciality || j.referral_type} referral. Current status: ${j.status}. What should I expect next?`)}
                  className="mt-3 px-3 py-1.5 rounded-lg text-[10px] font-medium"
                  style={{ background: `${NAVY}15`, border: `1px solid ${NAVY}30`, color: "#5A9ACC" }}
                >
                  <TrendingUp size={10} className="inline mr-1" /> Ask VITAE for update
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Track a referral", prompt: "I have a specialist referral I'd like to track." },
          { label: "Check wait times", prompt: "What are the current average wait times for specialist appointments in New Zealand?" },
          { label: "Patient rights", prompt: "Explain my rights under the Code of Health and Disability Services Consumers' Rights." },
          { label: "Prepare for appointment", prompt: "Help me prepare questions for my upcoming specialist appointment." },
        ].map(q => (
          <button key={q.label} onClick={() => onSendToChat(q.prompt)} className="p-3 rounded-xl text-left text-xs" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(212,168,67,0.08)", color: "rgba(255,255,255,0.6)" }}>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VitaeCareJourneys;
