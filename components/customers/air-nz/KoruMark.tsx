/**
 * Stylised koru swirl — a placeholder mark for the Air NZ pilot demo chrome.
 *
 * This is deliberately NOT the Air New Zealand koru logo. Per brand-notes v2 and
 * the build rules, we never reproduce the real Air NZ mark pixel-perfect. This
 * is a generic unfurling-fern spiral used as the header mark and as the
 * wait-state loader. concept · demo pending.
 */
export function KoruMark({
  size = 22,
  color = '#ffffff',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      {/* Unfurling spiral — stylised, not the Air NZ mark. */}
      <path
        d="M24 46C11 46 3 37 3 25 3 14 11 6 21 6c8 0 14 6 14 13 0 6-4 10-9 10-4 0-7-3-7-6 0-3 2-5 4-5"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
