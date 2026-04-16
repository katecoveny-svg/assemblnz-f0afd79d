import { useState } from "react";
import { AlertTriangle, Phone, MapPin, Heart, Shield } from "lucide-react";

const KOKKOWAI = "#A52A2A";
const POUNAMU = "#3A7D6E";
const KOWHAI = "#D4A843";

interface TahiTriageProps {
  onSendToChat: (msg: string) => void;
}

const SERVICES = [
  { label: "Emergency — 111", desc: "Life-threatening. Call now.", color: KOKKOWAI, icon: Phone },
  { label: "Need to Talk — 1737", desc: "Mental health crisis. Free, 24/7.", color: "#9C27B0", icon: Heart },
  { label: "Healthline — 0800 611 116", desc: "Free health advice from registered nurses, 24/7.", color: POUNAMU, icon: Phone },
  { label: "GP / Urgent Care", desc: "Non-emergency but needs a doctor today.", color: KOWHAI, icon: MapPin },
  { label: "Pharmacy", desc: "Minor symptoms a pharmacist can help with.", color: "#5AADA0", icon: Shield },
];

const QUICK_SCENARIOS = [
  { label: "Chest pain or breathing difficulty", prompt: "I'm experiencing chest pain / difficulty breathing. Help me assess if this is an emergency.", urgent: true },
  { label: "Fall or injury", prompt: "Someone has had a fall. Help me assess the situation and decide where to go for care.", urgent: true },
  { label: "Child is unwell", prompt: "My child is unwell. Help me figure out if I need to see a GP, go to urgent care, or manage at home.", urgent: false },
  { label: "I need to find a service", prompt: "Help me find the right health service for my situation. I'm not sure whether I need a GP, pharmacist, or something else.", urgent: false },
  { label: "ACC claim guidance", prompt: "I've had an accident/injury. Help me understand the ACC claim process in New Zealand.", urgent: false },
  { label: "Mental health support", prompt: "I need mental health support. What services are available to me in New Zealand right now?", urgent: false },
];

const TahiTriage = ({ onSendToChat }: TahiTriageProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div>
        <p className="text-[10px] uppercase font-bold" style={{ color: KOKKOWAI, fontFamily: "'Lato', sans-serif", letterSpacing: "4px" }}>TAHI — HEALTH TRIAGE</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Help me figure out where to go for care</p>
      </div>

      {/* Emergency banner */}
      <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(165,42,42,0.1)", border: "1px solid rgba(165,42,42,0.2)" }}>
        <AlertTriangle size={18} style={{ color: KOKKOWAI, marginTop: 2, flexShrink: 0 }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: KOKKOWAI }}>If it's an emergency, call 111 now</p>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Chest pain, breathing difficulty, stroke symptoms, severe injury, or loss of consciousness</p>
        </div>
      </div>

      {/* Quick scenarios */}
      <div>
        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: KOWHAI, fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>What's happening?</p>
        <div className="grid grid-cols-1 gap-2">
          {QUICK_SCENARIOS.map(s => (
            <button
              key={s.label}
              onClick={() => onSendToChat(s.prompt)}
              className="p-3 rounded-xl text-left transition-all hover:scale-[0.99] flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${s.urgent ? "rgba(165,42,42,0.15)" : "rgba(212,168,67,0.08)"}` }}
            >
              {s.urgent && <AlertTriangle size={13} style={{ color: KOKKOWAI, flexShrink: 0 }} />}
              <span className="text-xs" style={{ color: s.urgent ? "#fff" : "rgba(255,255,255,0.7)" }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* NZ Services quick reference */}
      <div>
        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: POUNAMU, fontFamily: "'Lato', sans-serif", letterSpacing: "3px" }}>NZ Health Services</p>
        <div className="space-y-2">
          {SERVICES.map(s => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
              <s.icon size={14} style={{ color: s.color }} />
              <div>
                <p className="text-xs font-medium" style={{ color: s.color }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-xl" style={{ background: "rgba(165,42,42,0.06)", border: "1px solid rgba(165,42,42,0.1)" }}>
        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          <strong style={{ color: KOKKOWAI }}>TAHI is not a medical device.</strong> It helps you navigate to the right service — it does not diagnose or treat. Always call 111 for emergencies. If unsure, call Healthline free on 0800 611 116.
        </p>
      </div>
    </div>
  );
};

export default TahiTriage;
