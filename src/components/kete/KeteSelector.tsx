import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { KETE_CONFIG } from "./KeteConfig";

export default function KeteSelector() {
  const location = useLocation();

  const isActive = (id: string) => {
    if (id === "hanga") return location.pathname.startsWith("/hanga");
    if (id === "toroa") return location.pathname.startsWith("/toroa");
    return location.pathname.includes(id);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {KETE_CONFIG.map(k => {
        const active = isActive(k.id);
        return (
          <Link key={k.id} to={k.route}>
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all cursor-pointer"
              style={{
                background: active ? `${k.color}20` : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? `${k.color}40` : "rgba(255,255,255,0.06)"}`,
                color: active ? k.color : "rgba(255,255,255,0.4)",
              }}
              whileHover={{ scale: 1.02, borderColor: `${k.color}30` }}
            >
              <k.icon size={12} />
              <span>{k.name}</span>
              <span className="text-[8px] opacity-50">{k.agentCount}</span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
