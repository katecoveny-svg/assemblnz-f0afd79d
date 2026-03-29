const HelmRobot = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="16" y="12" width="32" height="28" rx="8" stroke={color} strokeWidth="2" fill="none" opacity="0.85" />
    <ellipse cx="25" cy="26" rx="3.5" ry="3.5" fill={color} opacity="0.8" />
    <ellipse cx="39" cy="26" rx="3.5" ry="3.5" fill={color} opacity="0.8" />
    <path d="M26 33 Q32 37 38 33" stroke={color} strokeWidth="1.5" fill="none" opacity="0.45" />
    <line x1="32" y1="12" x2="32" y2="5" stroke={color} strokeWidth="1.5" opacity="0.35" />
    <circle cx="32" cy="4" r="2.5" fill={color} opacity="0.6" />
    <rect x="20" y="42" width="24" height="14" rx="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.45" />
    <rect x="26" y="45" width="12" height="8" rx="2" stroke={color} strokeWidth="1" fill={color + "10"} />
    <text x="32" y="51.5" textAnchor="middle" fill={color} fontSize="6" fontWeight="700" fontFamily="monospace">AI</text>
  </svg>
);

const RobotIcon = ({ color, size = 48, agentId }: { color: string; size?: number; agentId?: string }) => {
  if (agentId === "operations") {
    return <HelmRobot color={color} size={size} />;
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Antenna */}
      <line x1="24" y1="4" x2="24" y2="10" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="24" cy="3" r="2" fill={color} opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Head */}
      <rect x="10" y="10" width="28" height="20" rx="6" fill="#0E0E1A" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Eyes */}
      <circle cx="18" cy="20" r="3" fill={color} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="20" r="3" fill={color} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" begin="0.2s" />
      </circle>
      {/* Body */}
      <rect x="14" y="32" width="20" height="12" rx="4" fill="#0E0E1A" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" />
      {/* AI Badge */}
      <rect x="19" y="34" width="10" height="8" rx="2" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="24" y="40" textAnchor="middle" fill={color} fontSize="5" fontFamily="JetBrains Mono, monospace" fontWeight="600" opacity="0.8">AI</text>
    </svg>
  );
};

export default RobotIcon;
