import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Soft glowing circle that follows the cursor with 100ms lag.
 * Grows to 48px over interactive elements. Mix-blend-mode: multiply.
 */
export default function CursorFollower() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 200, damping: 25 });
  const y = useSpring(rawY, { stiffness: 200, damping: 25 });
  const size = hovered ? 48 : 24;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [role=button], input, textarea, select")) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
      style={{
        x, y,
        width: size,
        height: size,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, rgba(74,165,168,0.25) 0%, rgba(74,165,168,0) 70%)",
        mixBlendMode: "multiply",
        transition: "width 0.3s ease, height 0.3s ease",
      }}
    />
  );
}
