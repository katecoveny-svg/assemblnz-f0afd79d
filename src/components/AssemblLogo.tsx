const AssemblLogo = ({ size = 36 }: { size?: number }) => {
  return (
    <div
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size + 10,
        height: size + 10,
        background: '#111118',
        border: '1px solid #00FF8828',
        borderRadius: 9,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="4" r="2.5" fill="#00FF88" opacity="0.9" />
        <circle cx="5" cy="18" r="2.5" fill="#00FF88" opacity="0.65" />
        <circle cx="19" cy="18" r="2.5" fill="#FF2D9B" opacity="0.65" />
        <line x1="12" y1="6.5" x2="5" y2="15.5" stroke="#00FF88" strokeWidth="1.2" opacity="0.35" />
        <line x1="12" y1="6.5" x2="19" y2="15.5" stroke="#FF2D9B" strokeWidth="1.2" opacity="0.35" />
        <line x1="7.5" y1="18" x2="16.5" y2="18" stroke="#00E5FF" strokeWidth="1.2" opacity="0.25" />
      </svg>
    </div>
  );
};

export default AssemblLogo;
