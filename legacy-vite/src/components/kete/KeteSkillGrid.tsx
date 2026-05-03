import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Plug } from "lucide-react";
import { KETE_SKILL_DATA, getFoundationSkills, type KeteSkillConfig, type Skill } from "@/data/agentSkillConfig";

interface KeteSkillGridProps {
  keteId?: string; // if provided, show only that kete; otherwise show all
}

const CoverageIndicator = ({ pct }: { pct: number }) => {
  const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#EAB308' : '#EF4444';
  return (
    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
      {pct}%
    </span>
  );
};

const AgentSkillCard = ({ agentId, kete }: { agentId: string; kete: KeteSkillConfig }) => {
  const [expanded, setExpanded] = useState(false);
  const keteSkills = kete.keteSkills;
  const wired = keteSkills.filter(s => s.status === 'wired').length;
  const pct = keteSkills.length > 0 ? Math.round((wired / keteSkills.length) * 100) : 100;
  const categories = [...new Set(keteSkills.map(s => s.category))];

  return (
    <motion.div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${expanded ? `${kete.accent}30` : 'rgba(255,255,255,0.06)'}`,
      }}
      layout
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={expanded}
        aria-label={`${agentId.toUpperCase()} agent skills`}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${kete.accent}15`, color: kete.accent }}>
          <span className="font-display font-bold text-[10px]">{agentId.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{agentId.toUpperCase()}</p>
          <p className="font-mono text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{wired}/{keteSkills.length} skills</p>
        </div>
        <CoverageIndicator pct={pct} />
        {expanded ? <ChevronUp size={14} style={{ color: 'hsl(var(--muted-foreground))' }} /> : <ChevronDown size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-4 pb-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {categories.map(cat => (
              <div key={cat} className="mt-3">
                <p className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {keteSkills.filter(s => s.category === cat).map(s => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono"
                      style={{
                        background: s.status === 'wired' ? `${kete.accent}10` : 'rgba(234,179,8,0.08)',
                        color: s.status === 'wired' ? kete.accent : '#EAB308',
                        border: `1px solid ${s.status === 'wired' ? `${kete.accent}20` : 'rgba(234,179,8,0.15)'}`,
                      }}
                      title={s.description}
                    >
                      {s.status === 'wired' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {kete.keteMCPs.length > 0 && (
              <div className="mt-3">
                <p className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>MCP Connectors</p>
                {kete.keteMCPs.map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-[10px] font-mono py-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    <Plug size={10} style={{ color: kete.accent }} />
                    <span>{m.name}</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[8px]" style={{
                      background: m.connectionStatus === 'connected' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.08)',
                      color: m.connectionStatus === 'connected' ? '#22C55E' : '#EAB308',
                    }}>
                      {m.connectionStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const KeteSkillGrid = ({ keteId }: KeteSkillGridProps) => {
  const keteList = keteId
    ? KETE_SKILL_DATA.filter(k => k.id === keteId)
    : KETE_SKILL_DATA;

  return (
    <div className="space-y-8">
      {keteList.map(kete => {
        const wired = kete.keteSkills.filter(s => s.status === 'wired').length;
        const total = kete.keteSkills.length;
        const pct = total > 0 ? Math.round((wired / total) * 100) : 100;

        return (
          <motion.section
            key={kete.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {/* Kete Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: kete.accent }} />
              <h3 className="font-display font-bold text-lg" style={{ color: 'hsl(var(--foreground))' }}>{kete.name}</h3>
              <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{kete.agents.length} agents</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: kete.accent }} />
                </div>
                <CoverageIndicator pct={pct} />
              </div>
            </div>
            <p className="font-body text-xs mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>{kete.purpose}</p>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {kete.agents.map(agentId => (
                <AgentSkillCard key={agentId} agentId={agentId} kete={kete} />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
};

export default KeteSkillGrid;
