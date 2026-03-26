import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { agents } from "@/data/agents";
import { ArrowRight } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";

const STATS = [
  { value: "42", label: "Specialist Tools" },
  { value: "50+", label: "NZ Acts" },
  { value: "16", label: "Industries" },
  { value: "24/7", label: "Always On" },
];

const PAGES = 3;
const PER_PAGE = 8;

const LiveDemoSection = () => {
  const [page, setPage] = useState(0);
  const visibleAgents = agents.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="relative z-10 py-16 sm:py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="text-center rounded-2xl p-5 border border-border bg-card"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <p className="text-3xl sm:text-4xl font-syne font-extrabold text-gradient-hero mb-1">
                {s.value}
              </p>
              <p className="text-xs font-jakarta text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Section heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-2">
            Your expert <span className="text-gradient-hero">team</span>
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground">
            Every advisor is online and ready — tap to start a conversation
          </p>
        </motion.div>

        {/* Agent roster grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8"
          key={page}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {visibleAgents.map((agent) => (
            <Link
              key={agent.id}
              to={`/chat/${agent.id}`}
              className="group rounded-xl p-4 border border-border bg-card hover:border-foreground/20 transition-all duration-300 hover:-translate-y-1"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <AgentAvatar agentId={agent.id} color={agent.color} size={40} showGlow={false} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-syne font-bold text-sm text-foreground truncate">
                      {agent.name}
                    </p>
                    <span
                      className="shrink-0 text-[8px] font-mono-jb font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: "hsl(var(--primary) / 0.15)",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] font-jakarta text-muted-foreground leading-snug line-clamp-2">
                    {agent.role}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: page === i ? 24 : 8,
                height: 8,
                background: page === i
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground) / 0.3)",
              }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

        {/* See all CTA */}
        <div className="text-center">
          <Link
            to="/content-hub"
            className="inline-flex items-center gap-2 text-sm font-syne font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            See the full team <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;
