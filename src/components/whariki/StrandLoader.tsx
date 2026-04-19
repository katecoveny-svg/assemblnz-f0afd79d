/**
 * Strand Loading Spinner — two lines braiding around a central point.
 */
const StrandLoader = ({ size = 32, color = "#3A7D6E" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="animate-spin" style={{ animationDuration: "2s" }}>
    <path
      d="M20 4 Q26 12 20 20 Q14 28 20 36"
      fill="none"
      stroke={color}
      strokeWidth="2"
      opacity="0.6"
    />
    <path
      d="M20 4 Q14 12 20 20 Q26 28 20 36"
      fill="none"
      stroke="#4AA5A8"
      strokeWidth="1.5"
      opacity="0.4"
    />
    <circle cx="20" cy="20" r="3" fill={color} opacity="0.5" />
  </svg>
);

export default StrandLoader;
