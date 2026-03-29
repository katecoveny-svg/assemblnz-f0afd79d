import { motion } from "framer-motion";
import { Brain, Mic, Palette, CreditCard, Database, Bot, Network, Shield } from "lucide-react";

const AI_STACK = [
  {
    name: "Google Gemini",
    description: "Multi-modal LLM powering all 42 agents",
    icon: Brain,
    color: "#4285F4",
    category: "AI Engine",
  },
  {
    name: "Claude / Anthropic",
    description: "Advanced reasoning for complex compliance tasks",
    icon: Bot,
    color: "#D4A574",
    category: "AI Engine",
  },
  {
    name: "ElevenLabs",
    description: "Natural voice agents for phone and IVR",
    icon: Mic,
    color: "#00CBA9",
    category: "Voice AI",
  },
  {
    name: "Canva API",
    description: "Automated design and brand asset generation",
    icon: Palette,
    color: "#7B2FF7",
    category: "Design",
  },
  {
    name: "Stripe",
    description: "Secure payment processing and subscriptions",
    icon: CreditCard,
    color: "#635BFF",
    category: "Payments",
  },
  {
    name: "Supabase",
    description: "Real-time database, auth, and edge functions",
    icon: Database,
    color: "#3ECF8E",
    category: "Backend",
  },
  {
    name: "MCP Protocol",
    description: "Agent-to-agent communication and tool sharing",
    icon: Network,
    color: "#00E5FF",
    category: "Protocol",
  },
  {
    name: "NZ Compliance Engine",
    description: "150+ compliance deadlines tracked automatically",
    icon: Shield,
    color: "#FF2D9B",
    category: "Compliance",
  },
];

const AIStackShowcase = () => {
  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-mono-jb uppercase tracking-widest text-muted-foreground/60 mb-3 block">
            Infrastructure
          </span>
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
            Built on the world's best{" "}
            <span className="text-gradient-hero">AI stack</span>
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground max-w-lg mx-auto">
            Every agent runs on enterprise-grade infrastructure. No toy demos — real AI
            tools integrated into one seamless operating system.
          </p>
        </motion.div>

        {/* Stack grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {AI_STACK.map((tool, i) => (
            <motion.div
              key={tool.name}
              className="group relative rounded-2xl p-5 sm:p-6 overflow-hidden border transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(14,14,26,0.5)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{
                borderColor: tool.color + "30",
                boxShadow: `0 0 40px ${tool.color}08`,
              }}
            >
              {/* Top edge glow on hover */}
              <span
                className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
                }}
              />

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: `${tool.color}10`,
                  border: `1px solid ${tool.color}20`,
                }}
              >
                <tool.icon size={20} style={{ color: tool.color }} />
              </div>

              <span
                className="text-[9px] font-mono-jb px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{
                  background: `${tool.color}10`,
                  color: tool.color,
                }}
              >
                {tool.category}
              </span>

              <h3 className="text-sm font-syne font-bold text-foreground mb-1">
                {tool.name}
              </h3>
              <p className="text-[11px] font-jakarta text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIStackShowcase;
