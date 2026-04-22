import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, Calculator, Globe, Pencil, Send, Loader2, Sparkles, ImagePlus, X, Gamepad2 } from "lucide-react";
import { streamMcpChat, type ContentPart } from "@/lib/mcpChat";
import { toast } from "sonner";
import LearningGame from "./LearningGame";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";
const TANGAROA = "#1A3A5C";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB raw photo cap

interface Subject {
  name: string;
  icon: string;
  nzcLevel: string;
}

interface Child {
  name: string;
  year_level: string;
  subjects: Subject[];
}

interface Props {
  children: Child[];
}

const subjectIcons: Record<string, React.ReactNode> = {
  maths: <Calculator size={14} />,
  english: <Pencil size={14} />,
  science: <Globe size={14} />,
  te_reo: <GraduationCap size={14} />,
};

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${TANGAROA}25`,
  backdropFilter: "blur(14px)",
};

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string };

export default function HomeworkHelp({ children }: Props) {
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null); // data URL
  const [pendingImageName, setPendingImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const startWithSubject = (child: Child, subject: Subject) => {
    setActiveChild(child);
    setActiveSubject(subject);
    setMessages([]);
    setInput(`Help ${child.name} with ${subject.name}`);
  };

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, HEIC).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image is over 5 MB — try a smaller photo.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("Could not read image"));
      r.readAsDataURL(file);
    });
    setPendingImage(dataUrl);
    setPendingImageName(file.name);
  };

  const clearPendingImage = () => {
    setPendingImage(null);
    setPendingImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || streaming) return;

    const ctxParts: string[] = [];
    if (activeChild) ctxParts.push(`Child: ${activeChild.name} (Year ${activeChild.year_level})`);
    if (activeSubject) ctxParts.push(`Subject: ${activeSubject.name} — NZC Level ${activeSubject.nzcLevel}`);
    const contextLine = ctxParts.length ? `[Context: ${ctxParts.join(" · ")}]\n\n` : "";
    const userText = text || "Please help with this homework worksheet.";

    const userMsg: Msg = { role: "user", content: userText, imageUrl: pendingImage ?? undefined };

    // Build the multimodal payload sent to the model.
    const sendable = pendingImage
      ? {
          role: "user" as const,
          content: [
            { type: "text", text: contextLine + userText },
            { type: "image_url", image_url: { url: pendingImage, detail: "high" } },
          ] as ContentPart[],
        }
      : { role: "user" as const, content: contextLine + userText };

    // History sent to the model strips imageUrl (it's UI-only metadata).
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    clearPendingImage();
    setStreaming(true);

    try {
      await streamMcpChat({
        agentId: "toro",
        messages: [...history, sendable],
        onDelta: (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + chunk };
            return next;
          });
        },
        onDone: (finalContent) => {
          if (finalContent) {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === "assistant") next[next.length - 1] = { ...last, content: finalContent };
              return next;
            });
          }
          setStreaming(false);
        },
        onError: (e) => {
          toast.error(e.message || "Tōro chat failed");
          setStreaming(false);
        },
      });
    } catch (e) {
      toast.error((e as Error).message || "Tōro chat failed");
      setStreaming(false);
    }
  }, [input, streaming, messages, activeChild, activeSubject, pendingImage]);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#6B7280" }}>
        <BookOpen size={14} style={{ color: POUNAMU }} /> Homework Help
      </h2>

      <div className="rounded-xl p-4" style={{ ...glass, borderColor: `${POUNAMU}15` }}>
        <p className="font-body text-xs" style={{ color: "#6B7280" }}>
          NZC-aligned, age-appropriate help. Tap a subject below or just ask Tōro anything.
        </p>
      </div>

      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl p-5 space-y-3"
          style={glass}
        >
          <div className="flex items-center justify-between">
            <p className="font-body text-sm" style={{ color: "#1A1D29" }}>{child.name}</p>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>
              Year {child.year_level} · NZC
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {child.subjects.map((s, j) => {
              const isActive = activeChild?.name === child.name && activeSubject?.name === s.name;
              return (
                <button
                  key={j}
                  onClick={() => startWithSubject(child, s)}
                  className="rounded-lg p-3 flex items-center gap-2 text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: isActive ? `${POUNAMU}25` : `${TANGAROA}20`,
                    border: `1px solid ${isActive ? POUNAMU : TANGAROA}30`,
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>
                    {subjectIcons[s.icon] || <BookOpen size={14} />}
                  </div>
                  <div>
                    <p className="font-body text-xs" style={{ color: "#3D4250" }}>{s.name}</p>
                    <p className="font-mono text-[8px]" style={{ color: "#9CA3AF" }}>Level {s.nzcLevel}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* ── Inline chat with Tōro ── */}
      <div className="rounded-xl p-4 space-y-3" style={{ ...glass, borderColor: `${POUNAMU}25` }}>
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: POUNAMU }} />
          <p className="font-body text-xs uppercase tracking-wider" style={{ color: POUNAMU }}>
            Ask Tōro
            {activeChild && activeSubject && (
              <span className="ml-2 normal-case font-mono text-[10px]" style={{ color: "#6B7280" }}>
                · {activeChild.name} · {activeSubject.name}
              </span>
            )}
          </p>
        </div>

        <div
          ref={scrollRef}
          className="rounded-lg p-3 space-y-2 overflow-y-auto"
          style={{ background: "rgba(255,255,255,0.5)", minHeight: 120, maxHeight: 360, border: `1px solid ${TANGAROA}15` }}
        >
          {messages.length === 0 && (
            <p className="font-body text-xs text-center py-6" style={{ color: "#9CA3AF" }}>
              Pick a subject above or type a question to get started.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap rounded-2xl space-y-2"
                style={
                  m.role === "user"
                    ? { background: POUNAMU, color: "#FFFFFF", borderBottomRightRadius: 4 }
                    : { background: "rgba(255,255,255,0.95)", color: "#1A1D29", border: `1px solid ${TANGAROA}15`, borderBottomLeftRadius: 4 }
                }
              >
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    alt="Homework worksheet attachment"
                    className="rounded-lg max-h-48 w-auto object-contain"
                    style={{ background: "rgba(0,0,0,0.05)" }}
                  />
                )}
                <div>
                  {m.content || (m.role === "assistant" && streaming ? <Loader2 size={12} className="animate-spin" /> : null)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingImage && (
          <div
            className="flex items-center gap-2 rounded-lg p-2"
            style={{ background: `${POUNAMU}10`, border: `1px solid ${POUNAMU}30` }}
          >
            <img src={pendingImage} alt="Pending homework" className="w-10 h-10 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-[11px] truncate" style={{ color: POUNAMU }}>
                {pendingImageName ?? "Homework photo"}
              </p>
              <p className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>Will be sent with your next message</p>
            </div>
            <button
              onClick={clearPendingImage}
              className="p-1 rounded hover:bg-white/50 transition-all"
              aria-label="Remove image"
              type="button"
            >
              <X size={12} style={{ color: POUNAMU }} />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={streaming}
            className="px-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 hover:scale-[1.02]"
            style={{
              background: pendingImage ? `${POUNAMU}25` : "rgba(255,255,255,0.9)",
              border: `1px solid ${TANGAROA}25`,
              color: POUNAMU,
            }}
            aria-label="Upload homework photo"
            type="button"
            title="Upload a photo of the homework"
          >
            <ImagePlus size={14} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              pendingImage
                ? "Add a question about the photo (optional)…"
                : activeChild
                  ? `Ask about ${activeChild.name}'s homework…`
                  : "Ask Tōro about any subject…"
            }
            disabled={streaming}
            className="flex-1 rounded-lg px-3 py-2 text-xs font-body outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: `1px solid ${TANGAROA}25`,
              color: "#1A1D29",
            }}
          />
          <button
            onClick={send}
            disabled={streaming || (!input.trim() && !pendingImage)}
            className="px-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: POUNAMU, color: "#FFFFFF" }}
            aria-label="Send"
          >
            {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
