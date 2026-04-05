import { motion } from "framer-motion";
import { packs } from "@/data/agents";
import BrandIcon3D, {
  ManaakiIcon3D,
  HangaIcon3D,
  AuahaIcon3D,
  PakihiIcon3D,
  HangarauIcon3D,
} from "@/components/BrandIcon3D";

const PACK_ICONS: Record<string, React.FC<{ size?: "sm" | "md" | "lg" | "xl"; variant?: "glass" | "solid" | "floating" }>> = {
  manaaki: ManaakiIcon3D,
  hanga: HangaIcon3D,
  auaha: AuahaIcon3D,
  pakihi: PakihiIcon3D,
  hangarau: HangarauIcon3D,
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
        <span className="font-mono-jb text-[10px] tracking-[4px] text-primary/60 uppercase mb-3">Industry Packs</span>
        <h2 className="text-2xl sm:text-4xl font-display tracking-wide text-foreground mt-2 mb-3 heading-glow section-heading" style={{ fontWeight: 700 }}>
          7 kete. <span className="text-gradient-hero">44 specialist agents.</span>
        </h2>
        <p className="text-sm font-body text-muted-foreground max-w-lg mx-auto">
          Every agent is trained on NZ legislation and built for Aotearoa businesses.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {packs.map((pack, i) => {
          const IconComp = PACK_ICONS[pack.id];
          const agentNames = PACK_AGENTS[pack.id] || [];

          return (
            <motion.div
              key={pack.id}
              className="relative rounded-2xl p-5 group overflow-hidden"
              style={{
                background: "rgba(15,15,26,0.82)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                transition: "border-color 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -3,
                borderColor: `${pack.color}45`,
                boxShadow: `0 10px 36px rgba(0,0,0,0.4), 0 0 24px ${pack.color}15`,
              }}
            >
              {/* Left accent border */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full"
                style={{ background: `linear-gradient(180deg, ${pack.color}90, ${pack.color}30)` }}
              />

              {/* Top shimmer — faint at rest, bright on hover */}
              <span
                className="absolute top-0 left-[10%] right-[10%] h-px opacity-15 group-hover:opacity-70 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${pack.color}, transparent)` }}
              />

              <div className="flex items-center gap-3 mb-3">
                {IconComp ? <IconComp size="sm" variant="floating" /> : null}
                <div>
                  <h3
                    className="text-xs font-display font-light tracking-[0.02em]"
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
