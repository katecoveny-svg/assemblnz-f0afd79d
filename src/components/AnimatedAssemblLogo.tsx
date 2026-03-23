import { motion } from "framer-motion";
import nexusLogo from "@/assets/nexus-logo.png";

const AnimatedAssemblLogo = ({ size = 64 }: { size?: number }) => {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size * 1.6, height: size }}
    >
      {/* Ambient glow behind logo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          background: `radial-gradient(circle, hsla(160,84%,50%,0.12) 20%, hsla(189,100%,50%,0.06) 50%, transparent 75%)`,
          filter: "blur(20px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      {[0, 180].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: size, height: size }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: i === 0 ? "hsl(160,84%,50%)" : "hsl(189,100%,50%)",
              boxShadow: `0 0 8px ${i === 0 ? "hsla(160,84%,50%,0.8)" : "hsla(189,100%,50%,0.8)"}`,
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
          filter: `drop-shadow(0 0 12px hsla(160,84%,50%,0.3)) drop-shadow(0 0 30px hsla(189,100%,50%,0.12))`,
        }}
        animate={{
          scale: [1, 1.06, 1],
          filter: [
            "drop-shadow(0 0 12px hsla(160,84%,50%,0.3)) drop-shadow(0 0 30px hsla(189,100%,50%,0.12))",
            "drop-shadow(0 0 20px hsla(160,84%,50%,0.5)) drop-shadow(0 0 50px hsla(189,100%,50%,0.25))",
            "drop-shadow(0 0 12px hsla(160,84%,50%,0.3)) drop-shadow(0 0 30px hsla(189,100%,50%,0.12))",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />

      {/* ASSEMBL text */}
      <motion.span
        className="relative z-10 font-syne font-extrabold tracking-[4px] uppercase ml-1"
        style={{
          fontSize: size * 0.28,
          color: "hsl(var(--foreground))",
        }}
        animate={{
          textShadow: [
            "0 0 8px hsla(160,84%,50%,0.0)",
            "0 0 16px hsla(160,84%,50%,0.2), 0 0 32px hsla(189,100%,50%,0.08)",
            "0 0 8px hsla(160,84%,50%,0.0)",
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
