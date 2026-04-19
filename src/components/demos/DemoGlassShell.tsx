import React from "react";

/**
 * Shared demo page background with atmospheric radial glows.
 */
const DemoGlassShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen relative" style={{
    background: "linear-gradient(180deg, #FFFFFF 0%, #F4FAFC 50%, #E8F4F6 100%)",
    color: "#1F4E54"
  }}>
    {/* Atmospheric glow pools — soft teal on ice */}
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(74,165,168,0.10) 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,221,219,0.14) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(210,235,238,0.30) 0%, transparent 70%)" }} />
    </div>
    <div className="relative" style={{ zIndex: 1 }}>
      {children}
    </div>
  </div>
);

export default DemoGlassShell;
