import { motion } from "framer-motion";
import { useState } from "react";
import { Play } from "lucide-react";

const SUPABASE_URL = "https://ssaxxdkxzrvkdjsanhei.supabase.co";

interface Props {
  slug: string;
  accentColor: string;
  keteName: string;
}

export default function KeteVideoBlock({ slug, accentColor, keteName }: Props) {
  const [hasError, setHasError] = useState(false);
  const url = `${SUPABASE_URL}/storage/v1/object/public/video-assets/${slug}.mp4`;

  if (hasError) {
    return null; // Silently hide if no video uploaded yet
  }

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
        style={{ fontFamily: "'JetBrains Mono', monospace", color: accentColor }}
      >
        See it in action
      </p>
      <h2
        className="text-2xl tracking-[3px] uppercase mb-5"
        style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#3D4250" }}
      >
        {keteName} on Assembl
      </h2>
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
    </motion.section>
  );
}
