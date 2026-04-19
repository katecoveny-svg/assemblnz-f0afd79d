import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Plug, ChevronDown, ChevronUp, Download, Layers } from "lucide-react";
import { KETE_SKILL_DATA, SHARED_FOUNDATION, SHARED_CORE_AGENTS, getGlobalSkillStats, getSkillCoverage, getFoundationSkills } from "@/data/agentSkillConfig";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";

const SkillWiringDashboard = () => {
  const [expandedKete, setExpandedKete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'wired' | 'gap'>('all');
  const stats = getGlobalSkillStats();
  const coverage = getSkillCoverage();
  const pct = Math.round((stats.wired / stats.totalSkills) * 100);

  const handleExport = () => {
    const data = {
      globalStats: stats,
      sharedFoundation: SHARED_FOUNDATION,
      sharedCoreAgents: SHARED_CORE_AGENTS,
      kete: KETE_SKILL_DATA,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assembl-skill-wiring.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell
      title="Skill Wiring"
      subtitle="Agent capability coverage across the Assembl network"
      icon={<Layers size={18} style={{ color: "#D4A843" }} />}
      backTo="/admin/dashboard"
      actions={
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download size={14} /> Export JSON
        </Button>
      }
    >

        {/* Global Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total Agents', value: stats.totalAgents, icon: Layers },
            { label: 'Total Skills', value: stats.totalSkills, icon: Layers },
            { label: 'Wired', value: stats.wired, icon: CheckCircle2, color: '#22C55E' },
            { label: 'Gaps', value: stats.gap, icon: Clock, color: '#EAB308' },
            { label: 'MCP Connectors', value: stats.totalMCPs, icon: Plug },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <stat.icon size={16} className="mx-auto mb-2" style={{ color: stat.color || 'hsl(var(--muted-foreground))' }} />
              <p className="font-display font-bold text-2xl" style={{ color: stat.color || 'hsl(var(--foreground))' }}>{stat.value}</p>
              <p className="font-body text-[10px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Coverage Bar */}
        <div className="rounded-xl p-5 mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>Global Coverage</p>
            <p className="font-mono-jb text-sm" style={{ color: '#22C55E' }}>{pct}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #22C55E, #3A7D6E)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'wired', 'gap'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono-jb transition-all"
              style={{
                background: filter === f ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                color: filter === f ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                border: `1px solid ${filter === f ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {f === 'all' ? 'All Skills' : f === 'wired' ? '✓ Wired' : '◷ Gaps'}
            </button>
          ))}
        </div>

        {/* Shared Foundation */}
        <div className="rounded-xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-display font-bold text-sm mb-3" style={{ color: 'hsl(var(--foreground))' }}>Shared Foundation (All Agents)</h3>
          <div className="flex flex-wrap gap-1.5">
            {getFoundationSkills()
              .filter(s => filter === 'all' || s.status === filter)
              .map(s => (
                <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-jb" style={{ background: 'rgba(58,125,110,0.1)', color: '#3A7D6E', border: '1px solid rgba(58,125,110,0.2)' }}>
                  <CheckCircle2 size={9} /> {s.name}
                </span>
              ))}
          </div>
        </div>

        {/* Kete Breakdown */}
        <div className="space-y-3">
          {coverage.map((k) => {
            const isExpanded = expandedKete === k.keteId;
            const keteData = KETE_SKILL_DATA.find(d => d.id === k.keteId)!;
            const kPct = k.total > 0 ? Math.round((k.wired / k.total) * 100) : 100;
            const filteredSkills = keteData.keteSkills.filter(s => filter === 'all' || s.status === filter);

            return (
              <motion.div
                key={k.keteId}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                layout
              >
                <button
                  onClick={() => setExpandedKete(isExpanded ? null : k.keteId)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: k.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>{k.name}</span>
                      <span className="font-mono-jb text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{keteData.agents.length} agents</span>
                    </div>
                    <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${kPct}%`, background: k.accent }} />
                    </div>
                  </div>
                  <span className="font-mono-jb text-xs shrink-0" style={{ color: k.accent }}>{kPct}%</span>
                  <span className="font-mono-jb text-[10px] shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>{k.wired}W / {k.gap}G</span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: 'hsl(var(--muted-foreground))' }} /> : <ChevronDown size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />}
                </button>

                {isExpanded && (
                  <motion.div
                    className="px-4 pb-4 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="font-body text-xs mt-3 mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>{keteData.purpose}</p>

                    {/* Agents list */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {keteData.agents.map(a => (
                        <span key={a} className="text-[10px] font-mono-jb px-2 py-0.5 rounded" style={{ background: `${k.accent}12`, color: k.accent, border: `1px solid ${k.accent}20` }}>
                          {a.toUpperCase()}
                        </span>
                      ))}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {filteredSkills.map(s => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-jb"
                          style={{
                            background: s.status === 'wired' ? `${k.accent}10` : 'rgba(234,179,8,0.08)',
                            color: s.status === 'wired' ? k.accent : '#EAB308',
                            border: `1px solid ${s.status === 'wired' ? `${k.accent}20` : 'rgba(234,179,8,0.15)'}`,
                          }}
                          title={s.description}
                        >
                          {s.status === 'wired' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                          {s.name}
                        </span>
                      ))}
                    </div>

                    {/* MCPs */}
                    {keteData.keteMCPs.length > 0 && (
                      <div>
                        <p className="text-[9px] font-mono-jb uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>MCP Connectors</p>
                        {keteData.keteMCPs.map(m => (
                          <div key={m.id} className="flex items-center gap-2 text-[10px] font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            <Plug size={10} style={{ color: k.accent }} />
                            {m.name} — {m.tools.length} tools
                            <span className="px-1 py-0.5 rounded text-[8px]" style={{ background: m.connectionStatus === 'connected' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.08)', color: m.connectionStatus === 'connected' ? '#22C55E' : '#EAB308' }}>
                              {m.connectionStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
    </AdminShell>
  );
};

export default SkillWiringDashboard;
