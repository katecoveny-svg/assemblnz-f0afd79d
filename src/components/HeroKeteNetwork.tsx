import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

/**
 * HeroKeteNetwork — A network of 3D spinning kete orbs connected by signal lines.
 * Central large orb + satellite orbs in green, blue, and white.
 */

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#5AADA0";
const POUNAMU_GLOW = "#7ECFC2";
const SIGNAL_BLUE = "#4A9FD4";
const STAR_WHITE = "#E8E8E8";

interface OrbDef {
  cx: number;
  cy: number;
  r: number;
  color: string;
  glowColor: string;
  spinDuration: number;
  spinDelay: number;
  label: string;
}

// Fibonacci sphere nodes for inside each orb
function fibNodes(count: number, radius: number, cx: number, cy: number) {
  const nodes: { x: number; y: number; z: number; r: number }[] = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rAtY = Math.sqrt(1 - y * y);
    const theta = 2 * Math.PI * i / phi;
    nodes.push({
      x: cx + Math.cos(theta) * rAtY * radius,
      y: cy + y * radius * 0.85,
      z: Math.sin(theta) * rAtY,
      r: 1.2 + Math.random() * 1.2,
    });
  }
  return nodes;
}

// Weave lines for a kete at given center and size
function weaveStrands(cx: number, cy: number, size: number) {
  const hCount = 5;
  const vCount = 5;
  const top = cy - size * 0.35;
  const bottom = cy + size * 0.4;
  const left = cx - size * 0.45;
  const right = cx + size * 0.45;
  const hLines: string[] = [];
  const vLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  
  for (let i = 0; i < hCount; i++) {
    const y = top + ((bottom - top) / (hCount - 1)) * i;
    const wave = Math.sin(i * 0.8) * 1.5;
    hLines.push(`M ${left} ${y + wave} Q ${cx} ${y - 2 + wave} ${right} ${y + wave}`);
  }
  for (let i = 0; i < vCount; i++) {
    const x = left + ((right - left) / (vCount - 1)) * i;
    vLines.push({ x1: x, y1: top, x2: x + (i % 2 === 0 ? 1 : -1), y2: bottom });
  }
  return { hLines, vLines };
}

export default function HeroKeteNetwork({ isMobile = false }: { isMobile?: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick(t => t + 1), 450);
    return () => clearInterval(id);
  }, []);

  const width = isMobile ? 360 : 720;
  const height = isMobile ? 400 : 480;
  const mainR = isMobile ? 100 : 140;

  const orbs: OrbDef[] = useMemo(() => {
    const cx = width / 2;
    const cy = height / 2 - 10;
    if (isMobile) {
      return [
        { cx, cy, r: mainR, color: POUNAMU, glowColor: POUNAMU_GLOW, spinDuration: 30, spinDelay: 0, label: "assembl" },
        { cx: cx - 120, cy: cy - 60, r: 32, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 20, spinDelay: 0.5, label: "perceive" },
        { cx: cx + 120, cy: cy - 50, r: 28, color: STAR_WHITE, glowColor: "#FFFFFF", spinDuration: 25, spinDelay: 1, label: "reason" },
        { cx: cx - 100, cy: cy + 90, r: 25, color: POUNAMU_LIGHT, glowColor: POUNAMU_GLOW, spinDuration: 22, spinDelay: 1.5, label: "govern" },
        { cx: cx + 110, cy: cy + 80, r: 30, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 18, spinDelay: 0.8, label: "simulate" },
      ];
    }
    return [
      { cx, cy, r: mainR, color: POUNAMU, glowColor: POUNAMU_GLOW, spinDuration: 35, spinDelay: 0, label: "assembl" },
      { cx: cx - 220, cy: cy - 80, r: 42, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 20, spinDelay: 0.5, label: "perceive" },
      { cx: cx + 230, cy: cy - 60, r: 38, color: STAR_WHITE, glowColor: "#FFFFFF", spinDuration: 25, spinDelay: 1, label: "reason" },
      { cx: cx - 200, cy: cy + 100, r: 35, color: POUNAMU_LIGHT, glowColor: POUNAMU_GLOW, spinDuration: 22, spinDelay: 1.5, label: "govern" },
      { cx: cx + 210, cy: cy + 110, r: 40, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 18, spinDelay: 0.8, label: "simulate" },
      { cx: cx - 80, cy: cy - 150, r: 22, color: STAR_WHITE, glowColor: "#FFFFFF", spinDuration: 28, spinDelay: 2, label: "memory" },
      { cx: cx + 90, cy: cy - 140, r: 26, color: POUNAMU, glowColor: POUNAMU_GLOW, spinDuration: 24, spinDelay: 1.2, label: "action" },
      { cx: cx, cy: cy + 160, r: 28, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 26, spinDelay: 0.3, label: "explain" },
    ];
  }, [width, height, isMobile, mainR]);

  // Connection lines from satellite orbs to center
  const centerOrb = orbs[0];

  return (
    <div className="relative w-full flex justify-center" style={{ height }}>
      {/* Ambient glow layers */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 50% 45% at 50% 45%, rgba(58,125,110,0.12) 0%, transparent 60%)`
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 30% 25% at 35% 40%, rgba(74,159,212,0.06) 0%, transparent 50%)`
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 25% 20% at 65% 35%, rgba(255,255,255,0.03) 0%, transparent 45%)`
      }} />

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ maxWidth: width }}>
        <defs>
          <filter id="heroOrbGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="heroStarGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="connectionGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* ═══ CONNECTION LINES ═══ */}
        {orbs.slice(1).map((orb, i) => (
          <g key={`conn-${i}`}>
            {/* Glow line */}
            <motion.line
              x1={centerOrb.cx} y1={centerOrb.cy}
              x2={orb.cx} y2={orb.cy}
              stroke={orb.color}
              strokeWidth="1.5"
              filter="url(#connectionGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.15 }}
              transition={{ duration: 1.2, delay: 0.8 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Sharp line */}
            <motion.line
              x1={centerOrb.cx} y1={centerOrb.cy}
              x2={orb.cx} y2={orb.cy}
              stroke={orb.color}
              strokeWidth="0.5"
              strokeDasharray="4 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1.5, delay: 1 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Travelling pulse */}
            <motion.circle
              r={2}
              fill={orb.glowColor}
              filter="url(#heroStarGlow)"
              initial={{ opacity: 0 }}
              animate={{
                cx: [centerOrb.cx, orb.cx],
                cy: [centerOrb.cy, orb.cy],
                opacity: [0.8, 0],
              }}
              transition={{ duration: 2.5, delay: 2 + i * 0.6, repeat: Infinity, repeatDelay: 4 + i }}
            />
          </g>
        ))}

        {/* ═══ ORBS ═══ */}
        {orbs.map((orb, oi) => {
          const isMain = oi === 0;
          const nodeCount = isMain ? 20 : 6;
          const nodes = fibNodes(nodeCount, orb.r * 0.75, orb.cx, orb.cy);
          const weave = weaveStrands(orb.cx, orb.cy, orb.r * 1.6);

          return (
            <g key={`orb-${oi}`}>
              {/* Outer glow ring */}
              <motion.circle
                cx={orb.cx} cy={orb.cy} r={orb.r + (isMain ? 20 : 8)}
                fill="none" stroke={orb.color} strokeWidth="0.3" opacity="0.1"
                strokeDasharray={isMain ? "6 10" : "3 6"}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: orb.spinDuration * 2, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: `${orb.cx}px ${orb.cy}px` }}
              />

              {/* Orb sphere gradient */}
              <radialGradient id={`orbGrad-${oi}`} cx="35%" cy="28%" r="65%">
                <stop offset="0%" stopColor={orb.glowColor} stopOpacity={isMain ? "0.2" : "0.15"} />
                <stop offset="40%" stopColor={orb.color} stopOpacity={isMain ? "0.1" : "0.08"} />
                <stop offset="100%" stopColor={orb.color} stopOpacity="0" />
              </radialGradient>
              <circle cx={orb.cx} cy={orb.cy} r={orb.r} fill={`url(#orbGrad-${oi})`} />
              <circle cx={orb.cx} cy={orb.cy} r={orb.r - 2} fill="none" stroke={orb.color} strokeWidth="0.8" opacity="0.25" />
              {isMain && <circle cx={orb.cx} cy={orb.cy} r={orb.r - 8} fill="none" stroke={orb.glowColor} strokeWidth="0.4" opacity="0.12" />}

              {/* Specular highlight */}
              <ellipse
                cx={orb.cx - orb.r * 0.15}
                cy={orb.cy - orb.r * 0.4}
                rx={orb.r * 0.35}
                ry={orb.r * 0.15}
                fill="white" opacity="0.04"
              />

              {/* ── Rotating weave group ── */}
              <motion.g
                animate={{ rotate: [0, 360] }}
                transition={{ duration: orb.spinDuration, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: `${orb.cx}px ${orb.cy}px` }}
              >
                {/* Kete basket body */}
                <motion.ellipse
                  cx={orb.cx} cy={orb.cy}
                  rx={orb.r * 0.55} ry={orb.r * 0.65}
                  fill="none" stroke={orb.color} strokeWidth={isMain ? 2 : 1.2} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1.5, delay: orb.spinDelay, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Horizontal weave */}
                {weave.hLines.map((d, i) => (
                  <motion.path
                    key={`hw-${oi}-${i}`} d={d}
                    fill="none" stroke={i % 2 === 0 ? orb.color : orb.glowColor}
                    strokeWidth={isMain ? 1.2 : 0.7} opacity="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 0.8, delay: orb.spinDelay + 0.3 + i * 0.08 }}
                  />
                ))}

                {/* Vertical weave */}
                {weave.vLines.map((l, i) => (
                  <motion.line
                    key={`vw-${oi}-${i}`}
                    x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke={i % 2 === 0 ? orb.color : orb.glowColor}
                    strokeWidth={isMain ? 1 : 0.6} opacity="0.4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ duration: 0.8, delay: orb.spinDelay + 0.5 + i * 0.06 }}
                  />
                ))}

                {/* Handle arc */}
                <motion.path
                  d={`M ${orb.cx - orb.r * 0.3} ${orb.cy - orb.r * 0.35} Q ${orb.cx} ${orb.cy - orb.r * 0.7} ${orb.cx + orb.r * 0.3} ${orb.cy - orb.r * 0.35}`}
                  fill="none" stroke={orb.color} strokeWidth={isMain ? 2.2 : 1} strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: orb.spinDelay + 0.2 }}
                />
              </motion.g>

              {/* ── Data star nodes (don't spin, float independently) ── */}
              {nodes.map((node, ni) => {
                const depth = (node.z + 1) / 2;
                const isActive = (tick + ni + oi * 7) % 6 === 0;
                const opacity = 0.25 + depth * 0.75;
                const r = node.r * (0.5 + depth * 0.5);
                return (
                  <g key={`star-${oi}-${ni}`}>
                    {isActive && (
                      <motion.circle
                        cx={node.x} cy={node.y} r={r * 5}
                        fill="none" stroke={orb.glowColor} strokeWidth="0.4"
                        initial={{ scale: 0.5, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 1.2 }}
                      />
                    )}
                    <motion.circle
                      cx={node.x} cy={node.y}
                      r={isActive ? r * 2 : r}
                      fill={isActive ? orb.glowColor : orb.color}
                      filter={isActive ? "url(#heroStarGlow)" : undefined}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity }}
                      transition={{ delay: orb.spinDelay + 0.6 + ni * 0.04, duration: 0.4 }}
                    />
                    <motion.circle
                      cx={node.x - 0.3} cy={node.y - 0.3} r={r * 0.3}
                      fill="white" opacity={isActive ? 0.6 : 0.15}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: orb.spinDelay + 0.7 + ni * 0.04, duration: 0.2 }}
                    />
                  </g>
                );
              })}

              {/* Label */}
              {!isMain && (
                <motion.text
                  x={orb.cx} y={orb.cy + orb.r + 14}
                  textAnchor="middle"
                  fill={orb.color}
                  fontSize="8"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="2"
                  opacity="0.4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: orb.spinDelay + 1.5 }}
                >
                  {orb.label.toUpperCase()}
                </motion.text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
