// ═══════════════════════════════════════════════════════════════
// Editable Customer Proposal Template
// ABM-style proposal page with inline-editable placeholders.
// Admin can customise [Customer Name], [Industry], pain points,
// features, testimonials, and CTA — then share or export.
// ═══════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  Eye,
  LayoutTemplate,
  MessageSquare,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import Nav3DKeteLogo from "@/components/Nav3DKeteLogo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ─── Design tokens ─── */
const C = {
  bg: "#060610",
  surface: "#0B0B1A",
  card: "#0F0F1F",
  border: "rgba(255,255,255,0.06)",
  accent: "#3A7D6E",
  accentLight: "#5AADA0",
  gold: "#D4A843",
  t1: "rgba(255,255,255,0.92)",
  t2: "rgba(255,255,255,0.55)",
  t3: "rgba(255,255,255,0.35)",
};

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

/* ─── Editable text component ─── */
function EditableText({
  value,
  onChange,
  editing,
  className = "",
  as: Tag = "span",
  placeholder = "Click to edit",
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  placeholder?: string;
}) {
  if (!editing) return <Tag className={className}>{value || placeholder}</Tag>;
  return (
    <Tag
      className={`${className} outline-none ring-1 ring-[${C.accentLight}]/30 rounded px-1 -mx-1`}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent || "")}
      style={{ caretColor: C.accentLight }}
    >
      {value}
    </Tag>
  );
}

/* ─── Pain point card ─── */
function PainCard({
  number,
  title,
  description,
  editing,
  onTitleChange,
  onDescChange,
}: {
  number: string;
  title: string;
  description: string;
  editing: boolean;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
}) {
  return (
    <motion.div variants={fade} className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <span className="text-xs font-bold tracking-widest mb-3 block" style={{ color: C.accentLight }}>
        {number}
      </span>
      <EditableText
        value={title}
        onChange={onTitleChange}
        editing={editing}
        as="h3"
        className="text-lg font-bold mb-3"
        placeholder="Pain point title"
      />
      <EditableText
        value={description}
        onChange={onDescChange}
        editing={editing}
        as="p"
        className="text-sm leading-relaxed"
        placeholder="Describe the pain point..."
      />
    </motion.div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({
  icon: Icon,
  title,
  metric,
  description,
  editing,
  onTitleChange,
  onDescChange,
}: {
  icon: any;
  title: string;
  metric: string;
  description: string;
  editing: boolean;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
}) {
  return (
    <motion.div variants={fade} className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.accent}15` }}>
        <Icon size={20} style={{ color: C.accentLight }} />
      </div>
      <EditableText
        value={title}
        onChange={onTitleChange}
        editing={editing}
        as="h3"
        className="text-base font-bold mb-1"
        placeholder="Feature title"
      />
      <span className="text-xs font-semibold block mb-2" style={{ color: C.accentLight }}>{metric}</span>
      <EditableText
        value={description}
        onChange={onDescChange}
        editing={editing}
        as="p"
        className="text-sm leading-relaxed"
        placeholder="Feature description..."
      />
    </motion.div>
  );
}

/* ─── Main component ─── */
export default function ProposalTemplatePage() {
  const [editing, setEditing] = useState(true);

  // Editable fields
  const [customerName, setCustomerName] = useState("[Customer Name]");
  const [industry, setIndustry] = useState("[Industry]");
  const [heroTitle, setHeroTitle] = useState(
    "How [Customer Name] Can Reduce Admin Overhead and Improve Operational Control"
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    "A tailored look at how assembl's governed workflows address the specific operational pressures facing [Customer Name] in [Industry]."
  );

  const [painPoints, setPainPoints] = useState([
    {
      title: "Inconsistent processes across teams",
      description:
        "Without standardised workflows, how each team member handles the same task varies, leading to missed steps, rework, and compliance gaps that are hard to spot before they become costly.",
    },
    {
      title: "Admin overhead eating into productive time",
      description:
        "Quoting, compliance checks, scheduling, and follow-up documentation take hours away from high-value work. Manual processes scale poorly and introduce error at volume.",
    },
    {
      title: "Limited visibility into what's actually happening",
      description:
        "Managers lack real-time oversight of workflow status, approval states, and risk indicators, making it hard to intervene early or report confidently to stakeholders.",
    },
  ]);

  const [features] = useState([
    { icon: LayoutTemplate, title: "Defined workflow coverage", metric: "Fewer missed steps", description: "Pre-built workflow templates scoped to your industry tasks including quoting, compliance, reporting, and admin, with built-in rules that reflect NZ operating conditions." },
    { icon: Shield, title: "Role-based access and oversight", metric: "Better visibility", description: "Each team member sees only what's relevant to their role. Approvals, review gates, and escalation pathways keep senior staff in control without creating bottlenecks." },
    { icon: Target, title: "Business context configuration", metric: "Less rework", description: "Configure once with your business rules, client types, and compliance requirements. assembl learns your context so outputs are consistent with how your business actually operates." },
    { icon: Zap, title: "Start with one workflow, expand from there", metric: "Low-risk adoption", description: "No big-bang rollout required. Prove value on a single high-impact workflow such as quoting, H&S checks, or client onboarding, then expand when the team is ready." },
  ]);

  const [testimonialQuote, setTestimonialQuote] = useState(
    "We cut the time our team spent on quoting by nearly half within the first month. The approval pathways mean nothing gets sent to a client without a second set of eyes. Our error rate has dropped to near zero."
  );
  const [testimonialAuthor, setTestimonialAuthor] = useState("Sarah Thompson");
  const [testimonialRole, setTestimonialRole] = useState("Operations Manager, [Similar Company]");
  const [statNumber, setStatNumber] = useState("40%");
  const [statLabel, setStatLabel] = useState("reduction in admin time reported by NZ businesses using assembl's workflow tooling");

  const [faqItems, setFaqItems] = useState([
    { q: "How long does implementation take?", a: "Most businesses are running their first workflow within 2 weeks. assembl is designed for a low-friction start: configure your business context, pick a workflow, and roll out to the team." },
    { q: "Does this require us to change how we work?", a: "No. assembl adapts to your existing processes. We help you structure and govern them without replacing your team's judgement or forcing a new methodology." },
    { q: "How does pricing work for our team size?", a: "Pricing is based on workflow coverage and team size. We offer a discovery call to scope what's most relevant before any commitment is required." },
  ]);

  const [ctaTitle, setCtaTitle] = useState("Ready to see what this looks like for [Customer Name]?");
  const [ctaDescription, setCtaDescription] = useState(
    "Book a 30-minute personalised walkthrough scoped to your industry workflows and operating context."
  );

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const updatePainPoint = (idx: number, field: "title" | "description", value: string) => {
    setPainPoints((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.t1 }}>
      <SEO
        title={`assembl x ${customerName} — Proposal`}
        description={heroSubtitle}
      />

      {/* ─── Sticky nav ─── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b flex items-center justify-between px-5 sm:px-8 h-14"
        style={{ background: `${C.bg}ee`, borderColor: C.border }}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <Nav3DKeteLogo size={28} />
          <span
            className="text-xs tracking-[5px] lowercase font-light hidden sm:inline"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            assembl
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={editing ? "default" : "outline"}
            onClick={() => setEditing(!editing)}
            className="text-xs gap-1.5"
          >
            {editing ? <Eye size={14} /> : <Edit3 size={14} />}
            {editing ? "Preview" : "Edit"}
          </Button>
          <Button size="sm" variant="outline" onClick={copyShareLink} className="text-xs gap-1.5">
            <Copy size={14} /> Share
          </Button>
          <Link to="/contact">
            <Button size="sm" className="text-xs gap-1.5" style={{ background: C.accent }}>
              Book a demo <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── Edit mode indicator ─── */}
      {editing && (
        <div className="border-b px-5 py-2 text-xs flex items-center gap-2" style={{ background: `${C.gold}10`, borderColor: `${C.gold}20`, color: C.gold }}>
          <Edit3 size={12} />
          <span>Editing mode — click any text to customise. Toggle "Preview" to see the final version.</span>
        </div>
      )}

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: C.border }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${C.accent}08 0%, transparent 70%)` }} />
        <motion.div
          className="relative max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <div>
            <motion.div variants={fade} className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-bold tracking-[4px] uppercase" style={{ color: C.accentLight }}>
                assembl x{" "}
                <EditableText value={customerName} onChange={setCustomerName} editing={editing} className="inline" placeholder="[Customer Name]" />
              </span>
            </motion.div>

            <motion.div variants={fade} className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.accent}15` }}>
                <Nav3DKeteLogo size={24} />
              </div>
              <span className="text-lg" style={{ color: C.t3 }}>×</span>
              <span
                className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border"
                style={{ borderColor: C.border, color: C.t2 }}
              >
                <EditableText value={customerName} onChange={setCustomerName} editing={editing} className="inline" placeholder="[Customer Name]" />
              </span>
            </motion.div>

            <EditableText
              value={heroTitle}
              onChange={setHeroTitle}
              editing={editing}
              as="h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6"
              placeholder="Enter headline..."
            />

            <EditableText
              value={heroSubtitle}
              onChange={setHeroSubtitle}
              editing={editing}
              as="p"
              className="text-base sm:text-lg leading-relaxed mb-8"
              placeholder="Enter subtitle..."
            />

            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button className="rounded-full px-6 text-sm font-medium gap-2" style={{ background: C.accent }}>
                  Book a personalised demo <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" className="rounded-full px-6 text-sm font-medium">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          <motion.div variants={fade} className="hidden lg:block">
            <div
              className="rounded-2xl overflow-hidden aspect-[4/3]"
              style={{ background: `linear-gradient(135deg, ${C.accent}12, ${C.surface})`, border: `1px solid ${C.border}` }}
            >
              <div className="w-full h-full flex items-center justify-center" style={{ color: C.t3 }}>
                <div className="text-center">
                  <LayoutTemplate size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm opacity-60">Product dashboard preview</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── The Challenge ─── */}
      <section className="border-b" style={{ borderColor: C.border }}>
        <motion.div
          className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span variants={fade} className="text-[10px] font-bold tracking-[4px] uppercase block mb-3" style={{ color: C.accentLight }}>
            The Challenge
          </motion.span>
          <motion.div variants={fade}>
            <EditableText
              value={`The operational pressures ${customerName} faces today`}
              onChange={() => {}}
              editing={false}
              as="h2"
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-4"
            />
          </motion.div>
          <motion.p variants={fade} className="text-sm max-w-2xl mb-10" style={{ color: C.t2 }}>
            Businesses in{" "}
            <EditableText value={industry} onChange={setIndustry} editing={editing} className="inline font-medium text-foreground" placeholder="[Industry]" />{" "}
            consistently report three operational pain points that slow teams down, increase risk, and erode margins.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {painPoints.map((p, i) => (
              <PainCard
                key={i}
                number={`0${i + 1}`}
                title={p.title}
                description={p.description}
                editing={editing}
                onTitleChange={(v) => updatePainPoint(i, "title", v)}
                onDescChange={(v) => updatePainPoint(i, "description", v)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── How assembl helps ─── */}
      <section className="border-b" style={{ borderColor: C.border }}>
        <motion.div
          className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span variants={fade} className="text-[10px] font-bold tracking-[4px] uppercase block mb-3" style={{ color: C.accentLight }}>
            How assembl helps
          </motion.span>
          <motion.div variants={fade}>
            <EditableText
              value={`Governed workflows built around ${customerName}'s operating context`}
              onChange={() => {}}
              editing={false}
              as="h2"
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-4"
            />
          </motion.div>
          <motion.p variants={fade} className="text-sm max-w-2xl mb-10" style={{ color: C.t2 }}>
            assembl doesn't replace your team. It gives them structured support for the work that's most prone to inconsistency, risk, or delay.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <FeatureCard
                key={i}
                icon={f.icon}
                title={f.title}
                metric={f.metric}
                description={f.description}
                editing={editing}
                onTitleChange={() => {}}
                onDescChange={() => {}}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Testimonial ─── */}
      <section className="border-b" style={{ borderColor: C.border }}>
        <motion.div
          className="max-w-4xl mx-auto px-6 sm:px-10 py-16 sm:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span variants={fade} className="text-[10px] font-bold tracking-[4px] uppercase block mb-6" style={{ color: C.accentLight }}>
            Trusted by NZ businesses
          </motion.span>

          <motion.div variants={fade} className="rounded-2xl p-8" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <MessageSquare size={24} className="mb-4 opacity-30" />
            <EditableText
              value={testimonialQuote}
              onChange={setTestimonialQuote}
              editing={editing}
              as="p"
              className="text-lg sm:text-xl leading-relaxed italic mb-6"
              placeholder="Enter testimonial..."
            />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full" style={{ background: `${C.accent}20` }} />
              <div>
                <EditableText value={testimonialAuthor} onChange={setTestimonialAuthor} editing={editing} as="p" className="text-sm font-semibold" placeholder="Author name" />
                <EditableText value={testimonialRole} onChange={setTestimonialRole} editing={editing} as="p" className="text-xs" placeholder="Role & company" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fade} className="flex items-center gap-6 mt-8">
            <div>
              <EditableText value={statNumber} onChange={setStatNumber} editing={editing} as="span" className="text-4xl font-black" placeholder="40%" />
            </div>
            <EditableText value={statLabel} onChange={setStatLabel} editing={editing} as="p" className="text-sm max-w-md" placeholder="Stat description..." />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-b" style={{ borderColor: C.border }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              className="border-b py-6"
              style={{ borderColor: C.border }}
            >
              <EditableText
                value={item.q}
                onChange={(v) => setFaqItems((prev) => prev.map((f, j) => j === i ? { ...f, q: v } : f))}
                editing={editing}
                as="h3"
                className="text-base font-semibold mb-2"
                placeholder="Question..."
              />
              <EditableText
                value={item.a}
                onChange={(v) => setFaqItems((prev) => prev.map((f, j) => j === i ? { ...f, a: v } : f))}
                editing={editing}
                as="p"
                className="text-sm leading-relaxed"
                placeholder="Answer..."
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 80%, ${C.accent}12 0%, transparent 70%)` }} />
        <motion.div
          className="relative max-w-3xl mx-auto px-6 sm:px-10 py-20 sm:py-28 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <EditableText
            value={ctaTitle}
            onChange={setCtaTitle}
            editing={editing}
            as="h2"
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-4"
            placeholder="CTA headline..."
          />
          <EditableText
            value={ctaDescription}
            onChange={setCtaDescription}
            editing={editing}
            as="p"
            className="text-sm max-w-lg mx-auto mb-8"
            placeholder="CTA description..."
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button className="rounded-full px-8 py-3 text-sm font-medium gap-2" style={{ background: C.accent }}>
                Book a personalised walkthrough <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t py-8 text-center" style={{ borderColor: C.border }}>
        <p className="text-xs" style={{ color: C.t3 }}>
          © {new Date().getFullYear()} assembl · Built in Aotearoa 🇳🇿
        </p>
      </footer>
    </div>
  );
}
