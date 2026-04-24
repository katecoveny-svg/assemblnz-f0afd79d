import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { KETE_DATA } from "@/components/kete/keteData";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://ssaxxdkxzrvkdjsanhei.supabase.co";
const videoUrl = (slug: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/video-assets/${slug}.mp4`;

const SHOWCASE_SLUGS = ["manaaki", "waihanga", "auaha", "arataki", "pikau"] as const;

interface KeteVideoCardProps {
  slug: string;
  name: string;
  englishName: string;
  description: string;
  accentColor: string;
  index: number;
}

function KeteVideoCard({ slug, name, englishName, description, accentColor, index }: KeteVideoCardProps) {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${accentColor}25`,
        boxShadow: `0 4px 32px ${accentColor}10`,
      }}
    >
      {/* Video */}
      <div
        className="relative aspect-video overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}05)` }}
      >
        {!hasError ? (
          <video
            src={videoUrl(slug)}
            className="w-full h-full object-cover"
            controls={isPlaying}
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
            onPlay={() => setIsPlaying(true)}
            poster={undefined}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}40` }}
            >
              <Play size={20} style={{ color: accentColor }} />
            </div>
            <p
              className="text-[11px] uppercase tracking-[2px]"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: `${accentColor}CC` }}
            >
              Video coming soon
            </p>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="text-lg tracking-[3px] uppercase"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#3D4250" }}
          >
            {name}
          </h3>
          <span
            className="text-[10px] uppercase tracking-[1.5px]"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: accentColor }}
          >
            {englishName}
          </span>
        </div>
        <p
          className="text-sm leading-relaxed flex-1"
          style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250B3" }}
        >
          {description}
        </p>
        <Link
          to={`/kete/${slug}`}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[2px] mt-1"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: accentColor }}
        >
          Explore kete →
        </Link>
      </div>
    </motion.div>
  );
}

export default function IndustryKeteShowcase() {
  const cards = SHOWCASE_SLUGS
    .map(slug => KETE_DATA.find(k => k.slug === slug))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));

  return (
    <section
      className="py-24 px-6 relative"
      style={{ background: "linear-gradient(180deg, #FAFBFC 0%, #F4F5F7 100%)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-[11px] uppercase tracking-[3px] mb-4"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3A7D6E" }}
          >
            Platform showcase
          </p>
          <h2
            className="text-4xl md:text-5xl tracking-[4px] uppercase mb-4"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#3D4250" }}
          >
            See It In Action
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250B3" }}
          >
            AI agents working across five NZ industries — built for the laws and language of Aotearoa.
          </p>
        </motion.div>

        {/* Grid: 3-col on lg, 2-col tablet, 1-col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((kete, i) => (
            <KeteVideoCard
              key={kete.slug}
              slug={kete.slug}
              name={kete.name}
              englishName={kete.englishName}
              description={kete.description}
              accentColor={kete.accentColor}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
