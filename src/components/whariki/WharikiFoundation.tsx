import { useEffect, useRef } from "react";

/**
 * Whāriki Foundation Layer — the digital woven mat that sits beneath all content.
 * Subtle cross-hatch pattern mimicking raranga weave, responsive to scroll.
 */
const WharikiFoundation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      // Brighten weave in viewport center area
      const brightness = Math.min(1, 0.6 + (Math.sin(sy / vh * Math.PI) * 0.4));
      el.style.opacity = String(brightness);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(58,125,110,0.04) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(58,125,110,0.04) 1px, transparent 1px),
          linear-gradient(45deg, rgba(212,168,83,0.02) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(212,168,83,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px, 24px 24px, 48px 48px, 48px 48px",
        opacity: 0.7,
        transition: "opacity 0.3s ease",
      }}
    />
  );
};

export default WharikiFoundation;
