import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Phone, Smartphone } from "lucide-react";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";

const TEMPLATES = [
  { id: "followup", label: "Follow-up", text: "Hi {name}, following up on our conversation about {topic}. Please let me know if you have any questions." },
  { id: "appointment", label: "Appointment Reminder", text: "Reminder: You have a site meeting scheduled for {date} at {time}. Location: Christchurch Metro Sports Facility." },
  { id: "safety", label: "Safety Alert", text: "️ Safety Alert: {message}. All workers must acknowledge before entering site." },
  { id: "welcome", label: "Welcome", text: "Kia ora {name}, welcome to the Christchurch Metro Sports Facility project. Please check in via the QR code at the site entrance." },
];

interface Message { id: string; text: string; sender: "user" | "contact"; time: string }

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
    borderColor: "rgba(255,255,255,0.5)", boxShadow: "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
  }}>{children}</div>
);

export default function CommsHubPage() {
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Kia ora, site meeting confirmed for tomorrow 8am.", sender: "user", time: "09:15" },
    { id: "2", text: "Ka pai, I'll be there. Do I need my PPE?", sender: "contact", time: "09:22" },
    { id: "3", text: "Yes, full PPE required. Hard hat, hi-vis, steel caps.", sender: "user", time: "09:24" },
  ]);

  const selectTemplate = (id: string) => {
    setSelectedTemplate(id);
    const t = TEMPLATES.find(t => t.id === id);
    if (t) setMessage(t.text);
  };

  const send = () => {
    if (!message.trim()) return;
    setMessages(m => [...m, { id: Date.now().toString(), text: message, sender: "user", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setMessage("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><MessageSquare size={22} style={{ color: TEAL_ACCENT }} /> Communication Hub — Kōrero</h1>
        <p className="text-xs text-[#9CA3AF]">SMS & WhatsApp messaging for site teams</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose panel */}
        <Glass className="p-5 space-y-4">
          <div className="flex gap-2">
            {(["sms", "whatsapp"] as const).map(c => (
              <button key={c} onClick={() => setChannel(c)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${channel === c ? "text-foreground" : "text-[#9CA3AF]"}`}
                style={channel === c ? { background: c === "sms" ? "rgba(26,58,92,0.3)" : "rgba(58,125,110,0.2)", border: `1px solid ${c === "sms" ? "rgba(26,58,92,0.4)" : "rgba(58,125,110,0.3)"}` } : {}}>
                {c === "sms" ? "📱 SMS" : "WhatsApp"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] text-[#9CA3AF] mb-1 block">Recipient Phone (+64)</label>
            <div className="flex gap-2">
              <span className="px-3 py-2.5 rounded-xl text-sm text-gray-500 bg-white/[0.04] border border-white/[0.06]">+64</span>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="21 123 4567"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-foreground bg-white/[0.04] border border-white/[0.06] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#9CA3AF] mb-1 block">Template</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => selectTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] transition-all ${selectedTemplate === t.id ? "text-foreground bg-white/10" : "text-[#9CA3AF] bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#9CA3AF] mb-1 block">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Type your message..."
              className="w-full px-4 py-3 rounded-xl text-sm text-foreground bg-white/[0.04] border border-white/[0.06] focus:outline-none resize-none" />
          </div>

          <motion.button onClick={send} whileHover={{ scale: 1.02 }} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
            style={{ background: TEAL_ACCENT, color: "#09090F" }}>
            <Send size={16} /> Send Message
          </motion.button>
        </Glass>

        {/* Phone preview */}
        <div className="flex justify-center">
          <div className="w-[280px] rounded-[2rem] p-3" style={{ background: "#1a1a2e", border: "3px solid rgba(255,255,255,0.1)" }}>
            <div className="rounded-[1.5rem] overflow-hidden h-[500px] flex flex-col" style={{ background: "#0D0D18" }}>
              {/* Phone header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${POUNAMU}30` }}>
                  <Phone size={14} style={{ color: POUNAMU }} />
                </div>
                <div>
                  <div className="text-xs text-foreground font-medium">{phone || "+64 21 ..."}</div>
                  <div className="text-[10px] text-gray-400">{channel === "sms" ? "SMS" : "WhatsApp"}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${
                      m.sender === "user" ? "text-foreground" : "text-[#3D4250]"
                    }`} style={{
                      background: m.sender === "user" ? `linear-gradient(135deg, ${POUNAMU}, ${POUNAMU}CC)` : "rgba(255,255,255,0.5)",
                      borderRadius: m.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    }}>
                      {m.text}
                      <div className="text-[9px] opacity-50 mt-1 text-right">{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
