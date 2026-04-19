import { motion } from "framer-motion";

const KeteHero = () => (
  <motion.div
    className="text-center mt-4 mb-2"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.5 }}
  >
    <p
      className="text-sm sm:text-base italic"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: "rgba(74,165,168,0.6)",
        letterSpacing: "0.02em",
      }}
    >
      He kete mātauranga — A basket of knowledge for your business
    </p>
  </motion.div>
);

export default KeteHero;
