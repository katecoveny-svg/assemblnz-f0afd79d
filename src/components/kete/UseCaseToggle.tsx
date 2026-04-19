import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  children: ReactNode;
  accent?: string;
  label?: string;
}

/**
 * Wraps a heavy KeteUseCaseSection in a collapsed glass disclosure so
 * landing pages stay clean by default. Visitors who want the worked
 * example can expand it.
 */
export default function UseCaseToggle({ children, accent = "#3A7D6E", label = "See worked example" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative px-6 pb-12 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl text-sm font-body transition-all duration-300"
        style={{
          background: "rgba(255,255,255,0.6)",
          border: `1px solid ${accent}25`,
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 16px rgba(58,125,110,0.06), 0 0 0 1px rgba(255,255,255,0.4) inset",
          color: "#3D4250",
          fontWeight: 400,
          letterSpacing: "0.02em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.8)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.6)";
        }}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span
            className="inline-block rounded-full"
            style={{ width: 6, height: 6, background: accent, boxShadow: `0 0 8px ${accent}80` }}
          />
          {open ? "Hide worked example" : label}
        </span>
        <ChevronDown
          size={16}
          style={{ color: accent, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}
        />
      </button>
      {open && <div className="mt-6 animate-fade-in">{children}</div>}
    </section>
  );
}
