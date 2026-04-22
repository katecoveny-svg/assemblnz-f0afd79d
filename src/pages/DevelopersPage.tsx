import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Plug,
  Boxes,
  Terminal,
  ShieldCheck,
  Eye,
  Brain,
  KeyRound,
  ArrowRight,
  Github,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

// ────────────────────────────────────────────────────────────────────────────
// Constants — every line of customer-facing copy is sourced from the spec.
// "AI" is banned in body copy. We use "system", "platform", "agents".
// ────────────────────────────────────────────────────────────────────────────
const MCP_URL = `https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/assembl-mcp`;

const HERO_CONFIG = `{
  "mcpServers": {
    "assembl-nz": { "url": "${MCP_URL}" }
  }
}`;

const TOOLSETS = [
  {
    slug: "manaaki",
    industry: "hospitality",
    agents: "AURA, MANAAKI, HAVEN",
    examples: ["aura_booking_check", "aura_food_plan", "aura_alcohol_licence"],
  },
  {
    slug: "waihanga",
    industry: "construction",
    agents: "ARAI, KAUPAPA, PAI",
    examples: ["arai_risk_register", "kaupapa_payment_claim", "kaupapa_eot"],
  },
  {
    slug: "auaha",
    industry: "creative",
    agents: "PRISM, NOVA, MUSE",
    examples: ["prism_brand_scan", "nova_campaign", "social_calendar"],
  },
  {
    slug: "pakihi",
    industry: "business",
    agents: "APEX, LEDGER, AROHA",
    examples: ["apex_pipeline", "ledger_invoice", "aroha_hire"],
  },
  {
    slug: "hangarau",
    industry: "technology",
    agents: "SIGNAL, SENTINEL, NEXUS",
    examples: ["signal_audit", "sentinel_health", "nexus_deploy"],
  },
  {
    slug: "core",
    industry: "all tiers",
    agents: "IHO, TIKANGA, compliance pipeline",
    examples: ["iho_route", "tikanga_check", "compliance_pipeline"],
  },
];

const TRUST_STEPS = [
  { label: "Kahu", role: "guard", icon: ShieldCheck },
  { label: "Tā", role: "check", icon: Eye },
  { label: "Mahara", role: "memory", icon: Brain },
  { label: "Mana", role: "authorise", icon: KeyRound },
];

const QUICK_START = {
  "claude-code": {
    label: "Claude Code",
    config: `{
  "mcpServers": {
    "assembl-nz": {
      "command": "npx",
      "args": [
        "@assembl/mcp",
        "--toolsets=manaaki,core",
        "--orgs=YOUR_ORG"
      ]
    }
  }
}`,
  },
  cursor: {
    label: "Cursor",
    config: `// .cursor/mcp.json
{
  "mcpServers": {
    "assembl-nz": {
      "url": "${MCP_URL}",
      "args": ["--toolsets=manaaki,core", "--orgs=YOUR_ORG"]
    }
  }
}`,
  },
  windsurf: {
    label: "Windsurf",
    config: `// ~/.windsurf/mcp_servers.json
{
  "assembl-nz": {
    "transport": "streamable-http",
    "url": "${MCP_URL}",
    "env": {
      "ASSEMBL_TOOLSETS": "manaaki,core",
      "ASSEMBL_ORG": "YOUR_ORG"
    }
  }
}`,
  },
} as const;

const CLI_SNIPPET = `npm install -g @assembl/cli
assembl login
assembl agents list --toolset=manaaki`;

const INDUSTRIES = [
  "Hospitality",
  "Construction",
  "Creative / Marketing",
  "Professional services",
  "Technology",
  "Education",
  "Other",
];

// Schema mirrors the RLS check on developer_waitlist.
const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .email("Enter a valid email address"),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  use_case: z
    .string()
    .trim()
    .max(1000, "Keep it under 1000 characters")
    .optional()
    .or(z.literal("")),
});

// ────────────────────────────────────────────────────────────────────────────
// Reusable bits
// ────────────────────────────────────────────────────────────────────────────
function CodeBlock({
  code,
  id,
  copyState,
  onCopy,
}: {
  code: string;
  id: string;
  copyState: string | null;
  onCopy: (code: string, id: string) => void;
}) {
  const isCopied = copyState === id;
  return (
    <div className="relative group">
      <pre
        className="rounded-xl bg-foreground/[0.04] border border-foreground/10 p-4 sm:p-5 text-[12px] sm:text-[13px] leading-relaxed overflow-x-auto text-foreground/85"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {code}
      </pre>
      <button
        type="button"
        onClick={() => onCopy(code, id)}
        aria-label="Copy code"
        className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur px-2 py-1 text-xs text-foreground/70 hover:text-foreground border border-foreground/10 hover:border-foreground/20 transition"
      >
        {isCopied ? <Check className="w-3.5 h-3.5 text-pounamu" /> : <Copy className="w-3.5 h-3.5" />}
        {isCopied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 shadow-[0_1px_2px_rgba(31,77,71,0.04),0_8px_24px_-12px_rgba(31,77,71,0.10)] ${className}`}
      style={{
        // 1px gold-tinted inner edge per spec, translated to the locked light theme
        boxShadow:
          "inset 0 0 0 1px rgba(212,168,67,0.18), 0 1px 2px rgba(31,77,71,0.04), 0 8px 24px -12px rgba(31,77,71,0.10)",
      }}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────
export default function DevelopersPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ email: "", industry: "", use_case: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((current) => (current === id ? null : current)), 2000);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = waitlistSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("developer_waitlist").insert({
      email: parsed.data.email,
      industry: parsed.data.industry || null,
      use_case: parsed.data.use_case || null,
      source: "developers_page",
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    toast.success("You're on the list. We'll be in touch.");
    setSubmitted(true);
    setForm({ email: "", industry: "", use_case: "" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Developers — Assembl | Agent-first platform with public MCP</title>
        <meta
          name="description"
          content="Connect Claude Code, Cursor, and Windsurf to Assembl's public MCP server. Six industry toolsets, governance built into the request path. Built in New Zealand."
        />
        <link rel="canonical" href="https://assembl.co.nz/developers" />
      </Helmet>

      <BrandNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── 1. HERO ────────────────────────────────────────────────────── */}
        <section className="pt-12 sm:pt-20 pb-14 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p
              className="text-xs sm:text-sm uppercase tracking-[0.32em] text-foreground/55 mb-5"
              style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
            >
              For developers · MCP-ready
            </p>
            <h1
              className="font-display font-light uppercase tracking-[0.06em] text-foreground leading-[1.05] text-4xl sm:text-6xl"
              style={{ letterSpacing: "0.04em" }}
            >
              Built for agents.
              <br />
              Born headless.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-foreground/70 max-w-2xl leading-relaxed">
              Salesforce just rebuilt their platform around AI agents. Assembl
              was born that way. Same architecture, priced for New Zealand
              small business.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => copy(HERO_CONFIG, "hero-config")}
                className="bg-kowhai text-foreground hover:bg-kowhai/90 shadow-sm"
              >
                <Plug className="w-4 h-4 mr-2" />
                Connect via MCP
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-foreground/20 text-foreground hover:bg-foreground/5"
              >
                <a
                  href="https://github.com/assembl-nz"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </div>

            <div className="mt-8 max-w-2xl">
              <CodeBlock
                code={HERO_CONFIG}
                id="hero-config"
                copyState={copied}
                onCopy={copy}
              />
              <p className="mt-2 text-xs text-foreground/55">
                Drop into <code className="font-mono">claude_desktop_config.json</code> and restart Claude Desktop.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── 2. THREE WAYS IN ───────────────────────────────────────────── */}
        <section id="three-ways" className="py-14 sm:py-20">
          <h2 className="font-display font-light uppercase tracking-[0.18em] text-2xl sm:text-3xl text-foreground/90 mb-2">
            Three ways in
          </h2>
          <div className="h-px w-16 bg-kowhai/60 mb-10" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Plug,
                title: "API",
                copy: "Standard HTTP/OAuth. Usable from any language.",
                code: `curl -X POST \\\n  ${MCP_URL}/api/v1/run`,
                id: "way-api",
              },
              {
                icon: Boxes,
                title: "MCP",
                copy: "Model Context Protocol. Works with Claude Code, Cursor, Windsurf out of the box.",
                code: `claude mcp add assembl-nz \\\n  ${MCP_URL}`,
                id: "way-mcp",
              },
              {
                icon: Terminal,
                title: "CLI",
                copy: "Scriptable. CI/CD-friendly. npm install @assembl/cli.",
                code: `npm install -g @assembl/cli`,
                id: "way-cli",
              },
            ].map((card) => (
              <GlassCard key={card.id} className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-kowhai/15 text-kowhai">
                    <card.icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-medium text-foreground">{card.title}</h3>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed flex-1">
                  {card.copy}
                </p>
                <CodeBlock code={card.code} id={card.id} copyState={copied} onCopy={copy} />
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ── 3. TOOLSETS ────────────────────────────────────────────────── */}
        <section id="toolsets" className="py-14 sm:py-20 scroll-mt-24">
          <h2 className="font-display font-light uppercase tracking-[0.18em] text-2xl sm:text-3xl text-foreground/90 mb-2">
            Six toolsets. Enable only what you need.
          </h2>
          <div className="h-px w-16 bg-kowhai/60 mb-6" />
          <p className="text-foreground/70 max-w-3xl leading-relaxed mb-8">
            Loading every tool into your model's context wastes tokens and
            degrades accuracy. Assembl groups its 44 agents into six industry
            toolsets. Enable <code className="font-mono text-foreground">manaaki</code> for hospitality.{" "}
            <code className="font-mono text-foreground">waihanga</code> for construction.{" "}
            <code className="font-mono text-foreground">core</code> always. Your context stays clean.
          </p>

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-foreground/55 border-b border-foreground/10">
                    <th className="py-3 px-4 sm:px-5 font-medium">Toolset</th>
                    <th className="py-3 px-4 sm:px-5 font-medium">Agents included</th>
                    <th className="py-3 px-4 sm:px-5 font-medium">Example tools</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLSETS.map((row, i) => (
                    <tr
                      key={row.slug}
                      className={
                        i !== TOOLSETS.length - 1
                          ? "border-b border-foreground/5"
                          : ""
                      }
                    >
                      <td className="py-4 px-4 sm:px-5 align-top">
                        <div className="font-mono text-foreground">{row.slug}</div>
                        <div className="text-xs text-foreground/55 mt-0.5">
                          {row.industry}
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-5 align-top text-foreground/80">
                        {row.agents}
                      </td>
                      <td className="py-4 px-4 sm:px-5 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {row.examples.map((tool) => (
                            <code
                              key={tool}
                              className="rounded bg-foreground/[0.06] px-2 py-0.5 text-[11px] text-foreground/80 font-mono"
                            >
                              {tool}
                            </code>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </section>

        {/* ── 4. MANA TRUST LAYER ────────────────────────────────────────── */}
        <section id="trust" className="py-14 sm:py-20 scroll-mt-24">
          <h2 className="font-display font-light uppercase tracking-[0.18em] text-2xl sm:text-3xl text-foreground/90 mb-2">
            The Mana Trust Layer
          </h2>
          <div className="h-px w-16 bg-kowhai/60 mb-3" />
          <p className="text-foreground/70 mb-10">Governance-first, not governance-bolted-on.</p>

          <GlassCard className="p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-3">
              {TRUST_STEPS.map((step, i) => (
                <div key={step.label} className="relative">
                  <div className="flex flex-col items-center text-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pounamu/12 text-pounamu border border-pounamu/20">
                      <step.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <div
                        className="text-sm font-medium text-foreground uppercase tracking-[0.18em]"
                        style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-foreground/55 mt-0.5">{step.role}</div>
                    </div>
                  </div>
                  {i < TRUST_STEPS.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-5 -right-2 w-4 h-4 text-foreground/30" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-8 text-foreground/70 leading-relaxed max-w-3xl">
              Every tool call routes through four checkpoints before it touches
              your data. Tikanga Māori governance principles built into the
              request path, not added afterwards. This is what makes Assembl
              defensible in New Zealand — and what no international agent
              platform can replicate.
            </p>
          </GlassCard>
        </section>

        {/* ── 5. QUICK START ─────────────────────────────────────────────── */}
        <section id="quick-start" className="py-14 sm:py-20 scroll-mt-24">
          <h2 className="font-display font-light uppercase tracking-[0.18em] text-2xl sm:text-3xl text-foreground/90 mb-2">
            Connect in 30 seconds
          </h2>
          <div className="h-px w-16 bg-kowhai/60 mb-8" />

          <Tabs defaultValue="claude-code" className="w-full">
            <TabsList className="bg-foreground/[0.04] border border-foreground/10">
              {Object.entries(QUICK_START).map(([key, val]) => (
                <TabsTrigger key={key} value={key} className="text-sm">
                  {val.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(QUICK_START).map(([key, val]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <CodeBlock
                  code={val.config}
                  id={`qs-${key}`}
                  copyState={copied}
                  onCopy={copy}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(val.config, `qs-${key}`)}
                  className="mt-3 border-foreground/20"
                >
                  {copied === `qs-${key}` ? (
                    <Check className="w-3.5 h-3.5 mr-2 text-pounamu" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-2" />
                  )}
                  Copy config
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* ── 6. CLI ─────────────────────────────────────────────────────── */}
        <section id="cli" className="py-14 sm:py-20 scroll-mt-24">
          <h2 className="font-display font-light uppercase tracking-[0.18em] text-2xl sm:text-3xl text-foreground/90 mb-2">
            The Assembl CLI
          </h2>
          <div className="h-px w-16 bg-kowhai/60 mb-8" />

          <div className="max-w-2xl">
            <CodeBlock code={CLI_SNIPPET} id="cli" copyState={copied} onCopy={copy} />
            <p className="mt-3 text-xs text-foreground/55">
              Status: beta. Node 20+ required.
            </p>
          </div>
        </section>

        {/* ── 7. WAITLIST ────────────────────────────────────────────────── */}
        <section id="early-access" className="py-14 sm:py-20 scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2">
              <h2 className="font-display font-light uppercase tracking-[0.18em] text-2xl sm:text-3xl text-foreground/90 mb-2">
                Early access
              </h2>
              <div className="h-px w-16 bg-kowhai/60 mb-5" />
              <p className="text-foreground/70 leading-relaxed">
                Join the developer preview. We open access in waves and reach
                out personally before turning anyone on.
              </p>
            </div>

            <GlassCard className="md:col-span-3 p-6 sm:p-8">
              {submitted ? (
                <div className="flex items-start gap-3 text-foreground/80">
                  <Check className="w-5 h-5 text-pounamu mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">You're on the list.</div>
                    <p className="text-sm text-foreground/65 mt-1">
                      We'll email you from <span className="font-mono">team@assembl.co.nz</span> when your slot opens.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.18em] text-foreground/60">
                      Email
                    </label>
                    <Input
                      type="email"
                      required
                      maxLength={255}
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="mt-1.5 bg-white/70 border-foreground/15"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.18em] text-foreground/60">
                      Industry
                    </label>
                    <Select
                      value={form.industry}
                      onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}
                    >
                      <SelectTrigger className="mt-1.5 bg-white/70 border-foreground/15">
                        <SelectValue placeholder="Pick one" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.18em] text-foreground/60">
                      What are you building?
                    </label>
                    <Textarea
                      maxLength={1000}
                      rows={3}
                      value={form.use_case}
                      onChange={(e) => setForm((f) => ({ ...f, use_case: e.target.value }))}
                      placeholder="One line is fine."
                      className="mt-1.5 bg-white/70 border-foreground/15 resize-none"
                      aria-invalid={!!errors.use_case}
                    />
                    {errors.use_case && (
                      <p className="mt-1 text-xs text-destructive">{errors.use_case}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-kowhai text-foreground hover:bg-kowhai/90"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Request access"
                    )}
                  </Button>
                  <p className="text-[11px] text-foreground/50 leading-relaxed">
                    By submitting, you agree to be contacted about Assembl's
                    developer preview. No spam — promise.
                  </p>
                </form>
              )}
            </GlassCard>
          </div>
        </section>

        {/* ── 8. Mini-footer note (full footer below) ────────────────────── */}
        <section className="py-10">
          <div className="text-center text-xs text-foreground/55 space-x-3">
            <Link to="/how-it-works" className="hover:text-foreground/80">
              Docs
            </Link>
            <span aria-hidden>·</span>
            <a
              href="https://github.com/assembl-nz"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-foreground/80"
            >
              GitHub
            </a>
            <span aria-hidden>·</span>
            <Link to="/status" className="hover:text-foreground/80">
              Status
            </Link>
            <span aria-hidden>·</span>
            <Link to="/contact" className="hover:text-foreground/80">
              Contact
            </Link>
          </div>
          <p className="mt-3 text-center text-[11px] text-foreground/45">
            Assembl Ltd. Auckland, New Zealand. Built with Supabase, Claude, and ElevenLabs.
          </p>
        </section>
      </main>

      <BrandFooter />
    </div>
  );
}
