import { motion } from "framer-motion";
import { CheckCircle2, Clock, Plug, Layers, Shield } from "lucide-react";
import { getAgentFullSkillSet, SHARED_FOUNDATION, type Skill, type MCPConnector } from "@/data/agentSkillConfig";

interface AgentSkillsSectionProps {
  agentId: string;
  agentColor: string;
}

const SkillChip = ({ skill, color }: { skill: Skill; color: string }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all duration-200"
    style={{
      background: skill.status === 'wired' ? `${color}12` : 'rgba(234,179,8,0.08)',
      color: skill.status === 'wired' ? color : '#EAB308',
      border: `1px solid ${skill.status === 'wired' ? `${color}25` : 'rgba(234,179,8,0.2)'}`,
    }}
    title={skill.description}
  >
    {skill.status === 'wired' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
    {skill.name}
  </span>
);

const MCPCard = ({ mcp, color }: { mcp: MCPConnector; color: string }) => (
  <div
    className="rounded-lg p-3 flex items-start gap-3"
    style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: `${color}15`, color }}
    >
      <Plug size={13} />
    </div>
    <div className="min-w-0">
      <p className="font-display font-bold text-xs" style={{ color: 'hsl(var(--foreground))' }}>{mcp.name}</p>
      <p className="font-body text-[10px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{mcp.provider}</p>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {mcp.tools.slice(0, 4).map(t => (
          <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'hsl(var(--muted-foreground))' }}>
            {t}
          </span>
        ))}
        {mcp.tools.length > 4 && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'hsl(var(--muted-foreground))' }}>
            +{mcp.tools.length - 4} more
          </span>
        )}
      </div>
    </div>
    <span
      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full ml-auto shrink-0"
      style={{
        background: mcp.connectionStatus === 'connected' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.08)',
        color: mcp.connectionStatus === 'connected' ? '#22C55E' : '#EAB308',
        border: `1px solid ${mcp.connectionStatus === 'connected' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.15)'}`,
      }}
    >
      {mcp.connectionStatus}
    </span>
  </div>
);

const SkillGroup = ({ title, skills, color, icon: Icon, delay = 0 }: { title: string; skills: Skill[]; color: string; icon: typeof Layers; delay?: number }) => {
  if (!skills.length) return null;
  const categories = [...new Set(skills.map(s => s.category))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}15`, color }}>
          <Icon size={13} />
        </div>
        <h3 className="font-display font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>{title}</h3>
        <span className="text-[10px] font-mono ml-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {skills.filter(s => s.status === 'wired').length}/{skills.length} wired
        </span>
      </div>
      {categories.map(cat => (
        <div key={cat} className="mb-3 last:mb-0">
          <p className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{cat}</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.filter(s => s.category === cat).map(s => (
              <SkillChip key={s.id} skill={s} color={color} />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const AgentSkillsSection = ({ agentId, agentColor }: AgentSkillsSectionProps) => {
  const { foundation, kete, agent, mcps } = getAgentFullSkillSet(agentId);
  const allSkills = [...foundation, ...kete, ...agent];
  const wiredCount = allSkills.filter(s => s.status === 'wired').length;
  const gapCount = allSkills.filter(s => s.status === 'gap').length;

  return (
    <>
      {/* Routing Pipeline Visualization */}
      <section className="relative z-10 py-12 sm:py-16" style={{ borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-wide mb-3" style={{ background: `${agentColor}10`, color: agentColor, border: `1px solid ${agentColor}20` }}>
              <Layers size={12} /> IHO ROUTING PIPELINE
            </div>
            <h2 className="font-display font-light text-2xl sm:text-3xl" style={{ color: 'hsl(var(--foreground))' }}>Skill Architecture</h2>
            <p className="font-body text-sm mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {wiredCount} skills wired{gapCount > 0 ? ` · ${gapCount} planned` : ''} · {mcps.length} MCP connectors
            </p>
          </motion.div>

          {/* Pipeline Flow */}
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {['Shared Foundation', 'Kete Tools', 'Agent Skills', 'Governance'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <motion.div
                  className="px-3 py-1.5 rounded-lg text-[10px] font-mono"
                  style={{ background: i === 3 ? 'rgba(234,179,8,0.08)' : `${agentColor}${10 + i * 5}`, color: i === 3 ? '#EAB308' : agentColor, border: `1px solid ${i === 3 ? 'rgba(234,179,8,0.2)' : `${agentColor}${20 + i * 5}`}` }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {step}
                </motion.div>
                {i < 3 && <span className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>→</span>}
              </div>
            ))}
          </div>

          {/* Skill Groups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkillGroup title="Shared Foundation" skills={foundation} color={agentColor} icon={Layers} delay={0} />
            {kete.length > 0 && <SkillGroup title="Kete-Specific Skills" skills={kete} color={agentColor} icon={Shield} delay={0.1} />}
            {agent.length > 0 && <SkillGroup title="Agent-Specific Skills" skills={agent} color={agentColor} icon={Layers} delay={0.2} />}
          </div>
        </div>
      </section>

      {/* MCP Connectors */}
      {mcps.length > 0 && (
        <section className="relative z-10 py-12 sm:py-16" style={{ borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-wide mb-3" style={{ background: `${agentColor}10`, color: agentColor, border: `1px solid ${agentColor}20` }}>
                <Plug size={12} /> MCP CONNECTORS
              </div>
              <h2 className="font-display font-light text-2xl sm:text-3xl" style={{ color: 'hsl(var(--foreground))' }}>Integrations & Tools</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mcps.map((mcp, i) => (
                <motion.div key={mcp.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <MCPCard mcp={mcp} color={agentColor} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AgentSkillsSection;
