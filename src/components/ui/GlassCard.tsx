import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  title: string;
  description: string;
  accentColor: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const GlassCard = ({ title, description, accentColor, icon, children }: GlassCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(-y * 8);
    setRotateY(x * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative rounded-3xl overflow-hidden group"
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
    >
      {/* Glass surface */}
      <div className="absolute inset-0 rounded-3xl"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.90), rgba(255,255,255,0.65))",
          backdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: `
            6px 6px 16px rgba(166,166,180,0.3),
            -6px -6px 16px rgba(255,255,255,0.85),
            inset 0 1px 0 rgba(255,255,255,0.9)
          `,
        }}
      />

      {/* Colour bleed blob behind */}
      <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle, ${accentColor}20, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8">
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-[16px] font-semibold mb-2"
          style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}>
          {title}
        </h3>
        <p className="text-[14px] leading-[1.7]"
          style={{ fontFamily: "'Inter', sans-serif", color: "#6B7280" }}>
          {description}
        </p>
        {children}

        {/* Bottom accent line — appears on hover */}
        <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` }}
        />
      </div>
    </motion.div>
  );
};

export default GlassCard;
