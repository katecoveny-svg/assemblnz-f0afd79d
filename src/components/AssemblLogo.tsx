import { motion } from "framer-motion";
import nexusLogo from "@/assets/nexus-logo.png";

const AssemblLogo = ({ size = 36 }: { size?: number }) => {
  return (
    <motion.div
      className="inline-flex items-center justify-center shrink-0 relative"
      style={{ width: size + 10, height: size + 10 }}
    >
      <motion.img
        src={nexusLogo}
        alt="Assembl"
        style={{
          width: size + 4,
          height: size + 4,
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 6px hsla(189,100%,50%,0.3)) drop-shadow(0 0 12px hsla(271,60%,72%,0.15))',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
    </motion.div>
  );
};

export default AssemblLogo;
