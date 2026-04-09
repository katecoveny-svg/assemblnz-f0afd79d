import { motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";

interface Props {
  size?: number;
  accentColor?: string;
  accentLight?: string;
  className?: string;
  showNodes?: boolean;
  showGlow?: boolean;
}

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#5AADA0";
const POUNAMU_GLOW = "#7ECFC2";

// Generate data-node stars distributed on a sphere
function generateOrbNodes(count: number, radius: number, cx: number, cy: number) {
  const nodes: { x: number; y: number; z: number; r: number; delay: number; label: string }[] = [];
  const labels = [
    "perception", "memory", "reasoning", "action", "explain", "simulate",
    "audit", "policy", "context", "intent", "pii", "tikanga",
    "workflow", "alert", "schedule", "approve", "route", "log",
    "comply", "govern", "verify", "secure", "sync", "deploy",
  ];
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = 2 * Math.PI * i / phi;
    const nx = Math.cos(theta) * radiusAtY;
    const nz = Math.sin(theta) * radiusAtY;
    nodes.push({
      x: cx + nx * radius,
      y: cy + y * radius * 0.85,
      z: nz,
      r: 1.5 + Math.random() * 1.5,
      delay: i * 0.06,
      label: labels[i % labels.length],
    });
  }
  return nodes;
}

export default function KeteWeaveVisual({
  size = 200,
  accentColor = POUNAMU,
  accentLight = POUNAMU_LIGHT,
  className = "",
  showNodes = true,
  showGlow = true,
}: Props) {
  const [tick, setTick] = useState(0);
  const isHero = size >= 280;
  const nodeCount = isHero ? 24 : 0;
  const orbR = isHero ? 110 : 85;

  const orbNodes = useMemo(
    () => (showNodes && isHero ? generateOrbNodes(nodeCount, orbR, 150, 155) : []),
    [nodeCount, orbR, showNodes, isHero]
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  const uid = accentColor.replace(/[^a-zA-Z0-9]/g, "") + size;
  const hRows = [110, 127, 144, 161, 178, 195];
  const vCols = [75, 92, 109, 126, 143, 160];
  const vb = isHero ? "0 0 300 310" : "0 0 200 230";
  const bx = isHero ? 150 : 100;
  const by = isHero ? 155 : 120;

  // Basket path offset for hero
  const bOff = isHero ? 30 : 0;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size * 1.1 }}>
      {/* Outer pulsing orb glow */}
      {showGlow && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{ inset: "-40%", background: `radial-gradient(circle, ${POUNAMU}20 0%, ${POUNAMU}08 30%, transparent 55%)` }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ inset: "-20%", background: `radial-gradient(circle, ${POUNAMU_GLOW}12 0%, transparent 45%)`, border: `1px solid ${POUNAMU}18` }}
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          />
          {isHero && (
            <motion.div
              className="absolute rounded-full"
              style={{ inset: "-55%", background: `radial-gradient(circle, ${POUNAMU}10 0%, transparent 40%)` }}
              animate={{ scale: [1.05, 1.2, 1.05], opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          )}
        </>
      )}

      {/* Spinning SVG */}
      <motion.svg
        viewBox={vb}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label="Kete basket — woven knowledge container"
        style={{ filter: `drop-shadow(0 0 ${isHero ? 25 : 8}px ${POUNAMU}50)` }}
        animate={isHero ? { rotateY: [0, 360] } : undefined}
        transition={isHero ? { duration: 40, repeat: Infinity, ease: "linear" } : undefined}
      >
        <defs>
          <radialGradient id={`orb-${uid}`} cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor={POUNAMU_GLOW} stopOpacity="0.2" />
            <stop offset="35%" stopColor={POUNAMU} stopOpacity="0.1" />
            <stop offset="100%" stopColor={POUNAMU} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`glass-${uid}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <filter id={`starGlow-${uid}`}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`nodeGlow-${uid}`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Orb sphere rings */}
        <circle cx={bx} cy={by} r={orbR} fill={`url(#orb-${uid})`} />
        <circle cx={bx} cy={by} r={orbR - 2} fill="none" stroke={POUNAMU} strokeWidth="0.8" opacity="0.25" />
        {isHero && <circle cx={bx} cy={by} r={orbR - 8} fill="none" stroke={POUNAMU_LIGHT} strokeWidth="0.4" opacity="0.12" />}
        {isHero && <circle cx={bx} cy={by} r={orbR + 12} fill="none" stroke={POUNAMU} strokeWidth="0.3" opacity="0.08" strokeDasharray="4 8" />}

        {/* Specular highlight */}
        <ellipse cx={bx - 20} cy={by - orbR * 0.45} rx={orbR * 0.4} ry={orbR * 0.18} fill="white" opacity="0.04" />

        {/* ═══ DATA NODE STARS ═══ */}
        {orbNodes.map((node, i) => {
          const depth = (node.z + 1) / 2; // 0 = back, 1 = front
          const isActive = (tick + i) % 5 === 0;
          const opacity = 0.3 + depth * 0.7;
          const r = node.r * (0.6 + depth * 0.6);
          return (
            <g key={`star-${i}`}>
              {/* Connection lines to nearest neighbors */}
              {i > 0 && i % 3 === 0 && (
                <motion.line
                  x1={node.x} y1={node.y}
                  x2={orbNodes[(i - 1) % orbNodes.length].x}
                  y2={orbNodes[(i - 1) % orbNodes.length].y}
                  stroke={POUNAMU_LIGHT}
                  strokeWidth="0.3"
                  opacity={depth * 0.15}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.5 + node.delay, duration: 0.8 }}
                />
              )}
              {/* Pulse ring on active nodes */}
              {isActive && (
                <motion.circle
                  cx={node.x} cy={node.y} r={r * 4}
                  fill="none" stroke={POUNAMU_GLOW} strokeWidth="0.5"
                  initial={{ scale: 0.5, opacity: 0.7 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.2 }}
                />
              )}
              {/* Star node */}
              <motion.circle
                cx={node.x} cy={node.y}
                r={isActive ? r * 1.8 : r}
                fill={isActive ? POUNAMU_GLOW : accentColor}
                filter={isActive ? `url(#starGlow-${uid})` : undefined}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity }}
                transition={{ delay: 0.8 + node.delay, duration: 0.4 }}
              />
              {/* White specular */}
              <motion.circle
                cx={node.x - 0.4} cy={node.y - 0.4}
                r={r * 0.35}
                fill="white"
                opacity={isActive ? 0.7 : 0.2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + node.delay, duration: 0.2 }}
              />
            </g>
          );
        })}

        {/* ═══ KETE BASKET ═══ */}
        {/* Body glass fill */}
        <path
          d={isHero
            ? "M 65 110 Q 65 230 150 240 Q 235 230 235 110"
            : "M 35 80 Q 35 190 100 200 Q 165 190 165 80"
          }
          fill={`url(#glass-${uid})`}
        />
        {/* Body stroke */}
        <motion.path
          d={isHero
            ? "M 65 110 Q 65 230 150 240 Q 235 230 235 110"
            : "M 35 80 Q 35 190 100 200 Q 165 190 165 80"
          }
          fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Inner highlight */}
        <motion.path
          d={isHero
            ? "M 70 112 Q 70 226 150 236 Q 230 226 230 112"
            : "M 40 82 Q 40 186 100 196 Q 160 186 160 82"
          }
          fill="none" stroke="white" strokeWidth="0.5" opacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />

        {/* Horizontal weave */}
        {(isHero
          ? [125, 142, 159, 176, 193, 210]
          : hRows
        ).map((y, i) => {
          const inset = i * 1.5;
          const wave = Math.sin(i * 0.8) * 2;
          const left = isHero ? 72 - inset : 42 - inset;
          const right = isHero ? 228 + inset : 158 + inset;
          const mid = isHero ? 150 : 100;
          return (
            <g key={`h-${y}`}>
              <motion.path
                d={`M ${left} ${y + wave} Q ${mid} ${y - 3 + wave} ${right} ${y + wave}`}
                fill="none"
                stroke={i % 2 === 0 ? accentColor : accentLight}
                strokeWidth="1.4" opacity="0.7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d={`M ${left} ${y + wave + 1.5} Q ${mid} ${y - 1.5 + wave} ${right} ${y + wave + 1.5}`}
                fill="none" stroke="black" strokeWidth="0.5" opacity="0.15"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </g>
          );
        })}

        {/* Vertical weave */}
        {(isHero
          ? [85, 102, 119, 136, 153, 170, 185, 200, 215]
          : vCols
        ).map((x, i) => (
          <motion.line
            key={`v-${x}`}
            x1={x} y1={isHero ? 115 : 85}
            x2={x + (i % 2 === 0 ? 2 : -2)} y2={isHero ? 230 : 190}
            stroke={i % 2 === 0 ? accentColor : accentLight}
            strokeWidth="1.3" opacity="0.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.8, delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* Weave intersection nodes (non-hero only) */}
        {showNodes && !isHero && hRows.map((y, yi) =>
          vCols.map((x, xi) => {
            const nodeIdx = yi * vCols.length + xi;
            const isFlashing = (tick + nodeIdx) % 7 === 0;
            return (
              <g key={`n-${x}-${y}`} filter={isFlashing ? `url(#nodeGlow-${uid})` : undefined}>
                {isFlashing && (
                  <motion.circle cx={x} cy={y} r={8} fill="none" stroke={POUNAMU_GLOW} strokeWidth="0.5"
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                <motion.circle
                  cx={x} cy={y}
                  r={isFlashing ? 3.5 : 2.2}
                  fill={isFlashing ? POUNAMU_GLOW : accentColor}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: isFlashing ? 1 : 0.7 }}
                  transition={{ delay: 0.8 + nodeIdx * 0.03, duration: 0.3 }}
                />
                <motion.circle
                  cx={x - 0.5} cy={y - 0.5}
                  r={0.9}
                  fill="white" opacity={isFlashing ? 0.6 : 0.15}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + nodeIdx * 0.03, duration: 0.2 }}
                />
              </g>
            );
          })
        )}

        {/* Handle */}
        <motion.path
          d={isHero
            ? "M 100 110 Q 150 35 200 110"
            : "M 65 80 Q 100 20 135 80"
          }
          fill="none" stroke={accentColor} strokeWidth="2.8" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d={isHero
            ? "M 105 107 Q 150 42 195 107"
            : "M 70 77 Q 100 28 130 77"
          }
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        />
      </motion.svg>
    </div>
  );
}
