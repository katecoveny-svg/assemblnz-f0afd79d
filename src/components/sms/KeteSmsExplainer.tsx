import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, ChevronDown, ChevronUp, ArrowRight, Zap } from "lucide-react";

interface Conversation {
  user: string;
  agent: string;
  agentName: string;
}

interface KeteSmsExplainerProps {
  keteName: string;
  keteNameEn: string;
  accentColor: string;
  conversations: Conversation[];
  smsConnected?: boolean;
  whatsappConnected?: boolean;
}

const SMS_EXAMPLES: Record<string, Conversation[]> = {
  hanga: [
    { user: "What are my height safety obligations for this scaffold?", agent: "Under HSWA 2015 s36, PCBUs must ensure scaffolds over 5m have edge protection. Check AS/NZS 1576 for specifics. Want me to generate a SWMS?", agentName: "ĀRAI" },
    { user: "When's the next inspection due?", agent: "Building consent inspection #4 (framing) is due 8 April. CCC has a 5-day lead time. Want me to book it?", agentName: "WHAKAAĒ" },
    { user: "What's our budget looking like?", agent: "Budget health: $4.2M of $6.3M claimed. CPI 0.97, SPI 0.94. Payment PC-012 ($245k) due in 12 days.", agentName: "KAUPAPA" },
  ],
  manaaki: [
    { user: "How many bookings tonight?", agent: "42 covers tonight. 3 dietary (1 coeliac, 2 vegan). VIP table 7 — returning guest, birthday.", agentName: "AURA" },
    { user: "Is our food safety plan up to date?", agent: "Food Control Plan expires 15 May. 2 temp logs missing from this week. MPI verification visit expected Q2.", agentName: "PAU" },
    { user: "Who's on shift tomorrow?", agent: "Morning: Sarah, Jake, Mere. Evening: Tom, Hine, Dave. Jake requested swap — want me to find cover?", agentName: "KURA" },
  ],
  pakihi: [
    { user: "What's my GST liability this quarter?", agent: "$14,200 GST payable. Due 28 April. You have $2,100 in GST credits from March purchases to offset.", agentName: "LEDGER" },
    { user: "Can I dismiss someone for repeated lateness?", agent: "Not yet. ERA requires a fair process: 1) Verbal warning 2) Written warning 3) Final warning 4) Meeting. Document everything. Want a template?", agentName: "AROHA" },
    { user: "What R&D tax credits am I eligible for?", agent: "NZ R&D Tax Incentive: 15% tax credit on eligible R&D spend over $50k. Your software dev likely qualifies. Want me to assess?", agentName: "ASCEND" },
  ],
};

export default function KeteSmsExplainer({
  keteName, keteNameEn, accentColor,
  conversations: propConversations,
  smsConnected = false, whatsappConnected = false,
}: KeteSmsExplainerProps) {
  const [expanded, setExpanded] = useState(false);
  const conversations = propConversations.length > 0 ? propConversations : (SMS_EXAMPLES[keteName.toLowerCase()] || SMS_EXAMPLES.hanga);

  return (
    <motion.div
      className="rounded-2xl border backdrop-blur-md overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
        borderColor: `${accentColor}30`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Phone size={16} style={{ color: accentColor }} />
            <MessageSquare size={16} style={{ color: accentColor }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">Text your {keteName} team</h3>
            <p className="text-[10px] text-gray-400">Every agent available via SMS and WhatsApp</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {smsConnected && <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#5AADA0]/10 text-[#5AADA0] border border-green-500/20">SMS LIVE</span>}
            {whatsappConnected && <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#5AADA0]/10 text-[#5AADA0] border border-green-500/20">WA LIVE</span>}
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Flow diagram */}
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
                <div className="flex items-center gap-1.5 text-[9px] text-[#9CA3AF]">
                  <span className="px-2 py-0.5 rounded bg-white/5">You text</span>
                  <ArrowRight size={10} />
                  <span className="px-2 py-0.5 rounded" style={{ background: `${accentColor}10`, color: accentColor }}>IHO reads</span>
                  <ArrowRight size={10} />
                  <span className="px-2 py-0.5 rounded bg-white/5">Routes to agent</span>
                  <ArrowRight size={10} />
                  <span className="px-2 py-0.5 rounded" style={{ background: `${accentColor}10`, color: accentColor }}>Agent replies</span>
                </div>
              </div>

              {/* Example conversations */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-bold tracking-wider text-white/25 uppercase">Example conversations</h4>
                {conversations.map((c, i) => (
                  <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.5)" }}>
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-sm text-[11px] text-[#3D4250]" style={{ background: "rgba(255,255,255,0.5)" }}>
                        {c.user}
                      </div>
                    </div>
                    {/* Agent response */}
                    <div className="flex justify-start gap-2">
                      <div className="max-w-[85%]">
                        <span className="text-[9px] font-bold mb-0.5 block" style={{ color: accentColor }}>{c.agentName}</span>
                        <div className="px-3 py-2 rounded-2xl rounded-bl-sm text-[11px] text-[#6B7280]" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }}>
                          {c.agent}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Setup buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all" style={{ background: smsConnected ? `${accentColor}15` : accentColor, color: smsConnected ? accentColor : "#3D3428" }}>
                  <Phone size={14} /> {smsConnected ? "SMS Connected" : "Set up SMS"}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all" style={{ background: whatsappConnected ? `${accentColor}15` : "rgba(255,255,255,0.5)", color: whatsappConnected ? accentColor : "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
                  <MessageSquare size={14} /> {whatsappConnected ? "WhatsApp Connected" : "Set up WhatsApp"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
