import { useParams, Link, Navigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { agentSEO } from "@/data/agentSEO";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Zap, ArrowLeft, Sparkles } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import AgentAvatar from "@/components/AgentAvatar";
import AgentSkillsSection from "@/components/agents/AgentSkillsSection";
import { agents } from "@/data/agents";
import { agentCapabilities } from "@/data/agentCapabilities";

const AgentDetailPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = agents.find((a) => a.id === agentId);
  const rawCaps = agentCapabilities[agent?.id || ""] || [];
  const capabilities = rawCaps.map(c => typeof c === 'string' ? c : c.bullet);

  // JSON-LD structured data for SEO rich snippets
  useEffect(() => {
    if (!agent) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `${agent.name} – Assembl Specialist Tool`,
      "description": `${agent.tagline}. ${agent.role} — specialist tool for New Zealand ${agent.sector} businesses. Part of Assembl — business intelligence for NZ.`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": `https://assembl.co.nz/agents/${agent.id}`,
      "offers": {
        "@type": "Offer",
        "price": "750",
        "priceCurrency": "NZD",
        "description": "Available with Kete Tīmatanga subscription"
      },
      "provider": {
        "@type": "Organization",
        "name": "Assembl",
        "url": "https://assembl.co.nz",
        "logo": "https://assembl.co.nz/placeholder.svg"
      },
      "featureList": agent.expertise,
      "keywords": [agent.sector, "specialist tool", "New Zealand", "business intelligence", ...agent.traits],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "agent-jsonld";
    script.textContent = JSON.stringify(jsonLd);
    document.getElementById("agent-jsonld")?.remove();
    document.head.appendChild(script);

    const pageTitle = `${agent.name} – ${agent.sector} Specialist Tool | Assembl`;
    const pageDesc = `${agent.name}: ${agent.tagline}. ${agent.role} — specialist tool for NZ ${agent.sector} businesses. Part of Assembl — business intelligence for NZ.`;
    const pageUrl = `https://assembl.co.nz/agents/${agent.id}`;
    const pageImage = "https://assembl.co.nz/placeholder.svg";

    document.title = pageTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Standard meta
    setMeta("name", "description", pageDesc);

    // Open Graph
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", pageDesc);
    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:image", pageImage);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Assembl");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", pageDesc);
    setMeta("name", "twitter:image", pageImage);

    return () => { document.getElementById("agent-jsonld")?.remove(); };
  }, [agent]);

  if (agentId === "echo") return <Navigate to="/agents/echo" replace />;
  if (!agent) return <Navigate to="/" replace />;

  const seo = agentSEO[agentId || ""];

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "hsl(var(--background))" }}>
      {seo && <SEO title={seo.title} description={seo.description} path={`/agents/${agentId}`} />}
      <ParticleField />
      <div className="relative z-10">
        <BrandNav />
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[160px] opacity-[0.12] pointer-events-none"
          style={{ background: agent.color }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-body mb-10 transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <ArrowLeft size={14} /> Back to agents
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-14 items-center">
            {/* Avatar */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div
                className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${agent.color}08, ${agent.color}15)`,
                  border: `1px solid ${agent.color}20`,
                  boxShadow: `0 0 60px ${agent.color}18, 0 0 120px ${agent.color}08`,
                }}
              >
                <AgentAvatar agentId={agent.id} color={agent.color} size={180} showGlow={false} />
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: `inset 0 0 60px ${agent.color}08` }}
                />
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p
                className="font-mono-jb text-[10px] tracking-widest mb-3 uppercase"
                style={{ color: `${agent.color}60` }}
              >
                {agent.designation} · {agent.sector}
              </p>

              <h1
                className="font-display font-light text-4xl sm:text-5xl lg:text-6xl mb-2"
                style={{
                  color: agent.color,
                  textShadow: `0 0 40px ${agent.color}40, 0 0 100px ${agent.color}15`,
                }}
              >
                {agent.name}
              </h1>

              <p
                className="font-display font-bold text-lg sm:text-xl mb-4"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {agent.role}
              </p>

              <p
                className="font-body text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {agent.tagline}
              </p>

              {/* Traits */}
              <div className="flex flex-wrap gap-2 mb-8">
                {agent.traits.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-body font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: `${agent.color}12`,
                      color: `${agent.color}CC`,
                      border: `1px solid ${agent.color}20`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                to={`/chat/${agent.id}`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                style={{
                  background: agent.color,
                  color: "#0A0A14",
                  boxShadow: `0 0 24px ${agent.color}30, 0 4px 20px ${agent.color}20`,
                }}
              >
                Try {agent.name} Free <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXPERTISE GRID ── */}
      <section className="relative z-10 py-16 sm:py-24" style={{ borderTop: "1px solid hsl(var(--border) / 0.3)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono-jb tracking-wide mb-4" style={{ background: `${agent.color}10`, color: agent.color, border: `1px solid ${agent.color}20` }}>
              <Sparkles size={12} /> CORE EXPERTISE
            </div>
            <h2
              className="font-display font-light text-2xl sm:text-3xl"
              style={{ color: "hsl(var(--foreground))" }}
            >
              What {agent.name} does
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agent.expertise.map((item, i) => (
              <motion.div
                key={item}
                className="rounded-xl p-5 group transition-all duration-300"
                style={{
                  background: "hsl(var(--card) / 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid hsl(var(--border) / 0.4)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                whileHover={{ y: -3, borderColor: `${agent.color}40` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${agent.color}15`, color: agent.color }}
                  >
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
                      {item}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      {capabilities.length > 0 && (
        <section className="relative z-10 py-16 sm:py-24" style={{ borderTop: "1px solid hsl(var(--border) / 0.3)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-display font-light text-2xl sm:text-3xl" style={{ color: "hsl(var(--foreground))" }}>
                Built for real NZ work
              </h2>
              <p className="font-body text-sm mt-3 max-w-xl mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
                Every capability is grounded in New Zealand legislation, standards, and business practice.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap}
                  className="flex items-start gap-3 p-4 rounded-xl transition-all duration-300"
                  style={{
                    background: "hsl(var(--card) / 0.4)",
                    border: "1px solid hsl(var(--border) / 0.3)",
                  }}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <CheckCircle2
                    size={16}
                    className="shrink-0 mt-0.5"
                    style={{ color: agent.color }}
                  />
                  <p className="font-body text-sm leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.8)" }}>
                    {cap}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SKILLS & MCP WIRING ── */}
      <AgentSkillsSection agentId={agent.id} agentColor={agent.color} />

      {/* ── CONVERSATION STARTERS ── */}
      <section className="relative z-10 py-16 sm:py-24" style={{ borderTop: "1px solid hsl(var(--border) / 0.3)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-light text-2xl sm:text-3xl" style={{ color: "hsl(var(--foreground))" }}>
              Try asking {agent.name}
            </h2>
          </motion.div>

          <div className="space-y-3">
            {agent.starters.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <Link
                  to={`/chat/${agent.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group"
                  style={{
                    background: "hsl(var(--card) / 0.5)",
                    border: "1px solid hsl(var(--border) / 0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${agent.color}40`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${agent.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border) / 0.4)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${agent.color}12`, color: agent.color }}
                  >
                    <span className="text-sm font-bold">"</span>
                  </div>
                  <p className="font-body text-sm flex-1" style={{ color: "hsl(var(--foreground) / 0.8)" }}>
                    {s}
                  </p>
                  <ArrowRight
                    size={14}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: agent.color }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 py-20 sm:py-28">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${agent.color}08, transparent)`,
          }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="font-display font-light text-3xl sm:text-4xl mb-4"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Ready to put {agent.name} to work?
            </h2>
            <p className="font-body text-base mb-8 max-w-md mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
              No credit card required. Start chatting with your {agent.sector.toLowerCase()} specialist in seconds.
            </p>
            <Link
              to={`/chat/${agent.id}`}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-display font-bold transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: agent.color,
                color: "#0A0A14",
                boxShadow: `0 0 30px ${agent.color}35, 0 8px 32px ${agent.color}20`,
              }}
            >
              Try {agent.name} Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default AgentDetailPage;
