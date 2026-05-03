import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * PageTransition — wraps route children with a soft Mārama enter/exit.
 * Lift + fade + slight scale, eased on a cinematic curve. Honors
 * prefers-reduced-motion via the global CSS guard in index.css.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14, scale: 0.995, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0,  scale: 1,    filter: "blur(0px)" }}
        exit={{    opacity: 0, y: -8, scale: 0.998, filter: "blur(4px)" }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
