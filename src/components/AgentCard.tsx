import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import AgentAvatar from "@/components/AgentAvatar";
import type { Agent } from "@/data/agents";

interface AgentCardProps {
  agent: Agent;
  index: number;
}

const AgentCard = ({ agent, index }: AgentCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 300, damping: 30 });
  const glowX = useTransform(mouseX, [0, 1], [0, 100]);
  const glowY = useTransform(mouseY, [0, 1], [0, 100]);

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
        className="group relative block rounded-2xl p-5 transition-all duration-300 overflow-hidden border border-white/[0.06]"
        style={{
          background: 'rgba(14, 14, 26, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = agent.color + "40";
          e.currentTarget.style.boxShadow = `0 0 30px ${agent.color}20, 0 0 60px ${agent.color}08, inset 0 0 30px ${agent.color}05`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Top edge glow line */}
        <div
          className="absolute top-0 left-[15%] right-[15%] h-px opacity-20 group-hover:opacity-60 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
        />

        {/* Corner glow on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, ${agent.color}12, transparent 60%)`
            ),
          }}
        />

        {/* Animated background pulse */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${agent.color}08, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <motion.div
              className="transition-all duration-300"
              whileHover={{ scale: 1.15, filter: `drop-shadow(0 0 12px ${agent.color})` }}
            >
              <AgentAvatar agentId={agent.id} color={agent.color} size={40} />
            </motion.div>
            <span className="font-mono-jb text-[10px] text-muted-foreground">{agent.designation}</span>
          </div>
          <h3 className="text-base font-syne font-bold text-foreground tracking-wide">{agent.name}</h3>
          <p className="text-xs font-jakarta font-medium mb-1" style={{ color: agent.color }}>{agent.role}</p>
          <p className="text-xs font-jakarta italic mb-3 text-muted-foreground">"{agent.tagline}"</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.traits.map(t => (
              <span key={t} className="text-[10px] font-jakarta px-2 py-0.5 rounded-full border border-white/[0.06] text-foreground/60 group-hover:border-[var(--agent-hover)] transition-colors duration-300" style={{ "--agent-hover": agent.color + "30" } as React.CSSProperties}>
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {agent.expertise.map(e => (
              <span key={e} className="font-mono-jb text-[9px] px-1.5 py-0.5 rounded text-foreground/50" style={{ background: 'rgba(255,255,255,0.04)' }}>{e}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs font-jakarta font-medium" style={{ color: agent.color }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: agent.color }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}` }} />
            </span>
            Chat now →
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AgentCard;
