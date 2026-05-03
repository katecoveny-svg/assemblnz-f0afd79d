import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * Typewriter effect for the hero headline. Runs once on first visit.
 * Uses sessionStorage to only play once per session.
 */
export default function TypewriterText({
  text,
  className = "",
  style = {},
  speed = 30,
  onComplete,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
  onComplete?: () => void;
}) {
  const storageKey = "assembl_hero_typed";
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  const alreadyPlayed = typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "1";

  useEffect(() => {
    if (alreadyPlayed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(text);
      setDone(true);
      onComplete?.();
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        sessionStorage.setItem(storageKey, "1");
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, alreadyPlayed]);

  return (
    <span className={className} style={style}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ color: "#4AA5A8" }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}
