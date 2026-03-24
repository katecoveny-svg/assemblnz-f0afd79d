import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import heroImg from "@/assets/agents/hero-orb-robot.png";

/* ─── Cosmic Star Field ─── */
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

const BRAND_COLORS = [
  "hsla(189, 100%, 50%, 0.9)",   // Cyan
  "hsla(263, 100%, 76%, 0.9)",   // Purple
  "hsla(224, 100%, 68%, 0.9)",   // Deep Blue
  "hsla(160, 84%, 50%, 0.8)",    // Emerald
  "hsla(200, 100%, 80%, 0.7)",   // Light cyan
];

const generateStars = (count: number): Star[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.7 + 0.3,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 4,
    color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
  }));

const CosmicStarField = ({ size }: { size: number }) => {
  const [stars] = useState(() => generateStars(60));

  return (
    <div className="absolute inset-0 overflow-hidden rounded-full">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: star.color,
            boxShadow: `0 0 ${star.size * 3}px ${star.color}`,
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/* ─── Floating Orbs ─── */
const FloatingOrb = ({
  color,
  size,
  orbitRadius,
  duration,
  delay,
  glow,
}: {
  color: string;
  size: number;
  orbitRadius: number;
  duration: number;
  delay: number;
  glow: string;
}) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color}, transparent 70%)`,
      boxShadow: `0 0 ${size * 2}px ${glow}, 0 0 ${size * 4}px ${glow}`,
      top: "50%",
      left: "50%",
    }}
    animate={{
      x: [
        Math.cos(0) * orbitRadius,
        Math.cos(Math.PI * 0.5) * orbitRadius,
        Math.cos(Math.PI) * orbitRadius,
        Math.cos(Math.PI * 1.5) * orbitRadius,
        Math.cos(Math.PI * 2) * orbitRadius,
      ],
      y: [
        Math.sin(0) * orbitRadius,
        Math.sin(Math.PI * 0.5) * orbitRadius,
        Math.sin(Math.PI) * orbitRadius,
        Math.sin(Math.PI * 1.5) * orbitRadius,
        Math.sin(Math.PI * 2) * orbitRadius,
      ],
      scale: [1, 1.3, 1, 0.8, 1],
      opacity: [0.6, 1, 0.7, 1, 0.6],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "linear",
    }}
  />
);

/* ─── Nexus Logo ─── */
const NexusLogo = ({ size }: { size: number }) => {
  const s = size * 0.14;
  const cx = s / 2;
  const r = s * 0.38;
  const orbR = s * 0.09;

  const topX = cx;
  const topY = cx - r;
  const blX = cx - r * Math.cos(Math.PI / 6);
  const blY = cx + r * Math.sin(Math.PI / 6);
  const brX = cx + r * Math.cos(Math.PI / 6);
  const brY = cx + r * Math.sin(Math.PI / 6);

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="absolute z-20"
      style={{ top: "54%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
      <motion.line x1={topX} y1={topY} x2={blX} y2={blY} stroke="hsla(189,100%,50%,0.6)" strokeWidth={1.5}
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.line x1={topX} y1={topY} x2={brX} y2={brY} stroke="hsla(263,100%,76%,0.6)" strokeWidth={1.5}
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
      <motion.line x1={blX} y1={blY} x2={brX} y2={brY} stroke="hsla(224,100%,68%,0.6)" strokeWidth={1.5}
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
      <motion.circle cx={topX} cy={topY} r={orbR} fill="hsl(189,100%,50%)"
        animate={{ r: [orbR, orbR * 1.4, orbR], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ filter: "drop-shadow(0 0 6px hsla(189,100%,50%,0.9))" }} />
      <motion.circle cx={blX} cy={blY} r={orbR} fill="hsl(263,100%,76%)"
        animate={{ r: [orbR, orbR * 1.4, orbR], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        style={{ filter: "drop-shadow(0 0 6px hsla(263,100%,76%,0.9))" }} />
      <motion.circle cx={brX} cy={brY} r={orbR} fill="hsl(224,100%,68%)"
        animate={{ r: [orbR, orbR * 1.4, orbR], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        style={{ filter: "drop-shadow(0 0 6px hsla(224,100%,68%,0.9))" }} />
    </svg>
  );
};

/* ─── Cosmic Ring ─── */
const CosmicRing = ({
  radius,
  color,
  duration,
  opacity,
  thickness = 1.5,
}: {
  radius: number;
  color: string;
  duration: number;
  opacity: number;
  thickness?: number;
}) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: radius * 2,
      height: radius * 2,
      border: `${thickness}px solid ${color}`,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }}
    animate={{
      opacity: [opacity * 0.4, opacity, opacity * 0.4],
      scale: [0.98, 1.02, 0.98],
      rotate: [0, 360],
    }}
    transition={{
      opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration, repeat: Infinity, ease: "linear" },
    }}
  />
);

/* ─── Main Hero Agent ─── */
const AssemblHeroAgent = ({ size = 420 }: { size?: number }) => {
  const orbContainerSize = size * 1.5;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: orbContainerSize, height: orbContainerSize }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Deep cosmic background orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: orbContainerSize,
          height: orbContainerSize,
          background: `radial-gradient(circle at 40% 40%, 
            hsla(263, 100%, 76%, 0.15) 0%, 
            hsla(224, 100%, 68%, 0.12) 20%, 
            hsla(189, 100%, 50%, 0.08) 40%, 
            hsla(160, 84%, 50%, 0.04) 60%, 
            transparent 80%)`,
          border: "1px solid hsla(189, 100%, 50%, 0.08)",
        }}
        animate={{
          boxShadow: [
            `0 0 60px hsla(189,100%,50%,0.08), 0 0 120px hsla(263,100%,76%,0.06), 0 0 200px hsla(224,100%,68%,0.04)`,
            `0 0 100px hsla(189,100%,50%,0.15), 0 0 200px hsla(263,100%,76%,0.12), 0 0 300px hsla(224,100%,68%,0.08), 0 0 400px hsla(160,84%,50%,0.04)`,
            `0 0 60px hsla(189,100%,50%,0.08), 0 0 120px hsla(263,100%,76%,0.06), 0 0 200px hsla(224,100%,68%,0.04)`,
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Star field */}
      <CosmicStarField size={orbContainerSize} />

      {/* Cosmic rings */}
      <CosmicRing radius={orbContainerSize * 0.48} color="hsla(189, 100%, 50%, 0.15)" duration={30} opacity={0.5} />
      <CosmicRing radius={orbContainerSize * 0.42} color="hsla(263, 100%, 76%, 0.12)" duration={25} opacity={0.4} thickness={1} />
      <CosmicRing radius={orbContainerSize * 0.35} color="hsla(224, 100%, 68%, 0.1)" duration={20} opacity={0.3} thickness={1} />

      {/* Inner ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          background: `radial-gradient(circle, hsla(160,84%,50%,0.2), hsla(189,100%,50%,0.12), transparent 70%)`,
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating orbs in orbit */}
      <FloatingOrb color="hsla(189,100%,50%,0.5)" size={14} orbitRadius={orbContainerSize * 0.4} duration={12} delay={0} glow="hsla(189,100%,50%,0.4)" />
      <FloatingOrb color="hsla(263,100%,76%,0.5)" size={10} orbitRadius={orbContainerSize * 0.36} duration={15} delay={2} glow="hsla(263,100%,76%,0.4)" />
      <FloatingOrb color="hsla(224,100%,68%,0.5)" size={12} orbitRadius={orbContainerSize * 0.44} duration={18} delay={4} glow="hsla(224,100%,68%,0.4)" />
      <FloatingOrb color="hsla(160,84%,50%,0.4)" size={8} orbitRadius={orbContainerSize * 0.32} duration={10} delay={1} glow="hsla(160,84%,50%,0.3)" />
      <FloatingOrb color="hsla(189,100%,70%,0.4)" size={6} orbitRadius={orbContainerSize * 0.46} duration={22} delay={3} glow="hsla(189,100%,70%,0.3)" />
      <FloatingOrb color="hsla(263,100%,86%,0.3)" size={9} orbitRadius={orbContainerSize * 0.28} duration={14} delay={5} glow="hsla(263,100%,86%,0.3)" />

      {/* Orbiting particle trails */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: orbContainerSize * 0.85, height: orbContainerSize * 0.85, top: "50%", left: "50%", marginTop: -orbContainerSize * 0.425, marginLeft: -orbContainerSize * 0.425 }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 4 + i,
              height: 4 + i,
              background: BRAND_COLORS[i % BRAND_COLORS.length],
              boxShadow: `0 0 ${10 + i * 4}px ${BRAND_COLORS[i % BRAND_COLORS.length]}`,
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </motion.div>
      ))}

      {/* Robot container with gentle bob */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{ width: size, height: size }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Robot glow backdrop */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 0.75,
            height: size * 0.75,
            background: `radial-gradient(circle, hsla(189,100%,50%,0.25), hsla(263,100%,76%,0.15), transparent 70%)`,
            filter: "blur(25px)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Robot image */}
        <motion.img
          src={heroImg}
          alt="Assembl AI Hero Agent"
          className="relative z-10 object-contain"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            filter: `drop-shadow(0 0 40px hsla(189,100%,50%,0.4)) drop-shadow(0 0 80px hsla(263,100%,76%,0.25)) drop-shadow(0 0 120px hsla(224,100%,68%,0.15))`,
          }}
          animate={{
            scale: [1, 1.04, 1],
            filter: [
              `drop-shadow(0 0 40px hsla(189,100%,50%,0.4)) drop-shadow(0 0 80px hsla(263,100%,76%,0.25)) drop-shadow(0 0 120px hsla(224,100%,68%,0.15))`,
              `drop-shadow(0 0 60px hsla(189,100%,50%,0.6)) drop-shadow(0 0 100px hsla(263,100%,76%,0.35)) drop-shadow(0 0 160px hsla(224,100%,68%,0.2))`,
              `drop-shadow(0 0 40px hsla(189,100%,50%,0.4)) drop-shadow(0 0 80px hsla(263,100%,76%,0.25)) drop-shadow(0 0 120px hsla(224,100%,68%,0.15))`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          draggable={false}
        />

        {/* Nexus logo on chest */}
        <NexusLogo size={size} />

        {/* Chest glow */}
        <motion.div
          className="absolute z-[15] rounded-full"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            top: "54%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, hsla(189,100%,50%,0.4), hsla(263,100%,76%,0.2), transparent 70%)`,
            filter: "blur(8px)",
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Outer pulse ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: orbContainerSize * 0.95,
          height: orbContainerSize * 0.95,
          border: "1px solid hsla(189, 100%, 50%, 0.1)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.6, 0.3],
          borderColor: [
            "hsla(189, 100%, 50%, 0.1)",
            "hsla(263, 100%, 76%, 0.15)",
            "hsla(224, 100%, 68%, 0.1)",
            "hsla(189, 100%, 50%, 0.1)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default AssemblHeroAgent;
