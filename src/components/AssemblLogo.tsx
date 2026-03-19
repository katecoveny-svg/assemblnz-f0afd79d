const AssemblLogo = ({ size = 36 }: { size?: number }) => {
  return (
    <div
      className="inline-flex items-center justify-center shrink-0 relative"
      style={{
        width: size + 10,
        height: size + 10,
        background: 'rgba(14, 14, 26, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: 12,
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connection lines with pulse */}
        <line x1="12" y1="6.5" x2="5" y2="15.5" stroke="#00FF88" strokeWidth="1.2" opacity="0.35" className="animate-pulse-glow" />
        <line x1="12" y1="6.5" x2="19" y2="15.5" stroke="#FF2D9B" strokeWidth="1.2" opacity="0.35" className="animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
        <line x1="7.5" y1="18" x2="16.5" y2="18" stroke="#00E5FF" strokeWidth="1.2" opacity="0.25" className="animate-pulse-glow" style={{ animationDelay: '1s' }} />

        {/* Nodes with glow filter */}
        <circle cx="12" cy="4" r="2.5" fill="#00FF88" opacity="0.9" filter="url(#neonGlow)" />
        <circle cx="5" cy="18" r="2.5" fill="#00FF88" opacity="0.65" filter="url(#neonGlow)" />
        <circle cx="19" cy="18" r="2.5" fill="#FF2D9B" opacity="0.65" filter="url(#neonGlow)" />

        {/* Sparkle on top node */}
        <g className="animate-sparkle" style={{ transformOrigin: '12px 4px' }}>
          <line x1="12" y1="0.5" x2="12" y2="1.8" stroke="#00FF88" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="14.5" y1="4" x2="15.5" y2="4" stroke="#00FF88" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="9.5" y1="4" x2="8.5" y2="4" stroke="#00FF88" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="13.2" y1="2.5" x2="14" y2="1.8" stroke="#00FF88" strokeWidth="0.5" strokeLinecap="round" />
          <line x1="10.8" y1="2.5" x2="10" y2="1.8" stroke="#00FF88" strokeWidth="0.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export default AssemblLogo;
