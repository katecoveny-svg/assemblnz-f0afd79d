import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { Shield, Server, Lock, Globe, FileText, AlertTriangle, Eye, Key, Database, RefreshCw } from "lucide-react";
import ParticleField from "@/components/ParticleField";

const sections = [
  {
    icon: Shield,
    title: "1. Overview",
    content: `Assembl is an AI-powered business advisory platform built for the New Zealand market. It provides 29 specialised AI agents covering industries including construction, legal, customs, agriculture, maritime, and more — each grounded in NZ legislation, standards, and regulatory frameworks.

This document outlines Assembl's security architecture, data handling practices, and privacy compliance posture for the purposes of government procurement evaluation and enterprise risk assessment.`,
  },
  {
    icon: Server,
    title: "2. AI Model & Processing",
    content: `**Model:** Claude Sonnet 4 by Anthropic (claude-sonnet-4-20250514)
**Provider:** Anthropic (anthropic.com) — a leading AI safety company
**Processing location:** Anthropic's infrastructure (United States)
**API version:** 2023-06-01

All AI processing occurs via Anthropic's Messages API. Assembl sends conversation context and receives generated responses in real-time. Anthropic's data usage policy confirms:

• Customer data is **not used to train models**
• Data is processed and discarded after response generation
• Anthropic maintains SOC 2 Type II certification
• Enterprise-grade encryption in transit and at rest`,
  },
  {
    icon: Globe,
    title: "3. Data Sovereignty Statement",
    content: `Assembl acknowledges that conversation data crosses New Zealand borders during AI processing. Specifically:

**Data processed offshore:**
• Conversation messages sent to Anthropic's API (US-based servers)
• Responses generated and returned to the user in real-time

**Data stored within cloud infrastructure:**
• User accounts and authentication credentials
• Conversation history (user-controlled, deletable)
• Saved items and preferences
• Usage analytics and message metadata

**Mitigations:**
• All data in transit is encrypted via TLS 1.3
• Anthropic does not retain conversation data beyond the API request lifecycle
• Users can delete their conversation history at any time
• No conversation data is shared with third parties
• Assembl does not sell or monetise user data`,
  },
  {
    icon: Key,
    title: "4. Security Architecture",
    content: `**Authentication:**
• Session-based authentication with secure tokens
• Automatic token refresh for seamless access
• Password hashing using bcrypt with salting
• Row-Level Security (RLS) on all database tables — users can only access their own data

**API Key Management:**
• All API keys (Anthropic, Meshy, etc.) are stored as encrypted environment variables
• Keys are **never exposed to client-side code**
• Server-side edge functions handle all external API communication
• API keys are rotated periodically

**Intellectual Property Protection:**
• All 29 agent system prompts are stored and executed exclusively server-side
• The frontend only transmits agent IDs and user messages
• Proprietary prompt logic and automation workflows are never exposed to the client

**Infrastructure:**
• Backend powered by Supabase (PostgreSQL, Edge Functions, Auth, Storage)
• All communication over HTTPS
• Database backups with point-in-time recovery
• Edge functions deployed in isolated Deno runtime environments`,
  },
  {
    icon: Database,
    title: "5. Data Flow Architecture",
    content: `\`\`\`
User → [HTTPS/TLS 1.3] → Assembl Frontend
  → [Authenticated API call] → Edge Function (Server-side)
    → [Encrypted] → Anthropic API (Claude)
    ← [Response] ← Anthropic API
  ← [Response rendered] ← Edge Function
← [Displayed to user] ← Assembl Frontend
\`\`\`

**What is transmitted to Anthropic:**
• The agent's system prompt (server-side only)
• The conversation history for context
• Any uploaded document content (for the current request only)

**What is NOT transmitted to Anthropic:**
• User credentials or passwords
• Payment information
• API keys or infrastructure secrets
• Other users' data`,
  },
  {
    icon: Eye,
    title: "6. Privacy Compliance (NZ Privacy Act 2020)",
    content: `Assembl's data practices align with the 13 Information Privacy Principles (IPPs) under the New Zealand Privacy Act 2020:

**IPP 1 — Purpose:** Data is collected solely to provide AI advisory services
**IPP 2 — Source:** Data is collected directly from users
**IPP 3 — Collection:** Users are informed of data collection via this page and our Privacy Policy
**IPP 4 — Manner:** Data is collected lawfully and transparently
**IPP 5 — Storage:** Data is stored securely with encryption and access controls
**IPP 6 — Access:** Users can access their data via their dashboard and export conversations
**IPP 7 — Correction:** Users can update their profile and delete saved items
**IPP 8 — Accuracy:** We do not make decisions based on user data without their input
**IPP 9 — Retention:** Conversation history is retained for 30 days by default; users can delete anytime
**IPP 10 — Use:** Data is used only for the purposes it was collected
**IPP 11 — Disclosure:** No data is shared with third parties (except Anthropic for processing)
**IPP 12 — Unique Identifiers:** Standard UUIDs are used; no NZ government identifiers are collected
**IPP 13 — Cross-border:** Acknowledged above with mitigations documented`,
  },
  {
    icon: FileText,
    title: "7. Privacy Impact Assessment Summary",
    content: `**Project:** Assembl AI Advisory Platform
**Assessment date:** March 2026
**Assessed by:** Assembl Security Team

**Personal information collected:**
• Email address (for authentication)
• Full name (optional, for personalisation)
• Conversation content (for AI processing and history)
• Usage metadata (agent used, timestamps, message counts)

**Sensitivity assessment:** LOW-MEDIUM
• No health records, financial data, or government ID numbers are required
• Conversation content may contain business-sensitive information at the user's discretion
• Users control what information they share in conversations

**Risk assessment:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data breach | Low | Medium | Encryption, RLS, access controls |
| Offshore processing | Certain | Low | Anthropic data policy, TLS, no retention |
| Prompt injection | Low | Low | Server-side prompts, input validation |
| Unauthorised access | Low | Medium | Authentication, RLS, session management |

**Residual risk:** LOW — acceptable for deployment`,
  },
  {
    icon: AlertTriangle,
    title: "8. Incident Response Plan",
    content: `In the event of a data breach or security incident, Assembl follows this response protocol:

**Phase 1 — Detection & Containment (0-4 hours)**
• Automated monitoring alerts trigger investigation
• Affected systems are isolated
• Initial assessment of scope and severity

**Phase 2 — Assessment (4-24 hours)**
• Determine what data was affected
• Identify the attack vector
• Assess whether personal information was compromised

**Phase 3 — Notification (within 72 hours)**
• Notify affected users via email with details of the breach
• Notify the **Office of the Privacy Commissioner** if the breach is likely to cause serious harm (as required under the Privacy Act 2020, Part 6A)
• Notify relevant stakeholders and partners

**Phase 4 — Remediation (ongoing)**
• Patch the vulnerability
• Conduct post-incident review
• Update security measures and documentation
• Publish a transparency report if appropriate

**Contact for security concerns:**
• Email: hello@assembl.co.nz
• Subject line: SECURITY — [description]`,
  },
  {
    icon: RefreshCw,
    title: "9. Ongoing Security Practices",
    content: `• Regular review and update of agent system prompts to reflect NZ legislation changes
• Periodic API key rotation
• Dependency security scanning and updates
• Monitoring of Anthropic's security posture and data policies
• User access logging and anomaly detection
• Regular review of RLS policies and database security

**Compliance frameworks referenced:**
• NZ Privacy Act 2020
• NZISM (New Zealand Information Security Manual)
• OWASP Top 10 for web application security
• Anthropic's Responsible Use Policy`,
  },
  {
    icon: Lock,
    title: "10. WCAG 2.1 AA Accessibility",
    content: `Assembl is committed to digital accessibility:

• High contrast mode available (WCAG 2.1 AA — 4.5:1 minimum contrast ratio)
• Full keyboard navigation (Tab, Enter, Escape)
• ARIA labels on all interactive elements
• Screen reader compatible interface
• Multi-language support (English, Te Reo Māori, Simplified Chinese)

This supports compliance with the **NZ Government Web Standards** and the **Web Accessibility Standard 1.1**.`,
  },
];

const SecurityPage = () => {
  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <ParticleField />
      <BrandNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary))20, hsl(var(--primary))08)" }}>
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-wide">Security & Privacy</h1>
              <p className="text-xs text-muted-foreground">Government Procurement & Enterprise Review Documentation</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-primary/20 text-primary">NZ Privacy Act 2020</span>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-primary/20 text-primary">NZISM Referenced</span>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-primary/20 text-primary">WCAG 2.1 AA</span>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-primary/20 text-primary">SOC 2 (Anthropic)</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">Last updated: March 2026 · Version 1.0</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <section
              key={i}
              className="rounded-xl border border-border bg-card p-5 sm:p-6 opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <section.icon size={16} className="text-primary shrink-0" />
                <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
              </div>
              <div className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line space-y-2">
                {section.content.split("\n\n").map((para, j) => {
                  // Handle markdown-style bold
                  const parts = para.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={j}>
                      {parts.map((part, k) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={k} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={k}>{part}</span>
                        )
                      )}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 rounded-xl border border-primary/20 bg-card p-6 text-center">
          <p className="text-xs text-foreground/70 mb-2">
            Need additional security documentation for your procurement process?
          </p>
          <a
            href="mailto:assembl@assembl.co.nz?subject=Security%20Documentation%20Request"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Contact Security Team
          </a>
          <p className="text-[10px] text-muted-foreground mt-3">hello@assembl.co.nz</p>
        </div>
      </main>
      <BrandFooter />
    </div>
  );
};

export default SecurityPage;
