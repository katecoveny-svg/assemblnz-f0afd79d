import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Activity, Pill, Sun, Moon, Coffee, Smile, Frown, Meh, AlertTriangle } from "lucide-react";

const POUNAMU = "#3A7D6E";
const TEAL_ACCENT = "#4AA5A8";
const KOKKOWAI = "#A52A2A";

interface OraCheckInProps {
  onSendToChat: (msg: string) => void;
}

const OraCheckIn = ({ onSendToChat }: OraCheckInProps) => {
  const { user } = useAuth();
  const [seniors, setSeniors] = useState<any[]>([]);
  const [selectedSenior, setSelectedSenior] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadSeniors = async () => {
    if (!user || loaded) return;
    const { data } = await supabase.from("senior_profiles").select("id, first_name, preferred_name, last_name, status").eq("status", "active");
    setSeniors(data || []);
    setLoaded(true);
  };

  if (!loaded) {
    loadSeniors();
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs animate-pulse" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading…</p>
      </div>
    );
  }

  const quickChecks = [
    { icon: Smile, label: "Start daily check-in", prompt: (name: string) => `Start a daily check-in with ${name}. Ask about mood, sleep, medications, and engagement topics. Be warm and use NZ English.` },
    { icon: Pill, label: "Medication check", prompt: (name: string) => `Do a medication check for ${name}. Ask gently if they've taken their morning/evening pills. Never prescribe or suggest changes.` },
    { icon: Activity, label: "Mood & energy", prompt: (name: string) => `Check in on ${name}'s mood and energy levels today. Ask about sleep, appetite, and any pain. Be conversational, not clinical.` },
    { icon: AlertTriangle, label: "Report a concern", prompt: (name: string) => `I'd like to report a concern about ${name}. Help me document what I've noticed and determine if we need to alert whānau or recommend a GP visit.` },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div>
        <p className="text-[10px] uppercase font-bold" style={{ color: POUNAMU, fontFamily: "'Lato', sans-serif", letterSpacing: "4px" }}>ORA CHECK-IN</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Daily companion check-ins for your whānau</p>
      </div>

      {seniors.length === 0 ? (
        <div className="p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.12)" }}>
          <Heart size={24} style={{ color: POUNAMU, margin: "0 auto 12px" }} />
          <p className="text-sm font-medium" style={{ color: "#3D4250" }}>No whānau profiles yet</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Ask ORA to set up a senior profile to get started with daily check-ins.</p>
          <button
            onClick={() => onSendToChat("Help me set up a new senior profile for daily check-ins. I'd like to register a whānau member.")}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: POUNAMU, color: "#3D4250" }}
          >
            Set up first profile
          </button>
        </div>
      ) : (
        <>
          {/* Senior selector */}
          <div className="flex flex-wrap gap-2">
            {seniors.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSenior(s.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: selectedSenior === s.id ? `${POUNAMU}20` : "rgba(255,255,255,0.65)",
                  border: `1px solid ${selectedSenior === s.id ? POUNAMU + "40" : "rgba(74,165,168,0.08)"}`,
                  color: selectedSenior === s.id ? POUNAMU : "rgba(255,255,255,0.6)",
                }}
              >
                {s.preferred_name || s.first_name} {s.last_name}
              </button>
            ))}
          </div>

          {/* Quick actions */}
          {selectedSenior && (
            <div className="grid grid-cols-2 gap-3">
              {quickChecks.map(q => {
                const senior = seniors.find(s => s.id === selectedSenior);
                const name = senior?.preferred_name || senior?.first_name || "them";
                return (
                  <button
                    key={q.label}
                    onClick={() => onSendToChat(q.prompt(name))}
                    className="p-4 rounded-2xl text-left transition-all hover:scale-[0.98]"
                    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.12)" }}
                  >
                    <q.icon size={18} style={{ color: POUNAMU, marginBottom: 8 }} />
                    <p className="text-xs font-medium" style={{ color: "#3D4250" }}>{q.label}</p>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="p-3 rounded-xl" style={{ background: "rgba(165,42,42,0.06)", border: "1px solid rgba(165,42,42,0.1)" }}>
        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          <strong style={{ color: KOKKOWAI }}>Not a medical device.</strong> ORA is a companion and navigation tool, not a clinical system. Always consult your GP for health concerns. If it's an emergency, call 111.
        </p>
      </div>
    </div>
  );
};

export default OraCheckIn;
