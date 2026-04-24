import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

/**
 * HeroKeteNetwork — A network of 3D woven flax kete baskets
 * Each kete has a proper basket silhouette: wide rim, tapered base, diagonal harakeke weave, handle
 */

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#5AADA0";
const POUNAMU_GLOW = "#7ECFC2";
const SIGNAL_BLUE = "#4A9FD4";
const STAR_WHITE = "#E8E8E8";

interface OrbDef {
  cx: number; cy: number; r: number;
  color: string; glowColor: string;
  spinDuration: number; spinDelay: number; label: string;
}

/** Proper kete basket silhouette path — wide rim tapering to rounded base */
function ketePath(cx: number, cy: number, r: number) {
  const rimW = r * 0.9;          // half-width at rim
  const baseW = r * 0.35;        // half-width at base
  const rimY = cy - r * 0.45;    // top of basket
  const baseY = cy + r * 0.55;   // bottom
  const cpY = cy + r * 0.3;      // control point for taper curve

  // Basket body — trapezoidal with rounded bottom
  const body = `M ${cx - rimW} ${rimY}
    Q ${cx - rimW * 0.95} ${cpY} ${cx - baseW} ${baseY}
    Q ${cx} ${baseY + r * 0.15} ${cx + baseW} ${baseY}
    Q ${cx + rimW * 0.95} ${cpY} ${cx + rimW} ${rimY}`;

  // Handle arc
  const handle = `M ${cx - rimW * 0.55} ${rimY}
    Q ${cx} ${rimY - r * 0.55} ${cx + rimW * 0.55} ${rimY}`;

  // Rim line
  const rim = `M ${cx - rimW} ${rimY} L ${cx + rimW} ${rimY}`;

  return { body, handle, rim, rimY, baseY, rimW, baseW, cpY };
}

/** Diagonal harakeke (flax) weave lines inside the kete shape */
function flaxWeave(cx: number, cy: number, r: number, count: number) {
  const rimW = r * 0.9;
  const baseW = r * 0.35;
  const rimY = cy - r * 0.45;
  const baseY = cy + r * 0.55;

  // Helper: width at a given Y
  const widthAtY = (y: number) => {
    const t = (y - rimY) / (baseY - rimY); // 0 at rim, 1 at base
    return rimW + (baseW - rimW) * t * t;  // quadratic taper
  };

  const diag1: string[] = []; // top-left to bottom-right
  const diag2: string[] = []; // top-right to bottom-left

  const step = (baseY - rimY) / (count + 1);

  for (let i = 1; i <= count; i++) {
    const startY = rimY + step * (i - 1);
    const endY = Math.min(rimY + step * (i + 2), baseY);
    const startW = widthAtY(startY);
    const endW = widthAtY(endY);

    // Diagonal left→right
    diag1.push(`M ${cx - startW * 0.85} ${startY} L ${cx + endW * 0.6} ${endY}`);
    // Diagonal right→left
    diag2.push(`M ${cx + startW * 0.85} ${startY} L ${cx - endW * 0.6} ${endY}`);
  }

  // Horizontal weave bands
  const hBands: string[] = [];
  for (let i = 1; i <= count + 1; i++) {
    const y = rimY + step * i;
    if (y >= baseY) break;
    const w = widthAtY(y);
    hBands.push(`M ${cx - w * 0.92} ${y} Q ${cx} ${y - 1.5} ${cx + w * 0.92} ${y}`);
  }

  return { diag1, diag2, hBands };
}

/** Fibonacci-distributed data nodes inside basket area */
function dataNodes(cx: number, cy: number, r: number, count: number) {
  const rimY = cy - r * 0.4;
  const baseY = cy + r * 0.45;
  const rimW = r * 0.8;
  const baseW = r * 0.3;
  const nodes: { x: number; y: number; depth: number }[] = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = rimY + t * (baseY - rimY);
    const w = rimW + (baseW - rimW) * t * t;
    const angle = 2 * Math.PI * i / phi;
    const rx = Math.cos(angle) * w * 0.7;
    nodes.push({ x: cx + rx, y, depth: (Math.sin(angle) + 1) / 2 });
  }
  return nodes;
}

export default function HeroKeteNetwork({ isMobile = false }: { isMobile?: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  const width = isMobile ? 360 : 720;
  const height = isMobile ? 420 : 500;
  const mainR = isMobile ? 110 : 150;

  const orbs: OrbDef[] = useMemo(() => {
    const cx = width / 2;
    const cy = height / 2;
    if (isMobile) {
      return [
        { cx, cy, r: mainR, color: POUNAMU, glowColor: POUNAMU_GLOW, spinDuration: 35, spinDelay: 0, label: "assembl" },
        { cx: cx - 115, cy: cy - 70, r: 35, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 22, spinDelay: 0.5, label: "perceive" },
        { cx: cx + 115, cy: cy - 55, r: 30, color: STAR_WHITE, glowColor: "#FFF", spinDuration: 26, spinDelay: 1, label: "reason" },
        { cx: cx - 100, cy: cy + 100, r: 28, color: POUNAMU_LIGHT, glowColor: POUNAMU_GLOW, spinDuration: 24, spinDelay: 1.5, label: "govern" },
        { cx: cx + 105, cy: cy + 95, r: 32, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 20, spinDelay: 0.8, label: "simulate" },
      ];
    }
    return [
      { cx, cy, r: mainR, color: POUNAMU, glowColor: POUNAMU_GLOW, spinDuration: 40, spinDelay: 0, label: "assembl" },
      { cx: cx - 225, cy: cy - 80, r: 48, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 22, spinDelay: 0.5, label: "perceive" },
      { cx: cx + 235, cy: cy - 60, r: 42, color: STAR_WHITE, glowColor: "#FFF", spinDuration: 28, spinDelay: 1, label: "reason" },
      { cx: cx - 210, cy: cy + 110, r: 40, color: POUNAMU_LIGHT, glowColor: POUNAMU_GLOW, spinDuration: 24, spinDelay: 1.5, label: "govern" },
      { cx: cx + 220, cy: cy + 120, r: 44, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 20, spinDelay: 0.8, label: "simulate" },
      { cx: cx - 80, cy: cy - 160, r: 26, color: STAR_WHITE, glowColor: "#FFF", spinDuration: 30, spinDelay: 2, label: "memory" },
      { cx: cx + 90, cy: cy - 150, r: 30, color: POUNAMU, glowColor: POUNAMU_GLOW, spinDuration: 26, spinDelay: 1.2, label: "action" },
      { cx: cx, cy: cy + 170, r: 32, color: SIGNAL_BLUE, glowColor: "#7AC4E8", spinDuration: 28, spinDelay: 0.3, label: "explain" },
    ];
  }, [width, height, isMobile, mainR]);

  const center = orbs[0];

  return (
    <div className="relative w-full flex justify-center" style={{ height }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 50% 45% at 50% 48%, rgba(58,125,110,0.12) 0%, transparent 60%)`
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 30% 25% at 35% 42%, rgba(74,159,212,0.06) 0%, transparent 50%)`
      }} />

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ maxWidth: width }}>
        <defs>
          <filter id="keteGlow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="starPulse"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="lineGlow"><feGaussianBlur stdDeviation="2" /></filter>
        </defs>

        {/* ═══ CONNECTION LINES ═══ */}
        {orbs.slice(1).map((orb, i) => (
          <g key={`conn-${i}`}>
            <motion.line
              x1={center.cx} y1={center.cy} x2={orb.cx} y2={orb.cy}
              stroke={orb.color} strokeWidth="1.2" filter="url(#lineGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.12 }}
              transition={{ duration: 1.2, delay: 0.8 + i * 0.15 }}
            />
            <motion.line
              x1={center.cx} y1={center.cy} x2={orb.cx} y2={orb.cy}
              stroke={orb.color} strokeWidth="0.4" strokeDasharray="3 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.25 }}
              transition={{ duration: 1.5, delay: 1 + i * 0.15 }}
            />
            {/* Travelling pulse */}
            <motion.circle r={1.8} fill={orb.glowColor} filter="url(#starPulse)"
              initial={{ opacity: 0 }}
              animate={{ cx: [center.cx, orb.cx], cy: [center.cy, orb.cy], opacity: [0.7, 0] }}
              transition={{ duration: 2.5, delay: 2 + i * 0.7, repeat: Infinity, repeatDelay: 5 + i }}
            />
          </g>
        ))}

        {/* ═══ KETE BASKETS ═══ */}
        {orbs.map((orb, oi) => {
          const isMain = oi === 0;
          const kete = ketePath(orb.cx, orb.cy, orb.r);
          const weave = flaxWeave(orb.cx, orb.cy, orb.r, isMain ? 7 : 4);
          const nodes = isMain ? dataNodes(orb.cx, orb.cy, orb.r, 16) : dataNodes(orb.cx, orb.cy, orb.r, 5);
          const sw = isMain ? 2 : 1.2; // stroke width

          return (
            <g key={`kete-${oi}`}>
              {/* Outer glow orb */}
              <motion.circle
                cx={orb.cx} cy={orb.cy} r={orb.r + (isMain ? 25 : 10)}
                fill="none" stroke={orb.color} strokeWidth="0.3" strokeDasharray={isMain ? "5 8" : "3 5"}
                opacity="0.08"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: orb.spinDuration * 1.5, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: `${orb.cx}px ${orb.cy}px` }}
              />

              {/* Soft inner glow */}
              <radialGradient id={`kg-${oi}`} cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor={orb.glowColor} stopOpacity={isMain ? "0.12" : "0.08"} />
                <stop offset="100%" stopColor={orb.color} stopOpacity="0" />
              </radialGradient>
              <ellipse cx={orb.cx} cy={orb.cy} rx={orb.r * 0.9} ry={orb.r * 0.7} fill={`url(#kg-${oi})`} />

              {/* ── Slowly rotating kete ── */}
              <motion.g
                animate={{ rotate: [0, 360] }}
                transition={{ duration: orb.spinDuration, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: `${orb.cx}px ${orb.cy}px` }}
              >
                {/* Basket body silhouette */}
                <motion.path
                  d={kete.body} fill="none" stroke={orb.color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 1.5, delay: orb.spinDelay }}
                />
                {/* Inner body highlight */}
                <motion.path
                  d={kete.body} fill="none" stroke="white" strokeWidth={sw * 0.3} opacity="0.06"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: orb.spinDelay + 0.1 }}
                />

                {/* Rim — thicker line */}
                <motion.path
                  d={kete.rim} fill="none" stroke={orb.color} strokeWidth={sw * 1.5} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: 0.8, delay: orb.spinDelay + 0.2 }}
                />

                {/* Handle */}
                <motion.path
                  d={kete.handle} fill="none" stroke={orb.color} strokeWidth={sw * 1.2} strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: orb.spinDelay + 0.3 }}
                />
                <motion.path
                  d={kete.handle} fill="none" stroke="white" strokeWidth={sw * 0.3} opacity="0.1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: orb.spinDelay + 0.4 }}
                />

                {/* ── Diagonal flax weave — left-to-right ── */}
                {weave.diag1.map((d, i) => (
                  <motion.path
                    key={`d1-${oi}-${i}`} d={d}
                    fill="none" stroke={orb.color} strokeWidth={sw * 0.6} opacity="0.4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ duration: 0.6, delay: orb.spinDelay + 0.5 + i * 0.08 }}
                  />
                ))}
                {/* Diagonal flax weave — right-to-left */}
                {weave.diag2.map((d, i) => (
                  <motion.path
                    key={`d2-${oi}-${i}`} d={d}
                    fill="none" stroke={i % 2 === 0 ? orb.glowColor : orb.color} strokeWidth={sw * 0.6} opacity="0.35"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.35 }}
                    transition={{ duration: 0.6, delay: orb.spinDelay + 0.6 + i * 0.08 }}
                  />
                ))}
                {/* Horizontal bands */}
                {weave.hBands.map((d, i) => (
                  <motion.path
                    key={`hb-${oi}-${i}`} d={d}
                    fill="none" stroke={orb.color} strokeWidth={sw * 0.45} opacity="0.25"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.25 }}
                    transition={{ duration: 0.5, delay: orb.spinDelay + 0.7 + i * 0.06 }}
                  />
                ))}
              </motion.g>

              {/* ── Data star nodes (independent of spin) ── */}
              {nodes.map((node, ni) => {
                const isActive = (tick + ni + oi * 5) % 6 === 0;
                const r = 1.2 + node.depth * 1.2;
                const op = 0.3 + node.depth * 0.6;
                return (
                  <g key={`n-${oi}-${ni}`}>
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
                      r={isActive ? r * 1.8 : r}
                      fill={isActive ? orb.glowColor : orb.color}
                      filter={isActive ? "url(#starPulse)" : undefined}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: op }}
                      transition={{ delay: orb.spinDelay + 0.8 + ni * 0.05, duration: 0.4 }}
                    />
                    <motion.circle
                      cx={node.x - 0.3} cy={node.y - 0.3} r={r * 0.3}
                      fill="white" opacity={isActive ? 0.6 : 0.15}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: orb.spinDelay + 0.9 + ni * 0.05, duration: 0.2 }}
                    />
                  </g>
                );
              })}

              {/* Label */}
              {!isMain && (
                <motion.text
                  x={orb.cx} y={orb.cy + orb.r + 16}
                  textAnchor="middle" fill={orb.color}
                  fontSize="8" fontFamily="'IBM Plex Mono', monospace"
                  letterSpacing="2" opacity="0.35"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
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
