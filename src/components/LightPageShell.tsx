import React from "react";
import WharikiFoundation from "@/components/whariki/WharikiFoundation";

/**
 * Light-mode page shell — #FAFBFC background, pastel blurred blobs,
 * no dark sections. Wraps all public pages.
 */
const LightPageShell: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`min-h-screen relative ${className}`}
    style={{ background: "#FAFBFC", color: "#1A1D29" }}
  >
    <WharikiFoundation />
    <div className="relative z-10">{children}</div>
  </div>
);

export default LightPageShell;
