import React from "react";

/**
 * Shared demo page background with atmospheric radial glows.
 */
const DemoGlassShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen relative" style={{ 
    background: "#FAFBFC", 
    color: "#3D4250" 
  }}>
    {/* Atmospheric glow pools */}
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full" 
        style={{ background: "radial-gradient(circle, rgba(74,165,168,0.08) 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full" 
        style={{ background: "radial-gradient(circle, rgba(232,169,72,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full" 
        style={{ background: "radial-gradient(circle, rgba(74,165,168,0.05) 0%, transparent 70%)" }} />
    </div>
    <div className="relative" style={{ zIndex: 1 }}>
      {children}
    </div>
  </div>
);

export default DemoGlassShell;
