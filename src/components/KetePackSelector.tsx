import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HardHat, UtensilsCrossed, Palette, Briefcase, Cpu,
  Ship, HeartPulse, Globe, Bird, ArrowRight
} from "lucide-react";

const KETE_PACKS = [
  {
    name: "Manaaki",
    sub: "Hospitality & Tourism",
    wananga: "Te Kete Aronui",
    wanangaEn: "Goodness & humanity",
    icon: UtensilsCrossed,
    to: "/manaaki",
    color: "#D4A843",
    agents: "14 agents",
    desc: "Food safety, liquor licensing, guest experience, adventure tourism.",
  },
  {
    name: "Hanga",
    sub: "Construction",
    wananga: "Te Kete Tuauri",
    wanangaEn: "Physical world & craft",
    icon: HardHat,
    to: "/hanga",
    color: "#3A7D6E",
    agents: "16 agents",
    desc: "Site to sign-off. Safety, consenting, project management, tenders.",
  },
  {
    name: "Auaha",
    sub: "Creative & Media",
    wananga: "Te Kete Aronui",
    wanangaEn: "Human expression",
    icon: Palette,
    to: "/auaha",
    color: "#E8702A",
    agents: "12 agents",
    desc: "Brief to published. Copy, image, video, ads, analytics.",
  },
  {
    name: "Pakihi",
    sub: "Business & Commerce",
    wananga: "Te Kete Tuatea",
    wanangaEn: "Strategy & governance",
    icon: Briefcase,
    to: "/pakihi",
    color: "#5AADA0",
    agents: "18 agents",
    desc: "Accounting, insurance, retail, trade, agriculture, real estate.",
  },
  {
    name: "Hangarau",
    sub: "Technology",
    wananga: "Te Kete Tuauri",
    wanangaEn: "Systems & infrastructure",
    icon: Cpu,
    to: "/hangarau",
    color: "#4A7FC1",
    agents: "10 agents",
    desc: "Security, DevOps, infrastructure, monitoring, manufacturing.",
  },
  {
    name: "Waka",
    sub: "Transport & Vehicles",
    wananga: "Te Kete Tuauri",
    wanangaEn: "Movement & logistics",
    icon: Ship,
    to: "/kete/waka",
    color: "#6B8FA3",
    agents: "8 agents",
    desc: "Automotive, maritime, trucking, logistics, heavy vehicles.",
  },
  {
    name: "Hauora",
    sub: "Health & Lifestyle",
    wananga: "Te Kete Aronui",
    wanangaEn: "Wellbeing & vitality",
    icon: HeartPulse,
    to: "/kete/hauora",
    color: "#A87D4A",
    agents: "9 agents",
    desc: "Sport, health, beauty, nutrition, travel.",
  },
  {
    name: "Te Kāhui Reo",
    sub: "Māori Business Intelligence",
    wananga: "Te Kete Tuatea",
    wanangaEn: "Cultural intelligence",
    icon: Globe,
    to: "/te-kahui-reo",
    color: "#3A6A9C",
    agents: "Cross-platform",
    desc: "Data sovereignty, whānau governance, iwi reporting, tikanga.",
  },
  {
    name: "Tōroa",
    sub: "Family Navigator",
    wananga: "Te Kete Aronui",
    wanangaEn: "Whānau & everyday life",
    icon: Bird,
    to: "/toroa",
    color: "#7FB069",
    agents: "SMS-first · $29/mo",
    desc: "No app, no login. Just text. Built for NZ whānau.",
  },
];

const KetePackSelector = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {KETE_PACKS.map((pack, i) => (
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
            background: "rgba(15,15,26,0.7)",
            border: `1px solid rgba(255,255,255,0.07)`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = `${pack.color}45`;
            el.style.boxShadow = `0 0 32px ${pack.color}22, 0 8px 32px rgba(0,0,0,0.4)`;
            el.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "rgba(255,255,255,0.07)";
            el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
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
                style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}
              >
                {pack.name}
              </h3>
              <p
                className="text-sm mt-0.5"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}
              >
                {pack.sub}
              </p>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}
          >
            {pack.desc}
          </p>

          {/* Wānanga label */}
          <div
            className="text-[11px] font-mono mb-4 pb-4"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: `${pack.color}AA`,
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
            }}
          >
            {pack.wananga} — {pack.wanangaEn}
          </div>

          {/* Agents pill + arrow */}
          <div className="flex items-center justify-between mt-auto pt-1">
            <span
              className="text-[11px] px-3 py-1 rounded-full"
              style={{
                background: `${pack.color}12`,
                color: `${pack.color}CC`,
                border: `1px solid ${pack.color}28`,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {pack.agents}
            </span>
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

export default KetePackSelector;
