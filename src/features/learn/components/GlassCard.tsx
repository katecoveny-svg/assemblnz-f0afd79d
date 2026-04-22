import React from "react";

/** Soft white-glass card with neumorphic depth — the building block. */
const GlassCard = ({
  children,
  className = "",
  as: Tag = "div",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
}) => {
  const Component = Tag as any;
  return (
    <Component
      onClick={onClick}
      className={`relative rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 transition-all ${className}`}
      style={{
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px -20px rgba(47,203,137,0.18), 0 8px 24px -16px rgba(47,73,55,0.10)",
      }}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
