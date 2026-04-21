import { useEffect, useRef } from "react";
import cloudImg from "@/assets/hero-cloud-photoreal.png";

/**
 * MiniCloud — a small photoreal cumulus cloud used as a decorative orb
 * replacement. Just the cloud asset, gently bobbing, with a very translucent
 * pounamu drop-shadow. No room, no sparkles, no parallax.
 */
interface MiniCloudProps {
  size?: number;
  opacity?: number;
  drift?: "slow" | "med" | "fast";
  className?: string;
}

export default function MiniCloud({
  size = 200,
  opacity = 0.85,
  drift = "med",
  className = "",
}: MiniCloudProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const speed = drift === "slow" ? 22000 : drift === "fast" ? 9000 : 14000;
    const phase = Math.random() * 2000;
    let raf = 0;
    const tick = () => {
      const t = performance.now() + phase;
      const y = Math.sin((t / speed) * Math.PI * 2) * 6;
      const x = Math.sin((t / (speed * 1.3)) * Math.PI * 2 + 0.7) * 4;
      const s = 1 + Math.sin((t / (speed * 0.9)) * Math.PI * 2) * 0.015;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drift]);

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size, opacity }}
    >
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          willChange: "transform",
        }}
      >
        <img
          src={cloudImg}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 12px 24px rgba(31,77,71,0.06))",
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}
