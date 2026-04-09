import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * KeteWeaveVisual — 3D animated SVG kete basket in a glowing pounamu orb
 * Features: glowing orb background, 3D perspective weave, flashing star nodes
 */

interface Props {
  size?: number;
  accentColor?: string;
  accentLight?: string;
  className?: string;
  showNodes?: boolean;
  showGlow?: boolean;
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Pounamu palette
const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#5AADA0";
const POUNAMU_GLOW = "#7ECFC2";

export default function KeteWeaveVisual({
  size = 200,
  accentColor = POUNAMU,
  accentLight = POUNAMU_LIGHT,
  className = "",
  showNodes = true,
  showGlow = true,
}: Props) {
  const hRows = [95, 112, 129, 146, 163, 180];
  const vCols = [55, 72, 89, 106, 123, 140];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(id);
  }, []);

  const id = accentColor.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Pounamu orb glow — large ambient */}
      {showGlow && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: "-35%",
              background: `radial-gradient(circle, ${POUNAMU}18 0%, ${POUNAMU}08 35%, transparent 60%)`,
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: "-15%",
              background: `radial-gradient(circle, ${POUNAMU_GLOW}10 0%, transparent 50%)`,
              border: `1px solid ${POUNAMU}15`,
            }}
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </>
      )}

      <svg
        viewBox="0 0 200 230"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label="Kete basket — woven knowledge container"
        style={{ filter: `drop-shadow(0 0 ${size > 80 ? 15 : 6}px ${POUNAMU}40)` }}
      >
        <defs>
          {/* 3D orb gradient */}
          <radialGradient id={`orb-${id}`} cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor={POUNAMU_GLOW} stopOpacity="0.15" />
            <stop offset="40%" stopColor={POUNAMU} stopOpacity="0.08" />
            <stop offset="100%" stopColor={POUNAMU} stopOpacity="0" />
          </radialGradient>
          {/* Glass fill */}
          <radialGradient id={`glass-${id}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          {/* Specular highlight */}
          <linearGradient id={`spec-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          {/* Node glow filter */}
          <filter id={`nodeGlow-${id}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orb circle — 3D glass sphere */}
        <circle cx="100" cy="120" r="95" fill={`url(#orb-${id})`} />
        <circle cx="100" cy="120" r="92" fill="none" stroke={POUNAMU} strokeWidth="0.8" opacity="0.2" />
        <circle cx="100" cy="120" r="85" fill="none" stroke={POUNAMU_LIGHT} strokeWidth="0.3" opacity="0.1" />

        {/* 3D highlight arc on orb */}
        <ellipse cx="85" cy="75" rx="40" ry="20" fill="white" opacity="0.03" />

        {/* Basket body — glass fill */}
        <path
          d="M 35 80 Q 35 190 100 200 Q 165 190 165 80"
          fill={`url(#glass-${id})`}
        />

        {/* Basket body — main stroke with 3D effect */}
        <motion.path
          d="M 35 80 Q 35 190 100 200 Q 165 190 165 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease }}
        />
        {/* Inner highlight stroke */}
        <motion.path
          d="M 40 82 Q 40 186 100 196 Q 160 186 160 82"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease, delay: 0.2 }}
        />

        {/* Horizontal weave strands — 3D depth */}
        {hRows.map((y, i) => {
          const inset = i * 1.5;
          const wave = Math.sin(i * 0.8) * 2;
          return (
            <g key={`h-${y}`}>
              <motion.path
                d={`M ${42 - inset} ${y + wave} Q ${100} ${y - 3 + wave} ${158 + inset} ${y + wave}`}
                fill="none"
                stroke={i % 2 === 0 ? accentColor : accentLight}
                strokeWidth="1.4"
                opacity="0.7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease }}
              />
              {/* Depth shadow */}
              <motion.path
                d={`M ${42 - inset} ${y + wave + 1.5} Q ${100} ${y - 1.5 + wave} ${158 + inset} ${y + wave + 1.5}`}
                fill="none"
                stroke="black"
                strokeWidth="0.5"
                opacity="0.15"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease }}
              />
            </g>
          );
        })}

        {/* Vertical weave strands */}
        {vCols.map((x, i) => (
          <g key={`v-${x}`}>
            <motion.line
              x1={x} y1="85"
              x2={x + (i % 2 === 0 ? 2 : -2)} y2="190"
              stroke={i % 2 === 0 ? accentColor : accentLight}
              strokeWidth="1.3"
              opacity="0.6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.06, ease }}
            />
          </g>
        ))}

        {/* ★ Flashing star nodes at intersections */}
        {showNodes && hRows.map((y, yi) =>
          vCols.map((x, xi) => {
            const nodeIdx = yi * vCols.length + xi;
            const isFlashing = (tick + nodeIdx) % 7 === 0;
            const baseR = 2.2;
            return (
              <g key={`n-${x}-${y}`} filter={isFlashing ? `url(#nodeGlow-${id})` : undefined}>
                {/* Star burst for flashing nodes */}
                {isFlashing && (
                  <motion.circle
                    cx={x} cy={y}
                    r={8}
                    fill="none"
                    stroke={POUNAMU_GLOW}
                    strokeWidth="0.5"
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                <motion.circle
                  cx={x} cy={y}
                  r={isFlashing ? baseR * 1.6 : baseR}
                  fill={isFlashing ? POUNAMU_GLOW : accentColor}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: isFlashing ? 1 : 0.7 }}
                  transition={{ delay: 0.8 + nodeIdx * 0.03, duration: 0.3 }}
                />
                {/* White specular on each node */}
                <motion.circle
                  cx={x - 0.5} cy={y - 0.5}
                  r={baseR * 0.4}
                  fill="white"
                  opacity={isFlashing ? 0.6 : 0.15}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + nodeIdx * 0.03, duration: 0.2 }}
                />
              </g>
            );
          })
        )}

        {/* Connection lines between nodes — data flow */}
        {showNodes && (
          <g opacity="0.12">
            {hRows.slice(0, -1).map((y, yi) =>
              vCols.slice(0, -1).map((x, xi) => (
                <motion.line
                  key={`c-${x}-${y}`}
                  x1={x} y1={y}
                  x2={vCols[xi + 1]} y2={hRows[yi + 1]}
                  stroke={POUNAMU_LIGHT}
                  strokeWidth="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.3 + (yi * 5 + xi) * 0.04, duration: 0.5 }}
                />
              ))
            )}
          </g>
        )}

        {/* Handle with 3D depth */}
        <motion.path
          d="M 65 80 Q 100 20 135 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2, ease }}
        />
        {/* Handle highlight */}
        <motion.path
          d="M 70 77 Q 100 28 130 77"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        />
        {/* Handle shadow */}
        <motion.path
          d="M 67 83 Q 100 25 133 83"
          fill="none"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        />
      </svg>
    </div>
  );
}
