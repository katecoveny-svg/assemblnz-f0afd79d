import { motion } from "framer-motion";
import { packs } from "@/data/agents";
import { Utensils, HardHat, Palette, Briefcase, Cpu } from "lucide-react";

const PACK_ICONS: Record<string, React.ElementType> = {
  manaaki: Utensils,
  hanga: HardHat,
  auaha: Palette,
  pakihi: Briefcase,
  hangarau: Cpu,
};

const PACK_AGENTS: Record<string, string[]> = {
  manaaki: ["AURA", "HAVEN", "TIDE", "BEACON", "COAST", "EMBER", "FLORA", "CREST"],
  hanga: ["APEX", "ATA", "ĀRAI", "KAUPAPA", "RAWA", "WHAKAAĒ", "PAI"],
  auaha: ["PRISM", "MUSE", "PIXEL", "VERSE", "CANVAS", "REEL", "QUILL"],
  pakihi: ["LEDGER", "AROHA", "TURF", "SAGE", "COMPASS", "ANCHOR", "FLUX", "SHIELD", "VAULT", "MINT", "AXIS", "KINDLE"],
  hangarau: ["SPARK", "SENTINEL", "NEXUS", "CIPHER", "RELAY", "SIGNAL", "FORGE"],
};

const PackShowcase = () => (
  <section className="relative z-10 py-20 sm:py-28 border-t border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Industry Packs</span>
        <h2 className="text-2xl sm:text-4xl font-heading font-light uppercase tracking-wider text-foreground mt-2 mb-3">
          5 packs. <span className="text-primary">44 specialists.</span>
        </h2>
        <p className="text-sm font-body text-muted-foreground max-w-lg mx-auto">
          Every agent is trained on NZ legislation and built for Aotearoa businesses.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {packs.map((pack, i) => {
          const Icon = PACK_ICONS[pack.id] || Briefcase;
          const agentNames = PACK_AGENTS[pack.id] || [];

          return (
            <motion.div
              key={pack.id}
              className="relative rounded-2xl p-5 border border-border bg-card group hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              style={{ backdropFilter: "blur(12px)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {/* Left accent border */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ background: pack.color }}
              />

              {/* Top glow */}
              <span
                className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${pack.color}, transparent)` }}
              />

              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${pack.color}15` }}
                >
                  <Icon size={14} style={{ color: pack.color }} />
                </div>
                <div>
                  <h3
                    className="text-xs font-heading font-light tracking-[0.02em]"
                    style={{ color: pack.color }}
                  >
                    {pack.name}
                  </h3>
                  <p className="text-[10px] font-body text-muted-foreground">{pack.label}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {agentNames.map((name) => (
                  <span
                    key={name}
                    className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded border"
                    style={{
                      color: `${pack.color}`,
                      borderColor: `${pack.color}25`,
                      background: `${pack.color}08`,
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-border">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {pack.agentCount} agents
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default PackShowcase;
