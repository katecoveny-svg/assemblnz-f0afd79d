import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HardHat, UtensilsCrossed, Palette, Car, Package,
  Bird, ArrowRight, ShoppingBag, Baby
} from "lucide-react";
import { KETE } from "@/data/pricing";

const ICON_MAP: Record<string, React.ElementType> = {
  manaaki: UtensilsCrossed,
  waihanga: HardHat,
  auaha: Palette,
  arataki: Car,
  pikau: Package,
  hoko: ShoppingBag,
  ako: Baby,
};

const COLOR_MAP: Record<string, string> = {
  manaaki: "#4AA5A8",
  waihanga: "#3A7D6E",
  auaha: "#E8702A",
  arataki: "#E8E8E8",
  pikau: "#7ECFC2",
  hoko: "#C66B5C",
  ako: "#7BA7C7",
};

const LINK_MAP: Record<string, string> = {
  manaaki: "/manaaki",
  waihanga: "/waihanga",
  auaha: "/auaha",
  arataki: "/arataki",
  pikau: "/pikau",
  hoko: "/hoko",
  ako: "/ako",
};

const WANANGA_MAP: Record<string, { wananga: string; wanangaEn: string }> = {
  manaaki: { wananga: "Te Kete Aronui", wanangaEn: "Goodness & humanity" },
  waihanga: { wananga: "Te Kete Tuauri", wanangaEn: "Physical world & craft" },
  auaha: { wananga: "Te Kete Aronui", wanangaEn: "Human expression" },
  arataki: { wananga: "Te Kete Tuauri", wanangaEn: "Dealership operations" },
  pikau: { wananga: "Te Kete Tuauri", wanangaEn: "Trade & compliance" },
  hoko: { wananga: "Te Kete Tuatea", wanangaEn: "Trade & exchange" },
  ako: { wananga: "Te Kete Aronui", wanangaEn: "Knowledge & learning" },
};

const TORO = {
  name: "Toro",
  sub: "Family Navigator",
  wananga: "Te Kete Aronui",
  wanangaEn: "Whānau & everyday life",
  icon: Bird,
  to: "/toro",
  color: "#7FB069",
  desc: "No app, no login. Just text. Built for NZ whānau.",
};

const KetePackSelector = () => {
  const packs = KETE.map((k) => ({
    name: k.name,
    sub: k.eng,
    icon: ICON_MAP[k.key],
    to: LINK_MAP[k.key],
    color: COLOR_MAP[k.key],
    desc: k.desc,
    ...WANANGA_MAP[k.key],
  }));

  const allPacks = [...packs, TORO];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {allPacks.map((pack, i) => (
        <motion.div
          key={pack.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to={pack.to}
            className="group flex flex-col h-full rounded-2xl p-7 transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.65)",
              border: `1px solid rgba(255,255,255,0.5)`,
              boxShadow: "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = `${pack.color}45`;
              el.style.boxShadow = `0 0 32px ${pack.color}22, 10px 10px 28px rgba(166,166,180,0.32), -8px -8px 24px rgba(255,255,255,0.95)`;
              el.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "rgba(255,255,255,0.5)";
              el.style.boxShadow = "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)";
              el.style.transform = "translateY(0)";
            }}
          >
            {/* Icon + name row */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${pack.color}18`,
                  border: `1px solid ${pack.color}35`,
                }}
              >
                <pack.icon size={22} style={{ color: pack.color }} />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold leading-tight"
                  style={{ fontFamily: "'Inter', sans-serif", color: "#1A1D29" }}
                >
                  {pack.name}
                </h3>
                <p
                  className="text-sm mt-0.5"
                  style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.5)" }}
                >
                  {pack.sub}
                </p>
              </div>
            </div>

            {/* Description */}
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.6)" }}
            >
              {pack.desc}
            </p>

            {/* Wānanga label */}
            <div
              className="text-[11px] font-mono mb-4 pb-4"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: `${pack.color}AA`,
                borderBottom: `1px solid rgba(255,255,255,0.5)`,
              }}
            >
              {pack.wananga} — {pack.wanangaEn}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-end mt-auto pt-1">
              <ArrowRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: pack.color }}
              />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default KetePackSelector;
