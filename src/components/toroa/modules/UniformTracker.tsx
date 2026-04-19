import { motion } from "framer-motion";
import { Shirt, AlertTriangle } from "lucide-react";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";

interface UniformItem {
  item_type: string;
  size: string;
  quantity: number;
  condition: "good" | "fair" | "replace";
  child_name: string;
}

interface Props {
  items: UniformItem[];
  children: string[];
}

const conditionColor = {
  good: POUNAMU,
  fair: TEAL_ACCENT,
  replace: "#ef4444",
};

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${TEAL_ACCENT}15`,
  backdropFilter: "blur(14px)",
};

export default function UniformTracker({ items, children }: Props) {
  const needsReplacement = items.filter(i => i.condition === "replace");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#6B7280" }}>
          <Shirt size={14} style={{ color: TEAL_ACCENT }} /> Uniforms
        </h2>
        {needsReplacement.length > 0 && (
          <span className="text-[9px] font-body px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>
            <AlertTriangle size={9} /> {needsReplacement.length} need replacing
          </span>
        )}
      </div>

      {children.map((child, ci) => {
        const childItems = items.filter(i => i.child_name === child);
        if (childItems.length === 0) return null;
        return (
          <motion.div
            key={ci}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.08 }}
            className="rounded-xl p-4 space-y-3"
            style={glass}
          >
            <p className="font-body text-xs" style={{ color: "#1A1D29" }}>{child}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {childItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3 text-center"
                  style={{ background: `${conditionColor[item.condition]}08`, border: `1px solid ${conditionColor[item.condition]}15` }}
                >
                  <p className="font-body text-xs" style={{ color: "#3D4250" }}>{item.item_type}</p>
                  <p className="font-mono text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>
                    Size {item.size} × {item.quantity}
                  </p>
                  <span
                    className="inline-block mt-1 text-[8px] font-body px-1.5 py-0.5 rounded-full uppercase"
                    style={{ background: `${conditionColor[item.condition]}15`, color: conditionColor[item.condition] }}
                  >
                    {item.condition}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
