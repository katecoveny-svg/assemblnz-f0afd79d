import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import { agents } from "@/data/agents";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";

const FEATURED_IDS = [
  "sports", "hospitality", "marketing", "property", "sales",
  "automotive", "construction", "customs", "maritime", "operations",
  "echo", "hr",
];

const featured = agents.filter((a) => FEATURED_IDS.includes(a.id));

const AgentShowcase = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const agent = featured[index];

  return (
    <div className="w-full max-w-md mx-auto mt-10 mb-4">
      {/* Pill indicators */}
      <div className="flex justify-center gap-1.5 mb-5">
        {featured.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setIndex(i)}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 24 : 8,
              background: i === index ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Link
            to={`/chat/${agent.id}`}
            className="group block relative rounded-2xl p-5 overflow-hidden transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
          >
            <div className="relative z-10 flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0"
              >
                <AgentAvatar agentId={agent.id} color={agent.color} size={72} showGlow eager />
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-light tracking-wider" style={{ color: '#E4E4EC' }}>
                    {agent.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color, opacity: 0.5 }} />
                  {getElevenLabsAgentId(agent.id) && (
                    <span
                      className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                      style={{ background: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}25` }}
                    >
                      <Mic size={8} /> VOICE
                    </span>
                  )}
                  <span className="text-[10px] font-mono opacity-60" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {agent.designation}
                  </span>
                </div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {agent.role}
                </p>
                <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {agent.tagline}
                </p>
              </div>
            </div>

            {/* Expertise pills */}
            <div className="relative z-10 flex flex-wrap gap-1.5 mt-3">
              {agent.expertise.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <div
              className="relative z-10 mt-3 text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Chat now →
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AgentShowcase;