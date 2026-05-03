import { motion } from "framer-motion";
import { useState } from "react";
import { Play } from "lucide-react";

const VIDEO_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/video-assets/`;

const KETE_HERO_VIDEO: Record<string, { videoUrl: string; caption: string }> = {
  manaaki: {
    videoUrl: "kete-clips/MANAAKI-Tablet-Check.mp4",
    caption: "Assembl helps a cafe owner check Easter Sunday trading compliance in real time",
  },
  waihanga: {
    videoUrl: "kete-clips/WAIHANGA-Hamilton-Build.mp4",
    caption: "Auto-generated site induction from the SWMS, sent via SMS to the new subcontractor",
  },
  auaha: {
    videoUrl: "kete-clips/AUAHA-Creative-Studio.mp4",
    caption: "Pre-publish FTA 1986 compliance scan on Instagram campaign copy",
  },
  arataki: {
    videoUrl: "kete-clips/ARATAKI-Dealership.mp4",
    caption: "Real-world NZ fuel cost comparison with CCCFA-compliant finance disclosure",
  },
  pikau: {
    videoUrl: "kete-clips/PIKAU-Customs.mp4",
    caption: "Assembl's compliance pipeline processing a customs entry — 35 minutes to 5",
  },
};

interface Props {
  slug: string;
  accentColor: string;
  keteName: string;
}

export default function KeteVideoBlock({ slug, accentColor, keteName }: Props) {
  const [hasError, setHasError] = useState(false);
  const config = KETE_HERO_VIDEO[slug];

  if (!config || hasError) return null;

  const url = VIDEO_BASE_URL + config.videoUrl;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <p
        className="text-[11px] uppercase tracking-[3px] mb-3"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: accentColor }}
      >
        See it in action
      </p>
      <h2
        className="text-2xl tracking-[3px] uppercase mb-5"
        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#3D4250" }}
      >
        {keteName} on Assembl
      </h2>
      <div className="max-w-[800px] mx-auto">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${accentColor}25`,
            boxShadow: `0 4px 32px ${accentColor}10`,
          }}
        >
          <video
            src={url}
            className="w-full aspect-video object-cover"
            controls
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
          >
            Your browser does not support video playback.
          </video>
        </div>
        <p
          className="text-center mt-4 text-[13px] italic"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: "#6B7280" }}
        >
          {config.caption}
        </p>
      </div>
    </motion.section>
  );
}
