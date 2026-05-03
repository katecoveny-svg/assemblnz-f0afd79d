/**
 * Woven Divider — two thin lines that cross over each other every 12px.
 * Replaces <hr> throughout the site.
 */
const WovenDivider = ({ className = "", color = "#3A7D6E" }: { className?: string; color?: string }) => (
  <svg className={`w-full ${className}`} height="6" preserveAspectRatio="none" viewBox="0 0 200 6">
    <defs>
      <pattern id="woven-div" x="0" y="0" width="24" height="6" patternUnits="userSpaceOnUse">
        {/* Strand A: goes under at midpoint */}
        <path d="M0 2 Q6 2 12 4 Q18 4 24 2" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
        {/* Strand B: goes over at midpoint */}
        <path d="M0 4 Q6 4 12 2 Q18 2 24 4" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
      </pattern>
    </defs>
    <rect width="200" height="6" fill="url(#woven-div)" />
  </svg>
);

export default WovenDivider;
