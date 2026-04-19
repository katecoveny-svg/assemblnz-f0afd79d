/** Decorative harakeke (flax weaving) pattern border — boosted visibility */
const HarakekePattern = ({ className = "" }: { className?: string }) => (
  <div
    className={`w-full h-3 ${className}`}
    style={{
      backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 8px,
        rgba(212,168,67,0.12) 8px,
        rgba(212,168,67,0.12) 9px
      ), repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 8px,
        rgba(212,168,67,0.12) 8px,
        rgba(212,168,67,0.12) 9px
      )`,
    }}
  />
);

export default HarakekePattern;
