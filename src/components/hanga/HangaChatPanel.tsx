import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, X, Brain, ShieldAlert, FolderKanban,
  Layers, FileText, HardHat, ShieldCheck, Loader2, Sparkles,
  Users, UtensilsCrossed, Lock, Heart, PenTool, Shield
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  SupervisorControls,
  DEFAULT_SUPERVISOR_CONTEXT,
  type SupervisorComplianceContext,
} from "./SupervisorControls";
import { GovernanceAuditPanel } from "./GovernanceAuditPanel";
import { CompliancePreflightGate } from "./CompliancePreflightGate";
import {
  useGovernanceAuditLog,
  deriveActionKind,
  type AuditPolicyEvaluation,
  type AuditVerdict,
} from "./useGovernanceAuditLog";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`;

const AGENT_ICONS: Record<string, typeof Brain> = {
  Brain, ShieldAlert, FolderKanban, Layers, FileText, HardHat, ShieldCheck,
  Users, UtensilsCrossed, Lock, Heart, PenTool, Shield,
};

/**
 * Welcome-screen starter prompts shown above the input on a fresh chat.
 *
 * MANAAKI (hospitality) and ARATAKI (automotive/fleet) each surface exactly
 * three role-specific prompts that prefill the input box so the operator can
 * tweak before sending. Other kete keep their longer suggestion lists for
 * backwards compatibility.
 */
const PACK_SUGGESTIONS: Record<string, string[]> = {
  hanga: [
    "Report a hazard on site",
    "Check H&S compliance for working at height",
    "Generate a payment claim",
    "Create a toolbox talk topic",
    "Analyse a contract clause",
    "Check building consent status",
  ],
  manaaki: [
    "Draft a warm reply to a guest asking about late check-in",
    "Build a daily food-safety checklist for our kitchen team",
    "Plan next week's roster across front-of-house and housekeeping",
  ],
  arataki: [
    "Summarise this week's fleet fuel use and flag anything unusual",
    "Plan the most efficient route for tomorrow's deliveries across Auckland",
    "Check which vehicles are due for WoF, CoF or service in the next 30 days",
  ],
  pakihi: [
    "Employment cost calculator",
    "Draft employment agreement",
    "Leave entitlements guide",
    "Disciplinary process steps",
    "KiwiSaver obligations",
    "Redundancy consultation",
  ],
  auaha: [
    "Create brand guidelines",
    "Generate social media copy",
    "Blog post outline",
    "Email campaign draft",
  ],
  hangarau: [
    "Security vulnerability scan",
    "NZISM compliance check",
    "Incident response plan",
    "Cloud security review",
  ],
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  agentIcon?: string;
}

interface PackChatPanelProps {
  packId?: string;
  packLabel?: string;
}

export default function HangaChatPanel({ packId = "waihanga", packLabel = "Waihanga Intelligence" }: PackChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [supervisorContext, setSupervisorContext] = useState<SupervisorComplianceContext>(
    DEFAULT_SUPERVISOR_CONTEXT,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const isWaihanga = packId === "waihanga" || packId === "hanga";
  const auditKete = isWaihanga ? "WAIHANGA" : packId.toUpperCase();
  const { entries: auditEntries, record: recordAudit, clear: clearAudit } =
    useGovernanceAuditLog(auditKete);

  const pushSystemNote = (note: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**Supervisor action:** ${note}`,
        agentName: "Site Supervisor",
        agentIcon: "HardHat",
      },
    ]);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setActiveAgent("Routing...");

    let assistantContent = "";
    let agentName = "IHO Brain";
    let agentIcon = "Brain";
    const startedAt = performance.now();

    const buildAuditContext = () => ({
      ppeConfirmed: supervisorContext.ppeConfirmed,
      workerConsent: supervisorContext.workerConsent,
      containsWorkers: supervisorContext.containsWorkers,
      humanSignoff: supervisorContext.humanSignoff,
      headcount: supervisorContext.world.headcount,
      headcountCap: supervisorContext.world.headcountCap,
      criticalHazardZones: supervisorContext.world.criticalHazardZones,
    });

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          packId,
          messages: messages.filter(m => m.role === "user" || m.role === "assistant")
            .map(m => ({ role: m.role, content: m.content })),
          ...(isWaihanga ? { complianceContext: supervisorContext } : {}),
        }),
      });

      // Compliance pre-check rejections (403/409) carry verdict + evaluations
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI request failed" }));
        if (isWaihanga && (resp.status === 403 || resp.status === 409) && err?.verdict) {
          const verdict = err.verdict as AuditVerdict;
          recordAudit({
            kete: auditKete,
            agentName: "Compliance pre-check",
            action: err.action ?? deriveActionKind(text, undefined),
            zone: supervisorContext.zone,
            verdict,
            rationale: err.error ?? "Blocked by policy",
            evaluations: (err.evaluations ?? []) as AuditPolicyEvaluation[],
            context: buildAuditContext(),
            userMessagePreview: text.trim().slice(0, 120),
            approvalId: err.approvalId ?? null,
            durationMs: Math.round(performance.now() - startedAt),
          });
        }
        throw new Error(err.error || `Error ${resp.status}`);
      }

      agentName = decodeURIComponent(resp.headers.get("X-Agent-Name") || "IHO Brain");
      agentIcon = resp.headers.get("X-Agent-Icon") || "Brain";
      setActiveAgent(agentName);

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const assistantId = crypto.randomUUID();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent, agentName, agentIcon }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }

      // Allowed turn — log inferred action
      if (isWaihanga) {
        const action = deriveActionKind(text, undefined);
        recordAudit({
          kete: auditKete,
          agentName,
          action,
          zone: supervisorContext.zone,
          verdict: "allow",
          rationale: "Approved by Waihanga compliance pre-check",
          evaluations: [],
          context: buildAuditContext(),
          userMessagePreview: text.trim().slice(0, 120),
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Something went wrong";
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: "assistant", content: `️ ${errMsg}`, agentName: "System", agentIcon: "Brain",
      }]);
    } finally {
      setIsLoading(false);
      setActiveAgent(null);
    }
  };

  const AgentIcon = ({ icon }: { icon?: string }) => {
    const Icon = (icon && AGENT_ICONS[icon]) || Brain;
    return <Icon size={14} style={{ color: TEAL_ACCENT }} />;
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${TEAL_ACCENT})` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={22} color="#fff" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(74,165,168,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 0 40px rgba(74,165,168,0.05)",
              backdropFilter: "blur(20px) saturate(140%)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${POUNAMU}20, ${TEAL_ACCENT}20)` }}>
                  <Brain size={16} style={{ color: TEAL_ACCENT }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "#3D4250" }}>{packLabel}</h3>
                  <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    {activeAgent ? `${activeAgent} responding...` : "IHO routing active"}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors" style={{ color: "#9CA3AF" }}>
                <X size={16} />
              </button>
            </div>

            {/* Site supervisor controls (Waihanga only) */}
            {isWaihanga && (
              <SupervisorControls
                context={supervisorContext}
                onChange={setSupervisorContext}
                onSystemNote={pushSystemNote}
              />
            )}

            {/* Governed action audit log */}
            {isWaihanga && (
              <GovernanceAuditPanel
                entries={auditEntries}
                onClear={clearAudit}
                kete={auditKete}
              />
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background: `${TEAL_ACCENT}15` }}>
                    <Sparkles size={22} style={{ color: TEAL_ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#3D4250" }}>Kia ora! How can I help?</p>
                    <p className="text-[11px] mt-1" style={{ color: "#9CA3AF" }}>IHO will route your query to the right specialist</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {(PACK_SUGGESTIONS[packId] || PACK_SUGGESTIONS.hanga).map(s => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        title="Click to prefill — edit then send"
                        className="px-3 py-1.5 rounded-full text-[10px] transition-colors hover:bg-black/[0.03]"
                        style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", color: "#6B7280" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%]">
                    {msg.role === "assistant" && msg.agentName && (
                      <div className="flex items-center gap-1.5 mb-1 ml-1">
                        <AgentIcon icon={msg.agentIcon} />
                        <span className="text-[10px] font-medium" style={{ color: TEAL_ACCENT }}>{msg.agentName}</span>
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-2xl rounded-br-md"
                          : "rounded-2xl rounded-bl-md"
                      }`}
                      style={msg.role === "user" ? {
                        background: `${POUNAMU}15`,
                        color: "#3D4250",
                      } : {
                        background: "rgba(0,0,0,0.03)",
                        border: "1px solid rgba(0,0,0,0.06)",
                        color: "#3D4250",
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none [&_h2]:text-sm [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-xs [&_p]:text-[13px] [&_li]:text-[13px] [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 ml-1">
                  <Loader2 size={14} className="animate-spin" style={{ color: TEAL_ACCENT }} />
                  <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{activeAgent || "Thinking"}...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask about safety, projects, consents..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "#3D4250" }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ background: input.trim() ? `${POUNAMU}15` : "transparent" }}
                >
                  <Send size={16} style={{ color: input.trim() ? POUNAMU : "#9CA3AF" }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
