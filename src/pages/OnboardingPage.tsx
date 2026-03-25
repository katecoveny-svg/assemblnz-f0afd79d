import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Sparkles, Scan, Code, Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { drawAssemblPDFHeader, drawAssemblPDFFooter } from "@/lib/pdfBranding";

const PLAN_DETAILS: Record<string, { name: string; agents: string; price: string; features: string[] }> = {
  starter: { name: "Starter", agents: "3 agents", price: "$89/mo", features: ["3 specialist agents", "500 messages/mo", "PDF export", "Email support"] },
  pro: { name: "Pro", agents: "10 agents", price: "$299/mo", features: ["10 specialist agents", "2,500 messages/mo", "Voice agents", "Brand DNA scanner", "Priority support"] },
  business: { name: "Business", agents: "Unlimited agents", price: "$599/mo", features: ["All 43 agents", "Unlimited messages", "Agent-to-agent workflows", "API access", "Dedicated account manager"] },
};

function generateWelcomePDF(planKey: string) {
  const plan = PLAN_DETAILS[planKey] || PLAN_DETAILS.pro;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxW = pageWidth - margin * 2;

  let y = drawAssemblPDFHeader(doc, {
    documentTitle: "Welcome to Assembl",
    subtitle: `${plan.name} Plan — Onboarding Guide`,
  });

  // Welcome letter
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 35);
  doc.text("Kia ora and welcome!", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  const welcomeText =
    "Thank you for choosing Assembl. I'm Kate Hudson, founder — and I built this platform because NZ businesses deserve AI that actually understands our legislation, our industries, and our way of doing things.\n\n" +
    "This guide will get you up and running in under 10 minutes. Your agents are already trained on NZ law, industry best practices, and compliance requirements. They're ready to work — you just need to point them in the right direction.\n\n" +
    "If you ever need help, email me directly at kate@assembl.co.nz. I read every message.";
  const lines = doc.splitTextToSize(welcomeText, maxW);
  doc.text(lines, margin, y);
  y += lines.length * 4.2 + 6;

  // Plan details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 35);
  doc.text(`Your Plan: ${plan.name}`, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text(`Price: ${plan.price}  •  ${plan.agents}`, margin, y);
  y += 5;

  plan.features.forEach((f) => {
    doc.setFillColor(0, 229, 136);
    doc.circle(margin + 2, y - 1, 1, "F");
    doc.text(f, margin + 6, y);
    y += 4.5;
  });
  y += 4;

  // Quick start guide
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 35);
  doc.text("Quick Start Guide", margin, y);
  y += 7;

  const steps = [
    { title: "1. Choose Your First Agent", body: "Visit assembl.co.nz and browse the agent directory. Each agent specialises in a different area — APEX for construction, AURA for hospitality, FLUX for sales, LEDGER for accounting, and 39 more. Start with the one closest to your daily work." },
    { title: "2. Scan Your Brand DNA", body: "Go to any agent's chat and ask it to scan your website. It will extract your brand colours, tone of voice, target audience, and key messages. Every output from that point will be on-brand — social posts, documents, proposals, everything." },
    { title: "3. Train Your Agent", body: "Use the 'Train' tab to add your business context, FAQs, and specific rules. The more context you give, the better your agent performs. Think of it like briefing a new employee on their first day." },
    { title: "4. Embed the Chat Widget", body: "Want AI on your website? Copy the embed code from the Embed page (assembl.co.nz/embed) and paste it into your site. Your customers can chat with your branded AI assistant 24/7." },
    { title: "5. Explore Integrations", body: "Connect your calendar, accounting, project management, messaging, and more from Settings → Integrations. Your agents become more powerful with every connection." },
  ];

  doc.setFontSize(9);
  steps.forEach((step) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 35);
    doc.text(step.title, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const sl = doc.splitTextToSize(step.body, maxW);
    doc.text(sl, margin, y);
    y += sl.length * 4.2 + 5;
  });

  // Support info
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  y += 4;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 35);
  doc.text("Support & Contact", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  const supportLines = [
    "Email: kate@assembl.co.nz",
    "Website: assembl.co.nz",
    "Help: Just ask any agent — they can guide you through features",
    "Billing: Manage your subscription at assembl.co.nz/pricing",
    "",
    "Ngā mihi nui,",
    "Kate Hudson — Founder, Assembl",
    "Auckland, Aotearoa New Zealand 🇳🇿",
  ];
  supportLines.forEach((l) => {
    doc.text(l, margin, y);
    y += 4.5;
  });

  drawAssemblPDFFooter(doc, { agentName: "Assembl Onboarding" });
  doc.save("Assembl-Welcome-Guide.pdf");
}

const OnboardingPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const planKey = searchParams.get("plan") || "pro";
  const plan = PLAN_DETAILS[planKey] || PLAN_DETAILS.pro;
  const [downloaded, setDownloaded] = useState(false);
  const [autoDownloading, setAutoDownloading] = useState(false);

  // Auto-download PDF when arriving from checkout redirect
  useEffect(() => {
    const fromCheckout = document.referrer.includes("/dashboard") || location.state?.fromCheckout;
    if (!downloaded && !autoDownloading && fromCheckout) {
      setAutoDownloading(true);
      const timer = setTimeout(() => {
        generateWelcomePDF(planKey);
        setDownloaded(true);
        setAutoDownloading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [planKey, downloaded, autoDownloading, location.state]);

  const handleDownload = () => {
    generateWelcomePDF(planKey);
    setDownloaded(true);
  };

  const quickActions = [
    { icon: Sparkles, label: "Choose your first agent", href: "/", desc: "Browse all 43 specialist agents" },
    { icon: Scan, label: "Scan your Brand DNA", href: "/chat/marketing", desc: "Let PRISM analyse your website" },
    { icon: Code, label: "Embed the chat widget", href: "/embed", desc: "Add AI to your website in 30 seconds" },
    { icon: Mail, label: "Contact support", href: "mailto:kate@assembl.co.nz", desc: "kate@assembl.co.nz" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20" style={{ background: "#09090B" }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <motion.div
        className="relative z-10 w-full max-w-[720px] space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex justify-center">
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "#10B981" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          >
            <Check size={24} color="#09090B" strokeWidth={3} />
          </motion.div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-[2.5rem] font-syne font-bold leading-tight" style={{ color: "#FAFAFA", letterSpacing: "-0.025em" }}>
            Welcome to Assembl
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#A1A1AA" }}>
            Your <span className="font-semibold" style={{ color: "#00FF88" }}>{plan.name}</span> plan is active — {plan.agents} ready to go
          </p>
        </div>

        {/* Download PDF */}
        <motion.div
          className="rounded-xl p-6 border text-center"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-syne font-bold mb-2" style={{ color: "#FAFAFA" }}>
            Your Welcome Guide
          </h2>
          <p className="text-sm mb-4" style={{ color: "#A1A1AA" }}>
            Download your personalised onboarding PDF — includes quick start steps, plan details, and support contacts.
          </p>
          <Button
            onClick={handleDownload}
            className="gap-2"
            disabled={autoDownloading}
            style={{ background: downloaded ? "#10B981" : "#00FF88", color: "#09090B" }}
          >
            {autoDownloading ? <Sparkles size={16} className="animate-spin" /> : downloaded ? <Check size={16} /> : <Download size={16} />}
            {autoDownloading ? "Your welcome pack is downloading…" : downloaded ? "Downloaded!" : "Download Welcome PDF"}
          </Button>

          <p className="text-xs mt-3" style={{ color: "#71717A" }}>
            A copy has also been sent to your email address
          </p>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              {action.href.startsWith("mailto:") ? (
                <a
                  href={action.href}
                  className="block rounded-xl p-4 border transition-all hover:border-[#00FF88]/30 group"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,255,136,0.1)" }}>
                      <action.icon size={18} style={{ color: "#00FF88" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#FAFAFA" }}>{action.label}</p>
                      <p className="text-xs" style={{ color: "#71717A" }}>{action.desc}</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#00FF88" }} />
                  </div>
                </a>
              ) : (
                <Link
                  to={action.href}
                  className="block rounded-xl p-4 border transition-all hover:border-[#00FF88]/30 group"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,255,136,0.1)" }}>
                      <action.icon size={18} style={{ color: "#00FF88" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#FAFAFA" }}>{action.label}</p>
                      <p className="text-xs" style={{ color: "#71717A" }}>{action.desc}</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#00FF88" }} />
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Auto-email note */}
        <motion.div
          className="rounded-lg p-4 border text-center"
          style={{ background: "rgba(0,255,136,0.03)", borderColor: "rgba(0,255,136,0.1)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs" style={{ color: "#A1A1AA" }}>
             We've sent a welcome email to your inbox with your login details, this guide as a PDF attachment,
            and links to get started. Check your spam folder if you don't see it within 5 minutes.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
