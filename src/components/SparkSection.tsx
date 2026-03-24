import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import sparkImg from "@/assets/agents/spark.png";

const SparkSection = () => (
  <section className="relative z-10 py-16 sm:py-24">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-[#FF6B00]/15"
        style={{
          background: "rgba(14, 14, 26, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 0 60px rgba(255,107,0,0.06), inset 0 1px 0 rgba(255,107,0,0.08)",
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#FF6B00]/40 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 p-6 sm:p-10 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
              <Code2 size={20} style={{ color: "#FF6B00" }} />
              <Sparkles size={14} style={{ color: "#FF6B00" }} />
              <span
                className="text-[9px] font-mono-jb px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,107,0,0.15)",
                  color: "#FF6B00",
                  border: "1px solid rgba(255,107,0,0.3)",
                }}
              >
                NEW
              </span>
            </div>

            <h2
              className="font-syne font-extrabold text-3xl sm:text-4xl mb-1"
              style={{
                color: "#FF6B00",
                textShadow: "0 0 20px rgba(255,107,0,0.4), 0 0 60px rgba(255,107,0,0.15)",
              }}
            >
              Meet SPARK
            </h2>
            <p className="font-mono-jb text-[10px] mb-4" style={{ color: "rgba(255,107,0,0.3)" }}>
              ASM-042 · AI App Builder
            </p>
            <h3
              className="font-syne font-bold text-base sm:text-lg mb-4"
              style={{ color: "#FF6B00", textShadow: "0 0 12px rgba(255,107,0,0.25)" }}
            >
              Build apps with words.
            </h3>
            <p className="text-sm font-jakarta leading-relaxed mb-6 max-w-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
              Describe what you need. SPARK generates a working app — forms, dashboards, calculators,
              landing pages — in seconds. No code. No designers. No developers.
            </p>
            <Link
              to="/chat/spark"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-syne font-bold transition-all duration-300 hover:shadow-lg"
              style={{
                background: "#FF6B00",
                color: "#0A0A14",
                boxShadow: "0 0 20px rgba(255,107,0,0.2)",
              }}
            >
              Try SPARK <ArrowRight size={14} />
            </Link>
          </div>

          {/* SPARK Robot Avatar */}
          <div className="flex items-center justify-center">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ background: "#FF6B00" }}
              />
              <img
                src={sparkImg}
                alt="SPARK AI App Builder"
                className="relative w-32 h-32 lg:w-56 lg:h-56 object-contain"
                style={{ filter: "drop-shadow(0 0 20px rgba(255,107,0,0.4))" }}
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default SparkSection;
