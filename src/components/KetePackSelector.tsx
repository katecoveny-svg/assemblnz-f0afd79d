import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HardHat, UtensilsCrossed, Palette, Briefcase, Cpu } from "lucide-react";

const KOWHAI = "#D4A843";

const KETE_PACKS = [
  { name: "Manaaki", sub: "Hospitality & Tourism", wananga: "Te Kete Aronui", wanangaEn: "Knowledge of goodness & humanity", icon: UtensilsCrossed, to: "/packs/manaaki" },
  { name: "Hanga", sub: "Construction", wananga: "Te Kete Tuauri", wanangaEn: "Knowledge of the physical world", icon: HardHat, to: "/hanga" },
  { name: "Auaha", sub: "Creative & Media", wananga: "Te Kete Aronui", wanangaEn: "Knowledge of human expression", icon: Palette, to: "/packs/auaha" },
  { name: "Pakihi", sub: "Business & Commerce", wananga: "Te Kete Tuatea", wanangaEn: "Knowledge of strategy & governance", icon: Briefcase, to: "/packs/pakihi" },
  { name: "Hangarau", sub: "Technology", wananga: "Te Kete Tuauri", wanangaEn: "Knowledge of systems & nature", icon: Cpu, to: "/packs/hangarau" },
];

const KetePackSelector = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    {KETE_PACKS.map((pack, i) => (
      <motion.div
        key={pack.name}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.08, duration: 0.5 }}
      >
        <Link
          to={pack.to}
          className="group block rounded-2xl p-6 border text-center transition-all duration-300 hover:border-[rgba(212,168,67,0.3)]"
          style={{
            background: "rgba(15,15,26,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(212,168,67,0.2)]"
            style={{
              background: "rgba(212,168,67,0.08)",
              border: "1px solid rgba(212,168,67,0.15)",
            }}
          >
            <pack.icon
              size={24}
              className="transition-colors duration-300"
              style={{ color: "rgba(255,255,255,0.5)" }}
            />
          </div>
          <h3
            className="text-sm font-bold tracking-wider mb-1 group-hover:text-[#D4A843] transition-colors"
            style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}
          >
            {pack.name}
          </h3>
          <p
            className="text-[11px] mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}
          >
            {pack.sub}
          </p>
          <div
            className="text-[10px] font-mono tracking-wider leading-relaxed"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(212,168,67,0.4)" }}
          >
            <span className="block">{pack.wananga}</span>
            <span className="block text-white/25">{pack.wanangaEn}</span>
          </div>
        </Link>
      </motion.div>
    ))}
  </div>
);

export default KetePackSelector;
