import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, Zap } from "lucide-react";
import { classifyIntent, DEMO_QUERIES, type IntentMatch } from "@/lib/intentClassifier";

const SmartAgentSelector = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<IntentMatch | null>(null);
  const [showLearn, setShowLearn] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim().length > 3) {
      const match = classifyIntent(q);
      setResult(match);
    } else {
      setResult(null);
    }
  };

  const handleQuickSelect = (demoQuery: string) => {
    const demo = DEMO_QUERIES.find(d => d.query === demoQuery);
    setQuery(demoQuery);
    setResult(demo?.result || classifyIntent(demoQuery));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-display font-bold text-[10px] tracking-[4px] uppercase mb-2"
          style={{ color: 'hsl(var(--kowhai))' }}>
          SMART SELECT
        </p>
        <h2 className="font-display font-light text-2xl tracking-wide uppercase"
          style={{ color: 'hsl(var(--foreground))' }}>
          Find the right agent
        </h2>
      </div>

      {/* Search */}
      <div className="glass-card p-1 glow-card-hover" style={{ borderRadius: 16 }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Search size={18} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Describe what you need in plain English..."
            className="flex-1 bg-transparent outline-none font-body text-sm placeholder:text-muted-foreground"
            style={{ color: 'hsl(var(--foreground))' }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setResult(null); }}
              className="text-xs font-mono px-2 py-1 rounded"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick-select pills */}
      {!result && (
        <div className="flex flex-wrap gap-2">
          {DEMO_QUERIES.map(d => (
            <button
              key={d.query}
              onClick={() => handleQuickSelect(d.query)}
              className="glass-card px-3 py-2 text-xs font-body glow-card-hover cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.65)', borderRadius: 10 }}
            >
              <Sparkles size={11} className="inline mr-1.5" style={{ color: 'hsl(var(--kowhai))' }} />
              {d.query}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Top match */}
            <div className="glass-card p-5 glow-card-hover" style={{ borderRadius: 16 }}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-sm font-mono font-bold"
                  style={{ background: result.keteAccent, color: '#3D3428' }}>
                  {result.agentName.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-base" style={{ color: 'hsl(var(--foreground))' }}>
                      {result.agentName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-display font-bold uppercase tracking-wider"
                      style={{
                        background: `${result.keteAccent}18`,
                        color: result.keteAccent,
                        border: `1px solid ${result.keteAccent}30`,
                      }}>
                      {result.keteName}
                    </span>
                  </div>
                  <p className="font-body text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {result.specialisation}
                  </p>

                  {/* Confidence bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${result.keteAccent}, ${result.keteAccent}80)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold" style={{ color: result.keteAccent }}>
                      {result.confidence}%
                    </span>
                  </div>

                  {/* Reasoning chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[9px] font-display font-bold uppercase tracking-wider"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Why this agent?
                    </span>
                    {result.reasoning.map((r, i) => (
                      <span key={i} className="glass-card px-2 py-0.5 text-[10px] font-mono"
                        style={{ color: 'rgba(255,255,255,0.65)', borderRadius: 6 }}>
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button className="mt-4 cta-glass-gold px-5 py-2 text-xs flex items-center gap-2">
                    <Zap size={12} /> Chat with {result.agentName}
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            {result.alternatives.length > 0 && (
              <div>
                <p className="font-display text-[9px] font-bold uppercase tracking-[3px] mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  ALTERNATIVE AGENTS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.alternatives.map(alt => (
                    <motion.div
                      key={alt.agentId}
                      className="glass-card p-4 glow-card-hover cursor-pointer"
                      style={{ borderRadius: 12 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
                          style={{ background: alt.keteAccent, color: '#3D3428' }}>
                          {alt.agentName.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs" style={{ color: 'hsl(var(--foreground))' }}>
                              {alt.agentName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-display font-bold uppercase"
                              style={{ background: `${alt.keteAccent}15`, color: alt.keteAccent }}>
                              {alt.keteName}
                            </span>
                          </div>
                          <p className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {alt.reason}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold" style={{ color: alt.keteAccent }}>
                          {alt.confidence}%
                        </span>
                      </div>
                      {/* Mini confidence bar */}
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full rounded-full" style={{ width: `${alt.confidence}%`, background: `${alt.keteAccent}60` }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Learn toggle */}
            <button
              onClick={() => setShowLearn(!showLearn)}
              className="text-[10px] font-mono flex items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <span className="w-3 h-3 rounded-full border flex items-center justify-center"
                style={{ borderColor: 'rgba(255,255,255,0.15)', background: showLearn ? 'hsl(var(--kowhai))' : 'transparent' }}>
                {showLearn && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3D3428' }} />}
              </span>
              Learn from this selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartAgentSelector;
