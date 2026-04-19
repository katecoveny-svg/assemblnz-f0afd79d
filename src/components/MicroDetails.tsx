import { motion } from "framer-motion";

const C = {
  teal: "#4AA5A8",
  ochre: "#4AA5A8",
  lavender: "#E8E6F0",
};

/**
 * Animated gradient underline — sweeps teal → ochre → teal on a 6s loop.
 */
export function AnimatedUnderline({ width = 200 }: { width?: number }) {
  return (
    <div className="relative mx-auto" style={{ width, height: 2 }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${C.teal}, ${C.ochre}, ${C.teal})`,
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/**
 * Three tiny dots used as section dividers instead of lines.
 */
export function DotDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-1 h-1 rounded-full" style={{ background: C.teal, opacity: 0.3 }} />
      ))}
    </div>
  );
}

/**
 * CountUp — animates a number from 0 when it enters the viewport.
 */
export function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 1.5,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {prefix}
        <CountUpInner end={end} duration={duration} />
        {suffix}
      </motion.span>
    </motion.span>
  );
}

function CountUpInner({ end, duration }: { end: number; duration: number }) {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>;
}

import React from "react";
