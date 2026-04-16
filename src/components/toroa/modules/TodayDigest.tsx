import { motion } from "framer-motion";
import { Bell, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";

interface DigestItem {
  type: "reminder" | "event" | "alert" | "task";
  text: string;
  time?: string;
  urgent?: boolean;
}

interface Props {
  items: DigestItem[];
  greeting: string;
}

const icons = {
  reminder: Bell,
  event: Calendar,
  alert: AlertTriangle,
  task: CheckCircle,
};

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${KOWHAI}15`,
  backdropFilter: "blur(14px)",
  boxShadow: `0 0 24px ${KOWHAI}06, 0 4px 24px rgba(0,0,0,0.25)`,
};

export default function TodayDigest({ items, greeting }: Props) {
  const today = new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg" style={{ fontWeight: 300, color: "#1A1D29" }}>{greeting}</h2>
        <p className="font-body text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{today}</p>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const Icon = icons[item.type];
          const accent = item.urgent ? "#ef4444" : item.type === "event" ? POUNAMU : KOWHAI;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ ...glass, borderColor: item.urgent ? "rgba(239,68,68,0.15)" : `${accent}15` }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
                <Icon size={14} style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs" style={{ color: item.urgent ? "#fca5a5" : "#3D4250" }}>{item.text}</p>
                {item.time && <p className="font-mono text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>{item.time}</p>}
              </div>
              {item.urgent && <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "#ef4444" }} />}
            </motion.div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="rounded-xl p-8 text-center" style={glass}>
          <p className="font-body text-xs" style={{ color: "#9CA3AF" }}>Nothing urgent today. Enjoy the calm.</p>
        </div>
      )}
    </div>
  );
}
