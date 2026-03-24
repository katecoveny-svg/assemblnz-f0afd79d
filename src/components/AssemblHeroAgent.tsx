import { motion } from "framer-motion";
import heroImg from "@/assets/agents/hero-orb-robot.png";

const NexusLogo = ({ size }: { size: number }) => {
  const s = size * 0.18;
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
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="absolute z-20" style={{ top: "55%", left: "50%", transform: "translate(-50%, -50%)" }}>
      {/* Connecting lines */}
      <motion.line x1={topX} y1={topY} x2={blX} y2={blY} stroke="hsla(189,100%,50%,0.6)" strokeWidth={1.2}
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.line x1={topX} y1={topY} x2={brX} y2={brY} stroke="hsla(263,100%,76%,0.6)" strokeWidth={1.2}
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
      <motion.line x1={blX} y1={blY} x2={brX} y2={brY} stroke="hsla(224,100%,68%,0.6)" strokeWidth={1.2}
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
      {/* Orbs */}
      <motion.circle cx={topX} cy={topY} r={orbR} fill="hsl(189,100%,50%)"
        animate={{ r: [orbR, orbR * 1.3, orbR], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }} style={{ filter: "drop-shadow(0 0 4px hsla(189,100%,50%,0.8))" }} />
      <motion.circle cx={blX} cy={blY} r={orbR} fill="hsl(263,100%,76%)"
        animate={{ r: [orbR, orbR * 1.3, orbR], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} style={{ filter: "drop-shadow(0 0 4px hsla(263,100%,76%,0.8))" }} />
      <motion.circle cx={brX} cy={brY} r={orbR} fill="hsl(224,100%,68%)"
        animate={{ r: [orbR, orbR * 1.3, orbR], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} style={{ filter: "drop-shadow(0 0 4px hsla(224,100%,68%,0.8))" }} />
    </svg>
  );
};

const AssemblHeroAgent = ({ size = 200 }: { size?: number }) => {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer glowing orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          background: `radial-gradient(circle, hsla(160,84%,50%,0.08) 20%, hsla(189,100%,50%,0.04) 50%, transparent 75%)`,
          border: '1px solid hsla(160,84%,50%,0.1)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
          boxShadow: [
            '0 0 40px hsla(160,84%,50%,0.1), 0 0 80px hsla(189,100%,50%,0.05)',
            '0 0 80px hsla(160,84%,50%,0.2), 0 0 140px hsla(189,100%,50%,0.1), 0 0 200px hsla(263,100%,76%,0.06)',
            '0 0 40px hsla(160,84%,50%,0.1), 0 0 80px hsla(189,100%,50%,0.05)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: `radial-gradient(circle, hsla(160,84%,50%,0.2), hsla(189,100%,50%,0.12), transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: size, height: size }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              background: ["hsl(160,84%,50%)", "hsl(189,100%,50%)", "hsl(224,100%,68%)"][i],
              boxShadow: `0 0 12px ${["hsla(160,84%,50%,0.8)", "hsla(189,100%,50%,0.8)", "hsla(224,100%,68%,0.8)"][i]}`,
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </motion.div>
      ))}

      {/* Robot image */}
      <motion.img
        src={heroImg}
        alt="Assembl AI Agent"
        className="relative z-10 object-contain"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          filter: `drop-shadow(0 0 30px hsla(160,84%,50%,0.35)) drop-shadow(0 0 60px hsla(189,100%,50%,0.2)) drop-shadow(0 0 100px hsla(263,100%,76%,0.1))`,
        }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />

      {/* Nexus logo on chest - glowing */}
      <NexusLogo size={size} />

      {/* Chest glow effect */}
      <motion.div
        className="absolute z-15 rounded-full"
        style={{
          width: size * 0.12,
          height: size * 0.12,
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, hsla(189,100%,50%,0.3), hsla(263,100%,76%,0.15), transparent 70%)`,
          filter: "blur(8px)",
        }}
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default AssemblHeroAgent;
