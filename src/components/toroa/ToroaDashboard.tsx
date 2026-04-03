import { motion } from "framer-motion";
import KeteBrainChat from "@/components/KeteBrainChat";
import GlowIcon from "@/components/GlowIcon";

const ACCENT = "#D4A843";
const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{ background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))", borderColor: "rgba(212,168,67,0.15)" }}>
    {children}
  </div>
);

const features = [
  { icon: "Calendar", title: "School & Events", desc: "Track school notices, sports, activities, and family calendar" },
  { icon: "ShoppingCart", title: "Meal & Grocery", desc: "Weekly meal plans, grocery lists, budget-friendly recipes" },
  { icon: "Bus", title: "Bus & Transport", desc: "Real-time school bus tracking and transport coordination" },
  { icon: "Book", title: "Homework Help", desc: "Subject-specific homework assistance for all year levels" },
  { icon: "DollarSign", title: "Family Budget", desc: "Track spending, bills, subscriptions, and savings goals" },
  { icon: "Heart", title: "Wellbeing", desc: "Health check-ins, medication reminders, GP bookings" },
  { icon: "MessageSquare", title: "SMS-First", desc: "No app needed — just text your whānau assistant" },
  { icon: "Shield", title: "Privacy", desc: "NZ Privacy Act 2020 compliant, data stays in Aotearoa" },
];

const quickTexts = [
  { msg: "What's for dinner tonight?", from: "Mum" },
  { msg: "When does the school bus arrive?", from: "Dad" },
  { msg: "Help me with my maths homework", from: "Aroha (Y8)" },
  { msg: "Add milk and bread to the grocery list", from: "Nan" },
];

export default function ToroaDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6" style={{ background: "#09090F" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <GlowIcon name="Bird" size={32} color={ACCENT} />
        <div>
          <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Lato', sans-serif" }}>Tōroa</h1>
          <p className="text-xs text-white/40">Whānau Navigator — SMS-first family assistant</p>
        </div>
      </motion.div>

      <Glass className="p-4">
        <p className="text-xs text-white/50 italic mb-2">
          "No app. No login. Just text. Tōroa is your whānau's intelligent navigator for everyday family life in Aotearoa."
        </p>
        <div className="flex items-center gap-2">
          <GlowIcon name="MessageSquare" size={14} color={ACCENT} />
          <span className="text-[10px] text-white/40">Text 022 XXX XXXX or WhatsApp to get started</span>
        </div>
      </Glass>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map(f => (
          <Glass key={f.title} className="p-3">
            <GlowIcon name={f.icon} size={20} color={ACCENT} />
            <div className="mt-2 text-xs font-bold text-white/80">{f.title}</div>
            <div className="text-[9px] text-white/40 mt-0.5">{f.desc}</div>
          </Glass>
        ))}
      </div>

      {/* Sample conversations */}
      <Glass className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">How whānau text Tōroa</h3>
        <div className="space-y-2">
          {quickTexts.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg" style={{ background: `${ACCENT}08` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: `${ACCENT}20`, color: ACCENT }}>
                {q.from[0]}
              </div>
              <div>
                <div className="text-[9px] text-white/35">{q.from}</div>
                <div className="text-xs text-white/70">"{q.msg}"</div>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      <KeteBrainChat keteId="toroa" keteName="Tōroa" keteNameEn="Family Navigator" accentColor={ACCENT} />
    </div>
  );
}
