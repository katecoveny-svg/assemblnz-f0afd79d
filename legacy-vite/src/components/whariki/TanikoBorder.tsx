/**
 * Tāniko Border — decorative zigzag pattern mimicking the top/bottom border of a kete.
 * Alternates pounamu green and dawn gold.
 */
const TanikoBorder = ({
  className = "",
  height = 4,
  variant = "top",
}: {
  className?: string;
  height?: number;
  variant?: "top" | "bottom";
}) => {
  const flip = variant === "bottom";
  return (
    <svg
      className={className}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      viewBox="0 0 200 4"
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <defs>
        <pattern id="taniko" x="0" y="0" width="16" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4 L4 0 L8 4 L12 0 L16 4" fill="none" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
          <path d="M2 4 L6 0 L10 4 L14 0" fill="none" stroke="#4AA5A8" strokeWidth="0.8" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="200" height="4" fill="url(#taniko)" />
    </svg>
  );
};

export default TanikoBorder;
