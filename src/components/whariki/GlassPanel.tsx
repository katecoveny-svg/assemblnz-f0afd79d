import React, { useRef } from "react";

/**
 * Glass Panel — floating surface above the whāriki foundation.
 * Optional 3D tilt on hover, dawn-gold top rim, noise grain.
 */
const GlassPanel = ({
  children,
  className = "",
  tilt = false,
  goldRim = false,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
  goldRim?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouse = (e: React.MouseEvent) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  };

  const handleLeave = () => {
    if (!tilt || !ref.current) return;
    ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className={`glass-panel relative rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      onMouseMove={tilt ? handleMouse : undefined}
      onMouseLeave={tilt ? handleLeave : undefined}
    >
      {goldRim && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(74,165,168,0.5), rgba(74,165,168,0.3), transparent)",
            boxShadow: "0 0 12px rgba(74,165,168,0.3)",
          }}
        />
      )}
      {children}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />
    </div>
  );
};

export default GlassPanel;
