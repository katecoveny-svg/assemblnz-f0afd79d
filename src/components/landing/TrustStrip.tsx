import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Shield, Globe, Heart, Lock, Scale, Fingerprint } from "lucide-react";
import { TanikoDivider } from "./AnimatedTaniko";

const ease = [0.16, 1, 0.3, 1] as const;

const TRUST_SIGNALS = [
  { icon: Globe, label: "Built in Aotearoa", detail: "NZ-owned, NZ-hosted", color: "#3A7D6E" },
  { icon: Shield, label: "Privacy Act 2020", detail: "Full compliance", color: "#4AA5A8" },
  { icon: Heart, label: "Tikanga partnership", detail: "Aligning with tikanga governance", color: "#E8B4B8" },
  { icon: Lock, label: "Data sovereignty", detail: "Your data stays in NZ", color: "#5B8FA8" },
  { icon: Scale, label: "NZ-law aware", detail: "Legislation knowledge", color: "#4A7AB5" },
  { icon: Fingerprint, label: "Audit trail", detail: "Every action logged", color: "#89CFF0" },
];

/** Individual trust card with 3D tilt on hover */
const TrustCard = ({ t, i }: { t: typeof TRUST_SIGNALS[0]; i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 15 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 15 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      className="glass-card rounded-xl p-4 text-center group cursor-default"
      style={{
        perspective: "600px",
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5, ease }}
      whileHover={{
        boxShadow: `0 8px 30px ${t.color}15, 0 0 0 1px ${t.color}20`,
      }}
    >
      <motion.div
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <t.icon size={22} className="mx-auto mb-2" style={{ color: t.color }} />
      </motion.div>
      <p className="text-[11px] mb-0.5 transition-colors duration-300 group-hover:text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>
        {t.label}
      </p>
      <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {t.detail}
      </p>
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${t.color}10 0%, transparent 60%)` }}
      />
    </motion.div>
  );
};

const TrustStrip = () => (
  <section className="relative z-10 py-14" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
    <div className="max-w-6xl mx-auto px-5">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-[10px] tracking-[4px] uppercase mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)" }}>
          WHAKAPONO · TRUST
        </p>
        <TanikoDivider color="#3A7D6E" width={120} />
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TRUST_SIGNALS.map((t, i) => (
          <TrustCard key={t.label} t={t} i={i} />
        ))}
      </div>
    </div>
  </section>
);

export default TrustStrip;
