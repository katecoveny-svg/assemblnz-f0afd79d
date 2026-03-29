import { useState } from "react";
import { Mic, Phone, Calendar, Clock, Volume2, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
}

const glassCard: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const VoiceAgentWaitlist = ({ agentId, agentName, agentColor }: Props) => {
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState("professional");
  const [language, setLanguage] = useState("english");
  const [afterHours, setAfterHours] = useState("ai_handles");

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast.error("Sign in to join the waitlist");
      return;
    }
    // Store waitlist signup in shared_context
    await supabase.from("shared_context").upsert({
      user_id: user.id,
      source_agent: agentId,
      context_key: "voice_waitlist",
      context_value: { voiceStyle, language, afterHours, joinedAt: new Date().toISOString() },
      confidence: 1.0,
    }, { onConflict: "user_id,context_key" });
    setJoined(true);
    toast.success("You're on the waitlist! We'll notify you when Voice Agents launch.");
  };

  const features = [
    { icon: Phone, label: "AI Receptionist", desc: "Answers calls, qualifies leads, books appointments" },
    { icon: Volume2, label: "Natural Kiwi Voice", desc: "Sounds like a real NZ team member" },
    { icon: Calendar, label: "Calendar Sync", desc: "Books directly into your calendar" },
    { icon: Clock, label: "24/7 Coverage", desc: "Never miss a call, even after hours" },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-4" style={{ background: agentColor + "15", color: agentColor, border: `1px solid ${agentColor}30` }}>
            <Mic size={10} /> COMING SOON
          </div>
          <h2 className="font-syne font-extrabold text-lg text-foreground mb-1">
            Voice Agent — {agentName}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your AI receptionist that answers calls, qualifies leads, and books appointments in a natural Kiwi voice.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {features.map((f) => (
            <div key={f.label} className="rounded-xl p-3.5" style={glassCard}>
              <f.icon size={16} style={{ color: agentColor }} className="mb-2" />
              <p className="text-[11px] font-bold text-foreground">{f.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Config preview */}
        <div className="rounded-xl p-4 space-y-3" style={glassCard}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preview Your Settings</p>

          <div>
            <label className="text-[10px] text-muted-foreground block mb-1.5">Voice style</label>
            <div className="flex gap-2">
              {["professional", "warm", "mate"].map((s) => (
                <button key={s} onClick={() => setVoiceStyle(s)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all" style={{
                  background: voiceStyle === s ? agentColor + "20" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${voiceStyle === s ? agentColor + "40" : "rgba(255,255,255,0.06)"}`,
                  color: voiceStyle === s ? agentColor : "rgba(255,255,255,0.5)",
                }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground block mb-1.5">Language</label>
            <div className="flex gap-2">
              {[{ id: "english", icon: Globe, label: "English" }, { id: "tereo", icon: Globe, label: "Te reo greetings" }].map((l) => (
                <button key={l.id} onClick={() => setLanguage(l.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all" style={{
                  background: language === l.id ? agentColor + "20" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${language === l.id ? agentColor + "40" : "rgba(255,255,255,0.06)"}`,
                  color: language === l.id ? agentColor : "rgba(255,255,255,0.5)",
                }}>
                  <l.icon size={10} /> {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground block mb-1.5">After hours</label>
            <div className="flex gap-2">
              {[{ id: "ai_handles", label: "AI handles" }, { id: "voicemail", label: "Voicemail" }].map((o) => (
                <button key={o.id} onClick={() => setAfterHours(o.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all" style={{
                  background: afterHours === o.id ? agentColor + "20" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${afterHours === o.id ? agentColor + "40" : "rgba(255,255,255,0.06)"}`,
                  color: afterHours === o.id ? agentColor : "rgba(255,255,255,0.5)",
                }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {joined ? (
          <div className="text-center py-4 rounded-xl" style={{ ...glassCard, borderColor: agentColor + "30" }}>
            <p className="text-xs font-bold" style={{ color: agentColor }}>✓ You're on the waitlist!</p>
            <p className="text-[10px] text-muted-foreground mt-1">We'll notify you when Voice Agents launch.</p>
          </div>
        ) : (
          <button onClick={handleJoinWaitlist} className="w-full py-3 rounded-xl text-xs font-bold transition-opacity hover:opacity-90" style={{ backgroundColor: agentColor, color: "#0A0A14" }}>
            Join the Waitlist — Launching Soon
          </button>
        )}

        <p className="text-[8px] text-muted-foreground/50 text-center">
          Powered by ElevenLabs voice synthesis. NZ phone number included with Pro plan.
        </p>
      </div>
    </div>
  );
};

export default VoiceAgentWaitlist;
