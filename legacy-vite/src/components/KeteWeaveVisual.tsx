import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * KeteWeaveVisual — SVG woven flax kete basket with proper Māori basket silhouette
 * Wide rim, tapered base, diagonal harakeke cross-weave, handle
 */

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

export default function KeteWeaveVisual({
  size = 200,
  accentColor = POUNAMU,
  accentLight = POUNAMU_LIGHT,
  className = "",
  showNodes = true,
  showGlow = true,
}: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick(t => t + 1), 600);
    return () => clearInterval(id);
  }, []);

  const uid = (accentColor + size).replace(/[^a-zA-Z0-9]/g, "");

  // Kete geometry — centred at 100,120 in a 200×230 viewBox
  const cx = 100, cy = 125;
  const rimW = 65;       // half-width at rim
  const baseW = 25;      // half-width at base
  const rimY = 70;       // top of basket
  const baseY = 195;     // bottom of basket
  const cpY = 160;       // taper control point

  const bodyPath = `M ${cx - rimW} ${rimY}
    Q ${cx - rimW * 0.95} ${cpY} ${cx - baseW} ${baseY}
    Q ${cx} ${baseY + 12} ${cx + baseW} ${baseY}
    Q ${cx + rimW * 0.95} ${cpY} ${cx + rimW} ${rimY}`;

  const handlePath = `M ${cx - rimW * 0.5} ${rimY}
    Q ${cx} ${rimY - 50} ${cx + rimW * 0.5} ${rimY}`;

  const rimPath = `M ${cx - rimW} ${rimY} L ${cx + rimW} ${rimY}`;

  // Width at a given Y for clipping weave to body
  const widthAtY = (y: number) => {
    const t = (y - rimY) / (baseY - rimY);
    return rimW + (baseW - rimW) * t * t;
  };

  // Diagonal weave count
  const weaveCount = 6;
  const step = (baseY - rimY) / (weaveCount + 1);

  // Build diagonal weave lines
  const diag1: string[] = [];
  const diag2: string[] = [];
  const hBands: string[] = [];

  for (let i = 1; i <= weaveCount; i++) {
    const startY = rimY + step * (i - 1);
    const endY = Math.min(rimY + step * (i + 2), baseY);
    const sw = widthAtY(startY);
    const ew = widthAtY(endY);
    diag1.push(`M ${cx - sw * 0.85} ${startY} L ${cx + ew * 0.6} ${endY}`);
    diag2.push(`M ${cx + sw * 0.85} ${startY} L ${cx - ew * 0.6} ${endY}`);
  }

  for (let i = 1; i <= weaveCount + 1; i++) {
    const y = rimY + step * i;
    if (y >= baseY) break;
    const w = widthAtY(y);
    hBands.push(`M ${cx - w * 0.92} ${y} Q ${cx} ${y - 1.5} ${cx + w * 0.92} ${y}`);
  }

  // Node intersections
  const nodePositions: { x: number; y: number }[] = [];
  if (showNodes) {
    for (let i = 1; i <= weaveCount; i++) {
      const y = rimY + step * i;
      if (y >= baseY - 5) break;
      const w = widthAtY(y);
      const cols = 4;
      for (let j = 0; j < cols; j++) {
        const x = cx - w * 0.7 + (w * 1.4 / (cols - 1)) * j;
        nodePositions.push({ x, y });
      }
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {showGlow && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{ inset: "-30%", background: `radial-gradient(circle, ${accentColor}15 0%, transparent 55%)` }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"
        role="img" aria-label="Kete basket — woven flax knowledge container"
        style={{ filter: `drop-shadow(0 0 ${size > 80 ? 12 : 5}px ${accentColor}40)` }}
      >
        <defs>
          <radialGradient id={`glow-${uid}`} cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <filter id={`ng-${uid}`}>
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Soft fill */}
        <path d={bodyPath} fill={`url(#glow-${uid})`} />

        {/* Basket body stroke */}
        <motion.path
          d={bodyPath} fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d={bodyPath} fill="none" stroke="white" strokeWidth="0.4" opacity="0.06"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />

        {/* Rim */}
        <motion.path
          d={rimPath} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Handle */}
        <motion.path
          d={handlePath} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.path
          d={handlePath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Diagonal weave — left to right */}
        {diag1.map((d, i) => (
          <motion.path
            key={`d1-${i}`} d={d}
            fill="none" stroke={accentColor} strokeWidth="1" opacity="0.45"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.45 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.07 }}
          />
        ))}
        {/* Diagonal weave — right to left */}
        {diag2.map((d, i) => (
          <motion.path
            key={`d2-${i}`} d={d}
            fill="none" stroke={accentLight} strokeWidth="1" opacity="0.35"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.35 }}
            transition={{ duration: 0.6, delay: 0.5 + i * 0.07 }}
          />
        ))}
        {/* Horizontal bands */}
        {hBands.map((d, i) => (
          <motion.path
            key={`hb-${i}`} d={d}
            fill="none" stroke={accentColor} strokeWidth="0.6" opacity="0.25"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.25 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
          />
        ))}

        {/* Intersection nodes */}
        {nodePositions.map((node, ni) => {
          const isActive = (tick + ni) % 7 === 0;
          return (
            <g key={`n-${ni}`} filter={isActive ? `url(#ng-${uid})` : undefined}>
              {isActive && (
                <motion.circle
                  cx={node.x} cy={node.y} r={7}
                  fill="none" stroke={POUNAMU_GLOW} strokeWidth="0.4"
                  initial={{ scale: 0.5, opacity: 0.7 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
              <motion.circle
                cx={node.x} cy={node.y}
                r={isActive ? 3 : 1.8}
                fill={isActive ? POUNAMU_GLOW : accentColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isActive ? 1 : 0.6 }}
                transition={{ delay: 0.7 + ni * 0.03, duration: 0.3 }}
              />
              <motion.circle
                cx={node.x - 0.4} cy={node.y - 0.4} r={0.6}
                fill="white" opacity={isActive ? 0.5 : 0.12}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + ni * 0.03, duration: 0.2 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
