import { motion } from "framer-motion";

interface KeteRaceVideoProps {
  slug: string;
  keteName: string;
  accentColor: string;
}

export default function KeteRaceVideo({ slug, keteName, accentColor }: KeteRaceVideoProps) {
  return (
    <section className="px-6 pb-24 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p
          className="text-center text-[10px] uppercase tracking-[4px] mb-6"
          style={{ color: accentColor, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
        >
          Assembl vs manual · see the difference
        </p>

        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${accentColor}25`,
            boxShadow: `0 0 60px ${accentColor}08`,
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-square object-cover"
            src={`/videos/${slug}-race.mp4`}
            aria-label={`${keteName} — Assembl automation vs manual process comparison`}
          />

          {/* Subtle overlay badge */}
          <div
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[2px] font-mono"
            style={{
              background: "rgba(0,0,0,0.6)",
              color: accentColor,
              backdropFilter: "blur(8px)",
              border: `1px solid ${accentColor}30`,
            }}
          >
            powered by assembl
          </div>
        </div>
      </motion.div>
    </section>
  );
}
