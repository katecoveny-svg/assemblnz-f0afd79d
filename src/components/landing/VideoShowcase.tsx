import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Play, Pause, Volume2, Maximize2 } from "lucide-react";
import { TanikoDivider } from "./AnimatedTaniko";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Animated "mock video" — CSS motion graphics that look cinematic ── */
const MockVideoContent = ({ playing }: { playing: boolean }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setFrame(f => (f + 1) % 5), 3000);
    return () => clearInterval(id);
  }, [playing]);

  const scenes = [
    { title: "Ask your question", subtitle: "Natural language. Any industry.", color: "#D4A843", bg: "rgba(212,168,67,0.08)" },
    { title: "Intelligent routing", subtitle: "Matched to the right specialist agent.", color: "#3A7D6E", bg: "rgba(58,125,110,0.08)" },
    { title: "NZ law compliance", subtitle: "50+ Acts checked automatically.", color: "#5B8FA8", bg: "rgba(91,143,168,0.08)" },
    { title: "Tikanga verified", subtitle: "Cultural respect built into every response.", color: "#E8B4B8", bg: "rgba(232,180,184,0.08)" },
    { title: "Delivered in seconds", subtitle: "Professional-grade output. Every time.", color: "#89CFF0", bg: "rgba(137,207,240,0.08)" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: "#FAFBFC" }}>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse at 30% 40%, ${scenes[frame].bg} 0%, transparent 60%)`,
            `radial-gradient(ellipse at 70% 60%, ${scenes[frame].bg} 0%, transparent 60%)`,
            `radial-gradient(ellipse at 30% 40%, ${scenes[frame].bg} 0%, transparent 60%)`,
          ],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Constellation nodes */}
      {playing && [...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${15 + (i % 4) * 22}%`,
            top: `${20 + Math.floor(i / 4) * 40}%`,
            background: scenes[frame].color,
          }}
          animate={{
            x: [0, Math.sin(i * 1.5) * 40, 0],
            y: [0, Math.cos(i * 1.5) * 30, 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Content */}
      {playing ? (
        <motion.div
          key={frame}
          className="relative z-10 text-center px-8"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 1.05 }}
          transition={{ duration: 0.6, ease }}
        >
          {/* Step counter */}
          <motion.div className="flex justify-center gap-2 mb-6">
            {scenes.map((s, i) => (
              <motion.div
                key={i}
                className="h-0.5 rounded-full"
                style={{
                  width: i === frame ? "40px" : "16px",
                  background: i === frame ? s.color : "rgba(255,255,255,0.15)",
                }}
                animate={{ width: i === frame ? 40 : 16 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>

          <motion.p
            className="text-[10px] tracking-[3px] uppercase mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: scenes[frame].color }}
          >
            STEP {frame + 1} OF 5
          </motion.p>
          <motion.h3
            className="text-xl sm:text-3xl mb-2"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#3D4250" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {scenes[frame].title}
          </motion.h3>
          <motion.p
            className="text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {scenes[frame].subtitle}
          </motion.p>

          {/* Animated accent line */}
          <motion.div
            className="mx-auto mt-6 h-[2px] rounded-full"
            style={{ background: scenes[frame].color }}
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
          />
        </motion.div>
      ) : (
        <div className="relative z-10 text-center">
          <p className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.3)" }}>
            Press play to see Assembl in action
          </p>
        </div>
      )}
    </div>
  );
};

const VideoShowcase = () => {
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax tilt on mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), { stiffness: 150, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section className="relative z-10 py-20 sm:py-28 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(137,207,240,0.3), transparent)" }} />

      <div className="max-w-5xl mx-auto px-5">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-[11px] tracking-[5px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, color: "#89CFF0" }}>
            MĀTAKITAKI · WATCH
          </p>
          <TanikoDivider color="#89CFF0" width={160} />
          <h2 className="text-2xl sm:text-3xl mt-4 mb-3 text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            See the full workflow
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
            From question to compliance-checked answer in under 2 seconds.
          </p>
        </motion.div>

        {/* Video container with 3D tilt */}
        <motion.div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden cursor-pointer"
          style={{
            aspectRatio: "16/9",
            perspective: "1200px",
            rotateX,
            rotateY,
          }}
          onMouseMove={handleMouse}
          onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          onClick={() => setPlaying(!playing)}
        >
          {/* Glow border */}
          <div className="absolute inset-0 rounded-2xl z-20 pointer-events-none" style={{
            boxShadow: playing
              ? "0 0 60px rgba(212,168,67,0.1), inset 0 0 0 1px rgba(212,168,67,0.15)"
              : "inset 0 0 0 1px rgba(255,255,255,0.08)",
            transition: "box-shadow 0.5s ease",
          }} />

          {/* Video content */}
          <MockVideoContent playing={playing} />

          {/* Play/Pause overlay */}
          {!playing && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: "rgba(15,22,35,0.4)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(212,168,67,0.15)",
                  border: "2px solid rgba(212,168,67,0.3)",
                  backdropFilter: "blur(10px)",
                }}
                whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(212,168,67,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={28} style={{ color: "#D4A843", marginLeft: "3px" }} />
              </motion.div>
            </motion.div>
          )}

          {/* Controls bar (when playing) */}
          {playing && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 flex items-center gap-3"
              style={{ background: "linear-gradient(transparent, rgba(15,22,35,0.8))" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button onClick={(e) => { e.stopPropagation(); setPlaying(false); }} className="text-gray-500 hover:text-foreground transition-colors">
                <Pause size={14} />
              </button>
              {/* Progress bar */}
              <div className="flex-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#D4A843" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                />
              </div>
              <Volume2 size={12} className="text-gray-400" />
              <Maximize2 size={12} className="text-gray-400" />
            </motion.div>
          )}
        </motion.div>

        {/* Caption */}
        <motion.p
          className="text-center mt-4 text-[10px]"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.2)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Full product walkthrough coming soon — subscribe for early access
        </motion.p>
      </div>
    </section>
  );
};

export default VideoShowcase;
