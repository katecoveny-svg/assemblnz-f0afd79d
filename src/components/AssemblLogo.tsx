const AssemblLogo = ({ size = 32 }: { size?: number }) => {
  const h = size;
  const w = size;
  const cx = w / 2;
  const top = h * 0.15;
  const bottom = h * 0.85;
  const left = w * 0.15;
  const right = w * 0.85;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {/* Lines */}
      <line x1={cx} y1={top} x2={left} y2={bottom} stroke="#00FF88" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1={cx} y1={top} x2={right} y2={bottom} stroke="#00FF88" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="#FF2D9B" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* Dots */}
      <circle cx={cx} cy={top} r="3" fill="#00FF88">
        <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={left} cy={bottom} r="3" fill="#00FF88">
        <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx={right} cy={bottom} r="3" fill="#FF2D9B">
        <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" begin="1s" />
      </circle>
    </svg>
  );
};

export default AssemblLogo;
