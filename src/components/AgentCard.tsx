import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Mic, ChevronRight } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import { agentCapabilities } from "@/data/agentCapabilities";
import type { Agent } from "@/data/agents";
import { logAgentEvent } from "@/engine/telemetry";

interface AgentCardProps {
  agent: Agent;
  index: number;
}

const AgentCard = ({ agent, index }: AgentCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [4, -4]), { stiffness: 250, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), { stiffness: 250, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const caps = agentCapabilities[agent.id];
  const bullets = caps ? caps.slice(0, 3).map(c => c.bullet) : agent.expertise.slice(0, 3);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="relative"
    >
      <Link
        to={`/chat/${agent.id}`}
        className="group relative block rounded-2xl p-5 transition-all duration-500 overflow-hidden"
        style={{
          background: 'hsl(var(--surface-1) / 0.7)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          border: '1px solid hsl(var(--border) / 0.5)',
          boxShadow: '0 1px 3px hsl(228 14% 4% / 0.3), 0 4px 16px hsl(228 14% 4% / 0.2)',
        }}
      >
        {/* Premium top edge glow on hover */}
        <span
          className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-50 transition-opacity duration-700"
          style={{ background: `linear-gradient(90deg, transparent, ${agent.color}80, transparent)` }}
        />
        {/* Bottom ambient glow on hover */}
        <span
          className="absolute bottom-0 left-[20%] right-[20%] h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at bottom, ${agent.color}08 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3.5">
            <AgentAvatar agentId={agent.id} color={agent.color} size={40} />
            <div className="flex items-center gap-1.5">
              {getElevenLabsAgentId(agent.id) && (
                <span
                  className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: `${agent.color}12`, color: agent.color, border: `1px solid ${agent.color}20` }}
                >
                  <Mic size={8} /> VOICE
                </span>
              )}
              <span className="font-mono text-[10px] text-muted-foreground/60">{agent.designation}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[15px] font-display font-bold tracking-wide text-foreground">{agent.name}</h3>
            <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-glow" style={{ backgroundColor: agent.color, opacity: 0.6 }} />
          </div>
          <p className="text-xs font-body text-muted-foreground mb-3">{agent.role}</p>

          {/* Capability bullets */}
          <ul className="space-y-1.5 mb-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[11px] font-body text-foreground/65">
                <ChevronRight size={10} className="mt-[3px] shrink-0 opacity-70" style={{ color: agent.color }} />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 text-xs font-body font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color, opacity: 0.5 }} />
            Chat now
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AgentCard;
