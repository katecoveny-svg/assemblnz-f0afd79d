import { useState } from "react";
import { Heart, Phone, Shield, Sun, AlertTriangle } from "lucide-react";

const AROHA_PINK = "#FF6F91";
const POUNAMU = "#3A7D6E";
const TEAL_ACCENT = "#4AA5A8";

interface ArohaCaregiverWellbeingProps {
  onSendToChat: (msg: string) => void;
}

const SUPPORT_SERVICES = [
  { name: "Carers NZ", phone: "0800 777 797", desc: "Free support, info, and advocacy" },
  { name: "Need to Talk?", phone: "1737", desc: "Free call or text, 24/7" },
  { name: "Age Concern NZ", phone: "0800 652 105", desc: "Elder care support and advocacy" },
];

const ArohaCaregiverWellbeing = ({ onSendToChat }: ArohaCaregiverWellbeingProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <p className="text-[10px] uppercase font-bold" style={{ color: AROHA_PINK, fontFamily: "'Inter', sans-serif", letterSpacing: "4px" }}>AROHA — CAREGIVER SUPPORT</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Your wellbeing matters too. We see you.</p>
      </div>

      {/* Wellbeing check */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,111,145,0.15)" }}>
        <Heart size={20} style={{ color: AROHA_PINK, marginBottom: 12 }} />
        <p className="text-sm font-medium" style={{ color: "#3D4250" }}>How are you holding up?</p>
        <p className="text-xs mt-1 mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Caregiving is hard mahi. AROHA can check in on your stress levels, respite hours, and connect you with support.</p>
        <button
          onClick={() => onSendToChat("I'm a caregiver and I'd like a wellbeing check-in. Ask me about my stress, sleep, respite time, and support satisfaction. Be warm and validating.")}
          className="px-4 py-2 rounded-lg text-xs font-semibold"
          style={{ background: AROHA_PINK, color: "#3D4250" }}
        >
          Start wellbeing check-in
        </button>
      </div>

      {/* Quick topics */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Shield, label: "Carer's leave rights", prompt: "Explain my carer's leave entitlements under the NZ Holidays Act 2003 and Employment Relations Act 2000." },
          { icon: Sun, label: "Respite care options", prompt: "What respite care options are available in NZ? Help me understand NASC, Health NZ entitlements, and local services." },
          { icon: Heart, label: "Burnout signs", prompt: "What are the signs of caregiver burnout? Help me assess where I'm at and what I can do about it." },
          { icon: AlertTriangle, label: "I need help now", prompt: "I'm feeling overwhelmed as a caregiver. I need immediate support options. Connect me with the right people." },
        ].map(q => (
          <button
            key={q.label}
            onClick={() => onSendToChat(q.prompt)}
            className="p-4 rounded-2xl text-left transition-all hover:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.08)" }}
          >
            <q.icon size={16} style={{ color: AROHA_PINK, marginBottom: 8 }} />
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{q.label}</p>
          </button>
        ))}
      </div>

      {/* Support services */}
      <div>
        <p className="text-[10px] uppercase font-bold mb-2" style={{ color: POUNAMU, fontFamily: "'Inter', sans-serif", letterSpacing: "3px" }}>Support Services</p>
        <div className="space-y-2">
          {SUPPORT_SERVICES.map(s => (
            <div key={s.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
              <div>
                <p className="text-xs font-medium" style={{ color: "#3D4250" }}>{s.name}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.desc}</p>
              </div>
              <span className="text-[11px] font-mono" style={{ color: POUNAMU, fontFamily: "'IBM Plex Mono', monospace" }}>{s.phone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArohaCaregiverWellbeing;
