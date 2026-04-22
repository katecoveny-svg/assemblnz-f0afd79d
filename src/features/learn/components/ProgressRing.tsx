/** Premium SVG progress ring with soft gradient stroke. */
const ProgressRing = ({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
}: {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A8E6CC" />
            <stop offset="100%" stopColor="#2FCB89" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(47,73,55,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-light tracking-tight" style={{ color: "#1F3A2C" }}>
          {label ?? `${Math.round(value)}%`}
        </span>
        {sublabel && (
          <span className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: "#7A8E83" }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
