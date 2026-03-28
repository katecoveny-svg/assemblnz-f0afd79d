import { motion } from "framer-motion";
import nexusLogo from "@/assets/nexus-logo.png";

const AnimatedAssemblLogo = ({ size = 64 }: { size?: number }) => {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size * 1.6, height: size }}
    >
      {/* Ambient glow — cyan/purple/blue */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          background: `radial-gradient(circle, hsla(189,100%,50%,0.14) 15%, hsla(271,60%,72%,0.08) 45%, hsla(234,85%,66%,0.05) 70%, transparent 85%)`,
          filter: "blur(18px)",
        }}
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.5, 0.95, 0.5],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles — cyan, purple, blue */}
      {[
        { deg: 0, color: "hsl(189,100%,50%)", shadow: "hsla(189,100%,50%,0.8)" },
        { deg: 120, color: "hsl(271,60%,72%)", shadow: "hsla(271,60%,72%,0.8)" },
        { deg: 240, color: "hsl(234,85%,66%)", shadow: "hsla(234,85%,66%,0.8)" },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: size, height: size }}
          animate={{ rotate: [p.deg, p.deg + 360] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: p.color,
              boxShadow: `0 0 8px ${p.shadow}`,
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </motion.div>
      ))}

      {/* Nexus mark */}
      <motion.img
        src={nexusLogo}
        alt="Assembl"
        className="relative z-10 object-contain"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          filter: `drop-shadow(0 0 10px hsla(189,100%,50%,0.35)) drop-shadow(0 0 25px hsla(271,60%,72%,0.15))`,
        }}
        animate={{
          scale: [1, 1.06, 1],
          filter: [
            "drop-shadow(0 0 10px hsla(189,100%,50%,0.35)) drop-shadow(0 0 25px hsla(271,60%,72%,0.15))",
            "drop-shadow(0 0 18px hsla(189,100%,50%,0.55)) drop-shadow(0 0 40px hsla(271,60%,72%,0.3))",
            "drop-shadow(0 0 10px hsla(189,100%,50%,0.35)) drop-shadow(0 0 25px hsla(271,60%,72%,0.15))",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />

      {/* ASSEMBL text */}
      <motion.span
        className="relative z-10 font-display font-extrabold tracking-[4px] uppercase ml-1"
        style={{
          fontSize: size * 0.28,
          color: "hsl(var(--foreground))",
        }}
        animate={{
          textShadow: [
            "0 0 6px hsla(189,100%,50%,0.0)",
            "0 0 14px hsla(189,100%,50%,0.2), 0 0 28px hsla(271,60%,72%,0.1)",
            "0 0 6px hsla(189,100%,50%,0.0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        ASSEMBL
      </motion.span>
    </motion.div>
  );
};

export default AnimatedAssemblLogo;
