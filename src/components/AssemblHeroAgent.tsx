import { motion } from "framer-motion";
import { useState } from "react";
import heroImg from "@/assets/agents/hero-orb-robot.png";
import assembLogo from "@/assets/assembl-logo-mark.png";

/* ─── Brand Colours ─── */
const BRAND_COLORS = [
  "hsla(189, 100%, 50%, 0.9)",   // Cyan
  "hsla(224, 100%, 68%, 0.9)",   // Deep Blue
  "hsla(263, 100%, 76%, 0.8)",   // Purple
  "hsla(200, 100%, 80%, 0.7)",   // Light Cyan
  "hsla(210, 100%, 60%, 0.8)",   // Blue
];

/* ─── Stars ─── */
interface Star {
  id: number; x: number; y: number; size: number;
  opacity: number; duration: number; delay: number; color: string;
}

const generateStars = (count: number): Star[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.8 + 0.2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
  }));

const CosmicStarField = () => {
  const [stars] = useState(() => generateStars(80));
  return (
    <div className="absolute inset-0 overflow-hidden rounded-full">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: s.color,
            boxShadow: `0 0 ${s.size * 4}px ${s.color}`,
          }}
          animate={{
            opacity: [s.opacity * 0.2, s.opacity, s.opacity * 0.2],
            scale: [0.6, 1.6, 0.6],
          }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

/* ─── Floating Orb ─── */
const FloatingOrb = ({ color, size, orbitRadius, duration, delay, glow }: {
  color: string; size: number; orbitRadius: number; duration: number; delay: number; glow: string;
}) => {
  const steps = 5;
  const xs = Array.from({ length: steps + 1 }, (_, i) => Math.cos((i / steps) * Math.PI * 2) * orbitRadius);
  const ys = Array.from({ length: steps + 1 }, (_, i) => Math.sin((i / steps) * Math.PI * 2) * orbitRadius);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size, height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        boxShadow: `0 0 ${size * 2}px ${glow}, 0 0 ${size * 4}px ${glow}`,
        top: "50%", left: "50%",
      }}
      animate={{ x: xs, y: ys, scale: [1, 1.4, 1, 0.7, 1, 1], opacity: [0.5, 1, 0.6, 1, 0.5, 0.5] }}
      transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
    />
  );
};

/* ─── Floating Assembl Logo ─── */
const FloatingAssemblLogo = ({ orbitRadius, duration, delay, logoSize, startAngle = 0 }: {
  orbitRadius: number; duration: number; delay: number; logoSize: number; startAngle?: number;
}) => {
  const steps = 8;
  const xs = Array.from({ length: steps + 1 }, (_, i) => Math.cos((i / steps) * Math.PI * 2 + startAngle) * orbitRadius);
  const ys = Array.from({ length: steps + 1 }, (_, i) => Math.sin((i / steps) * Math.PI * 2 + startAngle) * orbitRadius);

  return (
    <motion.img
      src={assembLogo}
      alt=""
      className="absolute z-[5] pointer-events-none"
      style={{
        width: logoSize, height: logoSize,
        top: "50%", left: "50%",
        marginTop: -logoSize / 2, marginLeft: -logoSize / 2,
        filter: "drop-shadow(0 0 8px hsla(189,100%,50%,0.6)) drop-shadow(0 0 16px hsla(263,100%,76%,0.3))",
      }}
      animate={{
        x: xs, y: ys,
        opacity: [0.4, 0.85, 0.5, 0.9, 0.4, 0.7, 0.4, 0.85, 0.4],
        scale: [0.8, 1.1, 0.9, 1.15, 0.85, 1.05, 0.8, 1.1, 0.8],
        rotate: [0, 15, -10, 20, -5, 10, -15, 5, 0],
      }}
      transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
      draggable={false}
    />
  );
};


const CosmicRing = ({ radius, color, duration, opacity, thickness = 1.5 }: {
  radius: number; color: string; duration: number; opacity: number; thickness?: number;
}) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: radius * 2, height: radius * 2,
      border: `${thickness}px solid ${color}`,
      top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    }}
    animate={{
      opacity: [opacity * 0.3, opacity, opacity * 0.3],
      scale: [0.97, 1.03, 0.97],
      rotate: [0, 360],
    }}
    transition={{
      opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration, repeat: Infinity, ease: "linear" },
    }}
  />
);

/* ─── Nexus Logo ─── */
const NexusLogo = ({ size }: { size: number }) => {
  const s = size * 0.12;
  const cx = s / 2;
  const r = s * 0.38;
  const orbR = s * 0.1;

  const topX = cx; const topY = cx - r;
  const blX = cx - r * Math.cos(Math.PI / 6); const blY = cx + r * Math.sin(Math.PI / 6);
  const brX = cx + r * Math.cos(Math.PI / 6); const brY = cx + r * Math.sin(Math.PI / 6);

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="absolute z-20"
      style={{ top: "58%", left: "50%", transform: "translate(-50%, -50%)" }}>
      <motion.line x1={topX} y1={topY} x2={blX} y2={blY} stroke="hsla(189,100%,50%,0.7)" strokeWidth={1.5}
        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.line x1={topX} y1={topY} x2={brX} y2={brY} stroke="hsla(263,100%,76%,0.7)" strokeWidth={1.5}
        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
      <motion.line x1={blX} y1={blY} x2={brX} y2={brY} stroke="hsla(224,100%,68%,0.7)" strokeWidth={1.5}
        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
      {[[topX, topY, "hsl(189,100%,50%)", "hsla(189,100%,50%,0.9)", 0],
        [blX, blY, "hsl(263,100%,76%)", "hsla(263,100%,76%,0.9)", 0.3],
        [brX, brY, "hsl(224,100%,68%)", "hsla(224,100%,68%,0.9)", 0.6],
      ].map(([x, y, fill, glow, d], i) => (
        <motion.circle key={i} cx={x as number} cy={y as number} r={orbR} fill={fill as string}
          animate={{ r: [orbR, orbR * 1.5, orbR], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: d as number }}
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }} />
      ))}
    </svg>
  );
};

/* ─── Main Component ─── */
const AssemblHeroAgent = ({ size = 420 }: { size?: number }) => {
  const orbSize = size * 1.45;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: orbSize, height: orbSize }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Deep cosmic orb background */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: orbSize,
          height: orbSize,
          background: `radial-gradient(circle at 45% 40%, 
            hsla(189, 100%, 50%, 0.14) 0%, 
            hsla(224, 100%, 68%, 0.1) 20%, 
            hsla(210, 100%, 60%, 0.07) 40%, 
            hsla(263, 100%, 76%, 0.04) 60%, 
            transparent 80%)`,
          border: "1px solid hsla(189, 100%, 50%, 0.06)",
        }}
        animate={{
          boxShadow: [
            `0 0 80px hsla(189,100%,50%,0.1), 0 0 160px hsla(224,100%,68%,0.06), 0 0 240px hsla(210,100%,60%,0.03)`,
            `0 0 120px hsla(189,100%,50%,0.18), 0 0 240px hsla(224,100%,68%,0.12), 0 0 360px hsla(210,100%,60%,0.06), 0 0 500px hsla(263,100%,76%,0.03)`,
            `0 0 80px hsla(189,100%,50%,0.1), 0 0 160px hsla(224,100%,68%,0.06), 0 0 240px hsla(210,100%,60%,0.03)`,
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Star field */}
      <CosmicStarField />

      {/* Cosmic rings */}
      <CosmicRing radius={orbSize * 0.48} color="hsla(189, 100%, 50%, 0.12)" duration={35} opacity={0.5} />
      <CosmicRing radius={orbSize * 0.42} color="hsla(224, 100%, 68%, 0.1)" duration={28} opacity={0.4} thickness={1} />
      <CosmicRing radius={orbSize * 0.36} color="hsla(210, 100%, 60%, 0.08)" duration={22} opacity={0.3} thickness={1} />

      {/* Inner blue glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: `radial-gradient(circle, hsla(189,100%,50%,0.2), hsla(224,100%,68%,0.12), transparent 70%)`,
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating orbs */}
      <FloatingOrb color="hsla(189,100%,50%,0.5)" size={16} orbitRadius={orbSize * 0.4} duration={14} delay={0} glow="hsla(189,100%,50%,0.5)" />
      <FloatingOrb color="hsla(224,100%,68%,0.5)" size={12} orbitRadius={orbSize * 0.36} duration={18} delay={2} glow="hsla(224,100%,68%,0.4)" />
      <FloatingOrb color="hsla(263,100%,76%,0.4)" size={10} orbitRadius={orbSize * 0.44} duration={20} delay={4} glow="hsla(263,100%,76%,0.3)" />
      <FloatingOrb color="hsla(200,100%,70%,0.4)" size={8} orbitRadius={orbSize * 0.32} duration={11} delay={1} glow="hsla(200,100%,70%,0.3)" />
      <FloatingOrb color="hsla(189,100%,60%,0.3)" size={7} orbitRadius={orbSize * 0.46} duration={24} delay={3} glow="hsla(189,100%,60%,0.3)" />
      <FloatingOrb color="hsla(210,100%,65%,0.4)" size={11} orbitRadius={orbSize * 0.28} duration={16} delay={5} glow="hsla(210,100%,65%,0.3)" />

      {/* Orbiting particle trails */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: orbSize * 0.88, height: orbSize * 0.88,
            top: "50%", left: "50%",
            marginTop: -orbSize * 0.44, marginLeft: -orbSize * 0.44,
          }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 12 + i * 2.5, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              background: BRAND_COLORS[i % BRAND_COLORS.length],
              boxShadow: `0 0 ${8 + i * 3}px ${BRAND_COLORS[i % BRAND_COLORS.length]}`,
              top: 0, left: "50%", transform: "translateX(-50%)",
            }}
          />
        </motion.div>
      ))}

      {/* Robot with bob + tilt + rotation animations */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{ width: size, height: size }}
        animate={{
          y: [0, -18, 0],
          rotate: [0, 1.5, 0, -1.5, 0],
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* Blue glow behind robot */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 0.8, height: size * 0.8,
            background: `radial-gradient(circle, hsla(189,100%,50%,0.3), hsla(224,100%,68%,0.18), transparent 70%)`,
            filter: "blur(30px)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Robot image with head-tilt, scale breathing, and glow pulse */}
        <motion.img
          src={heroImg}
          alt="Assembl AI Hero Agent"
          className="relative z-10 object-contain"
          width={1024}
          height={1024}
          style={{
            width: size * 0.88,
            height: size * 0.88,
          }}
          animate={{
            scale: [1, 1.04, 1, 1.02, 1],
            rotate: [0, -2, 0, 2, 0],
            filter: [
              `drop-shadow(0 0 50px hsla(189,100%,50%,0.45)) drop-shadow(0 0 100px hsla(224,100%,68%,0.3))`,
              `drop-shadow(0 0 80px hsla(189,100%,50%,0.7)) drop-shadow(0 0 140px hsla(224,100%,68%,0.5))`,
              `drop-shadow(0 0 50px hsla(189,100%,50%,0.45)) drop-shadow(0 0 100px hsla(224,100%,68%,0.3))`,
              `drop-shadow(0 0 65px hsla(189,100%,50%,0.55)) drop-shadow(0 0 120px hsla(224,100%,68%,0.4))`,
              `drop-shadow(0 0 50px hsla(189,100%,50%,0.45)) drop-shadow(0 0 100px hsla(224,100%,68%,0.3))`,
            ],
          }}
          transition={{
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
          draggable={false}
        />

        {/* Chest nexus glow — larger to match bigger logo */}
        <motion.div
          className="absolute z-[15] rounded-full"
          style={{
            width: size * 0.15, height: size * 0.15,
            top: "60%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, hsla(189,100%,50%,0.3), hsla(263,100%,76%,0.15), transparent 70%)`,
            filter: "blur(10px)",
          }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Eye glow pulse overlay */}
        <motion.div
          className="absolute z-[15] rounded-full"
          style={{
            width: size * 0.35, height: size * 0.12,
            top: "34%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse, hsla(189,100%,50%,0.15), transparent 70%)`,
            filter: "blur(12px)",
          }}
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Outer breathing pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: orbSize * 0.96, height: orbSize * 0.96,
          border: "1px solid hsla(189, 100%, 50%, 0.08)",
        }}
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.2, 0.5, 0.2],
          borderColor: [
            "hsla(189, 100%, 50%, 0.08)",
            "hsla(224, 100%, 68%, 0.12)",
            "hsla(189, 100%, 50%, 0.08)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default AssemblHeroAgent;
