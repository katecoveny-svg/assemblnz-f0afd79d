import { motion } from "framer-motion";
import heroImg from "@/assets/agents/hero-3d-robot.png";

const AssemblHeroAgent = ({ size = 200 }: { size?: number }) => {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Ambient glow behind robot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: `radial-gradient(circle, hsla(160,84%,50%,0.15), hsla(189,100%,50%,0.08), transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: size, height: size }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              background: ["hsl(160,84%,50%)", "hsl(189,100%,50%)", "hsl(224,100%,68%)"][i],
              boxShadow: `0 0 8px ${["hsla(160,84%,50%,0.6)", "hsla(189,100%,50%,0.6)", "hsla(224,100%,68%,0.6)"][i]}`,
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
          filter: `drop-shadow(0 0 20px hsla(160,84%,50%,0.25)) drop-shadow(0 0 50px hsla(189,100%,50%,0.1))`,
        }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
    </motion.div>
  );
};

export default AssemblHeroAgent;
