import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LiquidKoru = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden z-0", className)}>
      {/* SVG filter definition for gooey effect */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Container applying the gooey filter */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-90" style={{ filter: "url(#goo)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="relative w-[600px] h-[600px]"
        >
          {/* Main central node */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
            style={{
              background: "linear-gradient(145deg, rgba(238,238,242,0.9), rgba(250,251,252,0.7))",
              border: "1px solid rgba(255,255,255,0.6)",
              filter: "blur(2px)",
              boxShadow: "0 0 60px rgba(74,165,168,0.15), inset 0 0 40px rgba(255,255,255,0.5)",
            }}
          />

          {/* Liquid Koru path 1 — Ochre */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-10 w-64 h-64 rounded-full"
            style={{ background: "#4AA5A8", filter: "blur(8px)" }}
          />

          {/* Liquid Koru path 2 — Pounamu */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-10 left-10 w-72 h-72 rounded-full"
            style={{ background: "#4AA5A8", filter: "blur(8px)" }}
          />

          {/* Core white glow */}
          <motion.div
            animate={{ rotate: -180, scale: [0.8, 1, 0.8] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/3 w-40 h-40 rounded-full"
            style={{ background: "white", filter: "blur(10px)", opacity: 0.6 }}
          />

          {/* Lavender accent */}
          <motion.div
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute bottom-20 right-20 w-48 h-48 rounded-full"
            style={{ background: "#B8A5D0", filter: "blur(8px)" }}
          />
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, ease: "linear", repeat: Infinity }}
          className="relative w-[700px] h-[700px]"
        >
          {Array.from({ length: 50 }).map((_, i) => {
            const angle = (i / 50) * Math.PI * 2;
            const radius = 160 + (i * 37) % 180;
            const x = 350 + Math.cos(angle) * radius;
            const y = 350 + Math.sin(angle) * radius * (0.8 + (i % 5) * 0.1);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0.1 }}
                animate={{
                  y: [0, (i % 2 === 0 ? -20 : 20)],
                  opacity: [0.15, 0.7, 0.15],
                  scale: [1, 1.8, 1],
                }}
                transition={{
                  duration: 4 + (i % 6),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: x,
                  top: y,
                  background: i % 5 === 0 ? "#4AA5A8" : i % 3 === 0 ? "#B8A5D0" : "#4AA5A8",
                  boxShadow: `0 0 8px ${i % 5 === 0 ? "rgba(232,169,72,0.6)" : i % 3 === 0 ? "rgba(184,165,208,0.6)" : "rgba(74,165,168,0.6)"}`,
                }}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default LiquidKoru;
