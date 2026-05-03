/** Toro bird icon — albatross silhouette with guiding star, not a kete */
export default function ToroBirdIcon({ size = 36, color = "#4AA5A8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 40 20" fill="none">
      <defs>
        <linearGradient id="toro-bird-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M20 10 C17 7, 10 4, 2 7 C7 6, 12 8, 16 9.5 L20 10 L24 9.5 C28 8, 33 6, 38 7 C30 4, 23 7, 20 10Z"
        fill="url(#toro-bird-g)"
      />
      <ellipse cx="20" cy="10.5" rx="3" ry="1.5" fill={color} />
      <path d="M23 10.5 L28 10 L29 10.3" stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7" />
      <circle cx="34" cy="4" r="1.5" fill={color} opacity="0.5" />
      <circle cx="34" cy="4" r="0.5" fill="#fff" opacity="0.8" />
    </svg>
  );
}
