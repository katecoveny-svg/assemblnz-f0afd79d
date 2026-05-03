import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Home, Camera, AlertTriangle, Shield, Thermometer, Sun } from "lucide-react";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const KOKKOWAI = "#A52A2A";

interface HavenHomeSafetyProps {
  onSendToChat: (msg: string) => void;
}

const ROOMS = ["Kitchen", "Bathroom", "Bedroom", "Hallway", "Entrance", "Garden", "Living room"];

const SEASONAL_TIPS = {
  summer: { icon: Sun, tips: ["Hydration reminders", "Sun protection", "Heat management"] },
  winter: { icon: Thermometer, tips: ["Heating check", "Damp prevention", "Flu vaccination"] },
};

const HavenHomeSafety = ({ onSendToChat }: HavenHomeSafetyProps) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("home_safety_assessments").select("*").order("created_at", { ascending: false }).limit(10);
      setAssessments(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const month = new Date().getMonth();
  const season = month >= 10 || month <= 2 ? "summer" : "winter";
  const seasonData = SEASONAL_TIPS[season];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <p className="text-[10px] uppercase font-bold" style={{ color: TEAL_ACCENT, fontFamily: "'Inter', sans-serif", letterSpacing: "4px" }}>HAVEN — HOME SAFETY</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Photo-based home safety assessment with AI spatial reasoning</p>
      </div>

      {/* Start assessment */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.12)" }}>
        <Camera size={20} style={{ color: TEAL_ACCENT, marginBottom: 12 }} />
        <p className="text-sm font-medium" style={{ color: "#3D4250" }}>Room-by-room safety check</p>
        <p className="text-xs mt-1 mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          Take photos of each room. HAVEN analyses for trip hazards, poor lighting, missing grab rails, and fall risks using AI spatial reasoning.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {ROOMS.map(room => (
            <button
              key={room}
              onClick={() => onSendToChat(`I'd like to do a home safety assessment for the ${room.toLowerCase()}. I'll upload a photo — analyse it for trip hazards, poor lighting, missing grab rails, and fall risks. Provide a risk score and prioritised recommendations.`)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-[0.98]"
              style={{ background: "rgba(74,165,168,0.08)", border: "1px solid rgba(74,165,168,0.15)", color: TEAL_ACCENT }}
            >
              {room}
            </button>
          ))}
        </div>
      </div>

      {/* Recent assessments */}
      {assessments.length > 0 && (
        <div>
          <p className="text-[10px] uppercase font-bold mb-2" style={{ color: POUNAMU, fontFamily: "'Inter', sans-serif", letterSpacing: "3px" }}>Recent assessments</p>
          <div className="space-y-2">
            {assessments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
                <div className="flex items-center gap-2">
                  <Home size={13} style={{ color: TEAL_ACCENT }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#3D4250" }}>{a.room || "Full assessment"}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{new Date(a.created_at).toLocaleDateString("en-NZ")}</p>
                  </div>
                </div>
                {a.risk_score && (
                  <span className="text-xs font-mono font-bold" style={{
                    color: a.risk_score >= 7 ? KOKKOWAI : a.risk_score >= 4 ? TEAL_ACCENT : POUNAMU,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>{a.risk_score}/10</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal safety */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(58,125,110,0.06)", border: "1px solid rgba(58,125,110,0.12)" }}>
        <div className="flex items-center gap-2 mb-2">
          <seasonData.icon size={14} style={{ color: POUNAMU }} />
          <p className="text-[10px] uppercase font-bold" style={{ color: POUNAMU, fontFamily: "'Inter', sans-serif", letterSpacing: "3px" }}>
            {season === "summer" ? "Summer" : "Winter"} safety tips
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {seasonData.tips.map(t => (
            <span key={t} className="px-2 py-1 rounded-full text-[10px]" style={{ background: "rgba(58,125,110,0.1)", color: "rgba(255,255,255,0.5)" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HavenHomeSafety;
