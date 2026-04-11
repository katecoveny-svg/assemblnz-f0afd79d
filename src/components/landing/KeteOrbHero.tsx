import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * KeteOrbHero — Large rotating 3D orb with assembl logo,
 * kete constellation nodes orbiting around it.
 * Pure CSS/SVG — no Three.js dependency for performance.
 */

const KETE_NODES = [
  { id: "manaaki", label: "Manaaki", color: "#D4A843", angle: 0 },
  { id: "waihanga", label: "Waihanga", color: "#3A7D6E", angle: 72 },
  { id: "auaha", label: "Auaha", color: "#F0D078", angle: 144 },
  { id: "arataki", label: "Arataki", color: "#E8E8E8", angle: 216 },
  { id: "pikau", label: "Pikau", color: "#5AADA0", angle: 288 },
];

const KeteOrbHero = () => {
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const animate = (time: number) => {
      if (!startRef.current) startRef.current = time;
      const elapsed = time - startRef.current;
      setRotation((elapsed / 80) % 360);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center mb-16"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer ambient glow */}
      <div
        className="absolute w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,168,67,0.12) 0%, rgba(58,125,110,0.06) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Main orb container */}
      <div className="relative w-[260px] h-[260px] sm:w-[340px] sm:h-[340px]">
        {/* Rotating ring */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 340 340"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <defs>
            <linearGradient id="orb-ring-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4A843" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#3A7D6E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#5AADA0" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="orb-ring-2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0D078" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#E8E8E8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Outer orbit ring */}
          <circle cx="170" cy="170" r="155" fill="none" stroke="url(#orb-ring-1)" strokeWidth="1" />
          {/* Inner orbit ring */}
          <circle cx="170" cy="170" r="120" fill="none" stroke="url(#orb-ring-2)" strokeWidth="0.5" />
        </svg>

        {/* Orbiting kete nodes */}
        {KETE_NODES.map((node) => {
          const totalAngle = node.angle + rotation;
          const rad = (totalAngle * Math.PI) / 180;
          const radius = 155;
          const cx = 170 + Math.cos(rad) * radius * (260 / 340);
          const cy = 170 + Math.sin(rad) * radius * (260 / 340);

          return (
            <div
              key={node.id}
              className="absolute pointer-events-none"
              style={{
                left: `${(cx / 340) * 100}%`,
                top: `${(cy / 340) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Glow */}
              <div
                className="absolute -inset-3 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${node.color}40 0%, transparent 70%)`,
                  filter: "blur(6px)",
                }}
              />
              {/* Node dot */}
              <div
                className="relative w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${node.color}, ${node.color}80)`,
                  boxShadow: `0 0 12px ${node.color}60, 0 0 24px ${node.color}20`,
                }}
              />
            </div>
          );
        })}

        {/* Central orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 40% 35%, rgba(30,30,50,0.95) 0%, rgba(9,9,15,0.98) 100%)",
              boxShadow:
                "0 0 60px rgba(212,168,67,0.15), 0 0 120px rgba(58,125,110,0.08), inset 0 0 40px rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Glass highlight */}
            <div
              className="absolute top-2 left-4 w-[60%] h-[30%] rounded-full"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
              }}
            />

            {/* Assembl logo mark */}
            <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20" fill="none">
              <defs>
                <linearGradient id="assembl-orb" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#D4A843" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {/* Triangle constellation — assembl mark */}
              <path
                d="M40 12 L62 56 L18 56 Z"
                stroke="url(#assembl-orb)"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Constellation nodes */}
              <circle cx="40" cy="12" r="3" fill="#D4A843" opacity="0.9" />
              <circle cx="62" cy="56" r="2.5" fill="#3A7D6E" opacity="0.8" />
              <circle cx="18" cy="56" r="2.5" fill="#5AADA0" opacity="0.8" />
              {/* Central node */}
              <circle cx="40" cy="42" r="2" fill="#D4A843" opacity="0.6" />
              {/* Connecting lines to center */}
              <line x1="40" y1="12" x2="40" y2="42" stroke="#D4A843" strokeWidth="0.5" opacity="0.3" />
              <line x1="62" y1="56" x2="40" y2="42" stroke="#3A7D6E" strokeWidth="0.5" opacity="0.3" />
              <line x1="18" y1="56" x2="40" y2="42" stroke="#5AADA0" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Text below orb */}
      <div className="text-center mt-8">
        <p
          className="text-[10px] tracking-[4px] uppercase mb-3"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(212,168,67,0.6)",
          }}
        >
          Ngā Kete · 5 Industries · Tangible Outcomes
        </p>
        <h2
          className="text-2xl sm:text-4xl tracking-[0.02em] text-foreground mb-3"
          style={{
            fontWeight: 300,
            fontFamily: "'Lato', sans-serif",
            textShadow: "0 0 40px rgba(212,168,67,0.15)",
          }}
        >
          More efficiency. Less admin. Real evidence.
        </h2>
        <p
          className="text-sm max-w-lg mx-auto leading-relaxed"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Five industry kete that run your compliance, operations, and reporting — then hand you a signed pack your auditor can read and your lawyer can rely on.
        </p>
      </div>
    </motion.div>
  );
};

export default KeteOrbHero;
