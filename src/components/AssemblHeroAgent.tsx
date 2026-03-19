import { motion } from "framer-motion";
import heroImg from "@/assets/agents/assembl-hero.png";

const AssemblHeroAgent = ({ size = 200 }: { size?: number }) => {
  const green = "#00FF88";
  const cyan = "#00E5FF";
  const pink = "#FF2D9B";

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer glow halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          background: `radial-gradient(circle, ${green}18, ${cyan}10, transparent 70%)`,
          filter: "blur(24px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: size,
            height: size,
          }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              background: [green, pink, cyan][i],
              boxShadow: `0 0 10px ${[green, pink, cyan][i]}`,
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
        className="relative z-10 rounded-full object-cover"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          filter: `drop-shadow(0 0 20px ${green}30) drop-shadow(0 0 40px ${cyan}15)`,
        }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
    </motion.div>
  );
};

export default AssemblHeroAgent;
