import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const VIDEO_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/video-assets/`;
const VIDEO_PATH = "brand-concept/Home-Brand-Flow.mp4";

export default function HomepageVideoTeaser() {
  const [hasError, setHasError] = useState(false);

  return (
    <section className="px-6 py-20" style={{ background: "linear-gradient(180deg, #FAFBFC 0%, #F4F5F7 50%, #FAFBFC 100%)" }}>
      <div className="max-w-[900px] mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] uppercase tracking-[3px] mb-4"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4AA5A8" }}
        >
          See it in action
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 20px 60px rgba(74,165,168,0.12), 0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          {!hasError ? (
            <video
              src={VIDEO_BASE_URL + VIDEO_PATH}
              className="w-full aspect-video object-cover"
              controls
              playsInline
              preload="metadata"
              onError={() => setHasError(true)}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div
              className="w-full aspect-video flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(74,165,168,0.1), rgba(74,165,168,0.05))" }}
            >
              <p className="text-[11px] uppercase tracking-[2px]"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4AA5A8" }}>
                60-second overview · uploading
              </p>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-[15px] leading-relaxed max-w-xl mx-auto"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}
        >
          Five industries. One governed intelligence layer. Built for the laws and language of Aotearoa.
        </motion.p>

      </div>
    </section>
  );
}
