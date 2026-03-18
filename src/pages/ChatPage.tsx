import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { agents } from "@/data/agents";
import RobotIcon from "@/components/RobotIcon";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, ImagePlus, Paperclip, X, FileText, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ModelGenerationCard from "@/components/ModelGenerationCard";
import HelmQuickActions from "@/components/helm/HelmQuickActions";
import HelmChecklist from "@/components/helm/HelmChecklist";
import HelmDashboard from "@/components/helm/HelmDashboard";
import BrandScanModal from "@/components/BrandScanModal";

const CompletedModelCard = lazy(() => import("@/components/CompletedModelCard"));

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  fileName?: string;
}

interface ThreeDGeneration {
  id: string;
  messageIndex: number;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  prompt?: string;
  taskId?: string;
  modelUrls?: { glb?: string; obj?: string; fbx?: string };
  thumbnailUrl?: string;
  type?: "text-to-3d" | "image-to-3d";
}

interface DashboardItem {
  type: "event" | "meal" | "reminder";
  text: string;
  date?: string;
}

const TRIGGER_PATTERNS = [
  /generate\s+a?\s*3d/i,
  /create\s+a?\s*3d/i,
  /build\s+a?\s*3d/i,
  /make\s+a?\s*3d/i,
  /3d\s*model/i,
  /visuali[sz]e/i,
  /\brender\b/i,
  /show\s+me\s+(what|a)/i,
  /fly\s*through/i,
  /walkthrough/i,
];

const MAX_GENERATIONS_PER_SESSION = 5;
const HELM_COLOR = "#B388FF";

function shouldTrigger3D(text: string): boolean {
  return TRIGGER_PATTERNS.some((p) => p.test(text));
}

function hasChecklist(content: string): boolean {
  return /^[-*]\s*\[([ xX])\]/m.test(content);
}

async function imageToBase64(file: File, maxDim = 1024): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type || "image/jpeg", 0.85);
        const base64 = dataUrl.split(",")[1];
        const mediaType = file.type || "image/jpeg";
        resolve({ base64, mediaType });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const ChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = agents.find((a) => a.id === agentId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generations, setGenerations] = useState<ThreeDGeneration[]>([]);
  const [genCount, setGenCount] = useState(0);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [helmView, setHelmView] = useState<"chat" | "dashboard">("chat");
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // Brand scan state
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandProfile, setBrandProfile] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const helmFileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<Record<string, number>>({});

  const isArc = agentId === "arc";
  const isHelm = agentId === "operations";
  const isNexus = agentId === "nexus";
  const hasFileUpload = isHelm || isNexus;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, generations]);

  useEffect(() => {
    return () => {
      Object.values(pollingRef.current).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    };
  }, [pendingImagePreview]);

  const pollStatus = useCallback(
    (genId: string, taskId: string, type: "text-to-3d" | "image-to-3d" = "text-to-3d") => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-3d?taskId=${taskId}&type=${type}`,
            { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
          );
          const data = await res.json();
          setGenerations((prev) =>
            prev.map((g) =>
              g.id === genId
                ? {
                    ...g,
                    status: data.status,
                    progress: data.progress ?? g.progress,
                    modelUrls: data.modelUrls || g.modelUrls,
                    thumbnailUrl: data.thumbnailUrl || g.thumbnailUrl,
                  }
                : g
            )
          );
          if (data.status === "SUCCEEDED" || data.status === "FAILED") {
            clearInterval(interval);
            delete pollingRef.current[genId];
          }
        } catch {
          // silent retry
        }
      }, 5000);
      pollingRef.current[genId] = interval as unknown as number;
    },
    []
  );

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("chat-images").upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("chat-images").getPublicUrl(filePath);
    return data.publicUrl;
  }, []);

  const trigger3DGeneration = useCallback(
    async (userPrompt: string, msgIndex: number, imageUrl?: string) => {
      if (genCount >= MAX_GENERATIONS_PER_SESSION) {
        setGenerations((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            messageIndex: msgIndex,
            status: "FAILED",
            progress: 0,
            prompt: "You've reached the generation limit for this session.",
          },
        ]);
        return;
      }

      const genId = crypto.randomUUID();
      const isImage = !!imageUrl;
      setGenCount((c) => c + 1);
      setGenerations((prev) => [
        ...prev,
        {
          id: genId,
          messageIndex: msgIndex,
          status: "PENDING",
          progress: 0,
          prompt: isImage ? "Generating from uploaded image..." : undefined,
          type: isImage ? "image-to-3d" : "text-to-3d",
        },
      ]);

      try {
        const body = isImage ? { imageUrl } : { userPrompt };
        const { data, error } = await supabase.functions.invoke("generate-3d", { body });
        if (error) throw error;

        const genType = data.type || (isImage ? "image-to-3d" : "text-to-3d");
        setGenerations((prev) =>
          prev.map((g) =>
            g.id === genId
              ? { ...g, status: "PENDING", prompt: data.prompt, taskId: data.taskId, type: genType }
              : g
          )
        );
        if (data.taskId) pollStatus(genId, data.taskId, genType);
      } catch (err) {
        console.error("3D generation error:", err);
        setGenerations((prev) =>
          prev.map((g) => (g.id === genId ? { ...g, status: "FAILED", progress: 0 } : g))
        );
      }
    },
    [genCount, pollStatus]
  );

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="mb-4">Agent not found.</p>
          <Link to="/" className="text-primary underline">Back to agents</Link>
        </div>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
  };

  const handleHelmFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Maximum ${isImage ? "5MB" : "10MB"} for ${isImage ? "images" : "documents"}.`);
      return;
    }
    if (isImage) {
      setPendingImage(file);
      setPendingImagePreview(URL.createObjectURL(file));
    } else {
      setPendingFile(file);
    }
  };

  const clearPendingImage = () => {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    setPendingImage(null);
    setPendingImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (helmFileInputRef.current) helmFileInputRef.current.value = "";
  };

  const clearPendingFile = () => {
    setPendingFile(null);
    if (helmFileInputRef.current) helmFileInputRef.current.value = "";
  };

  const sendMessage = async (content: string, imageFile?: File | null, docFile?: File | null) => {
    if ((!content.trim() && !imageFile && !docFile) || isLoading) return;

    let uploadedImageUrl: string | undefined;
    let apiMessages: any[] = [];

    if (imageFile && isArc) {
      setIsUploading(true);
      try {
        uploadedImageUrl = await uploadImage(imageFile);
      } catch (err) {
        console.error("Image upload error:", err);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const displayContent = content.trim() || (uploadedImageUrl ? "Generate a 3D model from this image" : docFile ? `📎 ${docFile.name}` : "");
    const userMessage: Message = {
      role: "user",
      content: displayContent,
      imageUrl: uploadedImageUrl || (imageFile && isHelm ? URL.createObjectURL(imageFile) : undefined),
      fileName: docFile?.name,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    clearPendingImage();
    clearPendingFile();
    setIsLoading(true);

    const msgIndex = newMessages.length;
    const should3D = isArc && (!!uploadedImageUrl || shouldTrigger3D(userMessage.content));

    try {
      if (isHelm && imageFile) {
        const { base64, mediaType } = await imageToBase64(imageFile);
        const textContent = content.trim() || "Please parse this document and extract all dates, events, deadlines, and action items.";
        const historyMsgs = messages.map((m) => ({ role: m.role, content: m.content || "(attachment)" }));
        apiMessages = [
          ...historyMsgs,
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: textContent },
            ],
          },
        ];
      } else if (isHelm && docFile) {
        const fileText = await readFileAsText(docFile);
        const textContent = content.trim() || "Please parse this document and extract all dates, events, deadlines, and action items.";
        const fullText = `${textContent}\n\n---\n\nDocument content (${docFile.name}):\n\n${fileText}`;
        apiMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content || "(attachment)" })),
          { role: "user", content: fullText },
        ];
      } else {
        apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content || "(attachment)" }));
      }

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          agentId: agent.id,
          messages: apiMessages,
          brandContext: brandProfile || undefined,
        },
      });

      if (error) throw error;
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }

    if (should3D) {
      trigger3DGeneration(userMessage.content, msgIndex, uploadedImageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, pendingImage, pendingFile);
  };

  const handleRefine = (refinement: string) => {
    sendMessage(`Refine the 3D model: ${refinement}`);
  };

  const handleAddReminder = (text: string) => {
    setDashboardItems((prev) => [...prev, { type: "reminder", text }]);
  };

  const showWelcome = messages.length === 0;
  const getGenerationsForIndex = (idx: number) => generations.filter((g) => g.messageIndex === idx);

  const renderMessageContent = (msg: Message) => {
    const content = msg.content;

    if (isHelm && hasChecklist(content)) {
      const lines = content.split("\n");
      const parts: { type: "text" | "checklist"; content: string }[] = [];
      let currentText = "";
      let checklistLines: string[] = [];

      const flushText = () => { if (currentText.trim()) { parts.push({ type: "text", content: currentText }); currentText = ""; } };
      const flushChecklist = () => { if (checklistLines.length) { parts.push({ type: "checklist", content: checklistLines.join("\n") }); checklistLines = []; } };

      for (const line of lines) {
        if (/^[-*]\s*\[([ xX])\]/.test(line.trim())) {
          flushText();
          checklistLines.push(line);
        } else {
          flushChecklist();
          currentText += line + "\n";
        }
      }
      flushText();
      flushChecklist();

      return (
        <>
          {parts.map((p, i) =>
            p.type === "checklist" ? (
              <HelmChecklist key={i} content={p.content} />
            ) : (
              <div key={i} className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-accent prose-headings:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{p.content}</ReactMarkdown>
              </div>
            )
          )}
        </>
      );
    }

    return (
      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-accent prose-headings:text-foreground prose-strong:text-foreground">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <RobotIcon color={agent.color} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">{agent.name}</span>
            <span className="font-mono-jb text-[10px] text-muted-foreground">{agent.designation}</span>
          </div>
          <p className="text-[11px] truncate" style={{ color: agent.color }}>
            {agent.role}
          </p>
        </div>

        {/* Brand badge or add button */}
        {brandProfile ? (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
            style={{ backgroundColor: agent.color + "15", color: agent.color, border: `1px solid ${agent.color}25` }}
          >
            <Globe size={10} />
            <span className="max-w-[80px] truncate">{brandName}</span>
            <button
              onClick={() => { setBrandProfile(null); setBrandName(null); }}
              className="hover:opacity-70 ml-0.5"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setBrandModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80"
            style={{ color: agent.color, border: `1px solid ${agent.color}20` }}
            title="Add your website for tailored advice"
          >
            <Globe size={10} />
            <span className="hidden sm:inline">Add website</span>
          </button>
        )}

        {/* HELM Dashboard Toggle */}
        {isHelm && (
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              onClick={() => setHelmView("chat")}
              className="px-3 py-1 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: helmView === "chat" ? HELM_COLOR + "20" : "transparent",
                color: helmView === "chat" ? HELM_COLOR : "hsl(var(--muted-foreground))",
              }}
            >
              Chat
            </button>
            <button
              onClick={() => setHelmView("dashboard")}
              className="px-3 py-1 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: helmView === "dashboard" ? HELM_COLOR + "20" : "transparent",
                color: helmView === "dashboard" ? HELM_COLOR : "hsl(var(--muted-foreground))",
              }}
            >
              Dashboard
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse-glow"
            style={{ backgroundColor: "#00FF88", boxShadow: "0 0 6px #00FF88" }}
          />
          <span className="text-[10px] font-mono-jb text-foreground/50">LIVE</span>
        </div>
      </header>

      {/* Brand Scan Modal */}
      <BrandScanModal
        agentName={agent.name}
        agentColor={agent.color}
        open={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        onBrandLoaded={(profile, name) => {
          setBrandProfile(profile);
          setBrandName(name);
        }}
      />

      {/* HELM Dashboard View */}
      {isHelm && helmView === "dashboard" ? (
        <div className="flex-1 overflow-y-auto">
          <HelmDashboard items={dashboardItems} onAddReminder={handleAddReminder} />
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {showWelcome ? (
              <div
                className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-0 animate-fade-up"
                style={{ animationFillMode: "forwards" }}
              >
                <RobotIcon color={agent.color} size={72} />
                <div>
                  <h2 className="text-lg font-bold text-foreground">{agent.name}</h2>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
                      style={{ backgroundColor: "#00FF88", boxShadow: "0 0 6px #00FF88" }}
                    />
                    <span className="text-xs text-foreground/50">online</span>
                  </div>
                  <p className="text-xs italic text-muted-foreground">"{agent.tagline}"</p>
                </div>

                {isHelm ? (
                  <HelmQuickActions onSelect={(msg) => sendMessage(msg)} />
                ) : (
                  <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
                    {agent.starters.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-left text-xs px-4 py-3 rounded-lg border border-border bg-card hover:border-foreground/10 transition-colors text-foreground/70"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-3">
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div
                      className={`flex gap-2 opacity-0 animate-fade-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      style={{ animationDelay: `${i * 30}ms`, animationFillMode: "forwards" }}
                    >
                      {msg.role === "assistant" && <RobotIcon color={agent.color} size={24} />}
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "text-foreground rounded-br-sm"
                            : "bg-card text-foreground/90 rounded-bl-sm"
                        }`}
                        style={
                          msg.role === "user"
                            ? {
                                background: `linear-gradient(135deg, ${agent.color}18, ${agent.color}08)`,
                                border: `1px solid ${agent.color}15`,
                              }
                            : {}
                        }
                      >
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="Uploaded reference" className="rounded-lg mb-2 max-h-48 w-auto object-cover" />
                        )}
                        {msg.fileName && (
                          <div className="flex items-center gap-1.5 mb-2 text-xs text-foreground/60">
                            <FileText size={14} />
                            <span>{msg.fileName}</span>
                          </div>
                        )}
                        {renderMessageContent(msg)}
                      </div>
                    </div>
                    {msg.role === "assistant" &&
                      getGenerationsForIndex(i).map((gen) => (
                        <div key={gen.id} className="mt-2 ml-8">
                          {gen.status === "SUCCEEDED" && gen.modelUrls?.glb ? (
                            <Suspense
                              fallback={
                                <ModelGenerationCard status="IN_PROGRESS" progress={99} prompt={gen.prompt} color={agent.color} />
                              }
                            >
                              <CompletedModelCard
                                glbUrl={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-model?url=${encodeURIComponent(gen.modelUrls.glb)}`}
                                modelUrls={gen.modelUrls}
                                prompt={gen.prompt}
                                color={agent.color}
                                onRefine={handleRefine}
                              />
                            </Suspense>
                          ) : (
                            <ModelGenerationCard status={gen.status} progress={gen.progress} prompt={gen.prompt} color={agent.color} />
                          )}
                        </div>
                      ))}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 items-center">
                    <RobotIcon color={agent.color} size={24} />
                    <div className="flex gap-1 px-3 py-2">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full animate-bounce-dot"
                          style={{ backgroundColor: agent.color, animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* File Preview */}
          {(pendingImagePreview || pendingFile) && (isArc || isHelm) && (
            <div className="px-4 pb-1 shrink-0">
              <div className="max-w-2xl mx-auto">
                {pendingImagePreview && (
                  <div className="relative inline-block">
                    <img src={pendingImagePreview} alt="Upload preview" className="h-20 rounded-lg border border-border object-cover" />
                    <button onClick={clearPendingImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                )}
                {pendingFile && (
                  <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
                    <FileText size={16} className="text-foreground/60" />
                    <span className="text-xs text-foreground/70">{pendingFile.name}</span>
                    <button onClick={clearPendingFile} className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center ml-1">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border shrink-0">
            <div className="max-w-2xl mx-auto flex gap-2 items-center">
              {isArc && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/10 transition-colors disabled:opacity-30"
                    title="Upload a photo or sketch to generate a 3D model"
                  >
                    <ImagePlus size={16} />
                  </button>
                </>
              )}

              {isHelm && (
                <>
                  <input
                    ref={helmFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.pdf,.txt,.text,.csv,.md"
                    onChange={handleHelmFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => helmFileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="p-2.5 rounded-lg border transition-colors disabled:opacity-30"
                    style={{ borderColor: HELM_COLOR + "30", color: HELM_COLOR }}
                    title="Upload a document, photo, or newsletter"
                  >
                    <Paperclip size={16} />
                  </button>
                </>
              )}

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isArc && pendingImage
                    ? "Describe the building, or send to generate from image..."
                    : isHelm
                    ? "Ask HELM anything — meals, budgets, schedules, life admin..."
                    : `Ask ${agent.name} anything...`
                }
                className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/10 transition-colors"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !pendingImage && !pendingFile) || isLoading || isUploading}
                className="px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-30"
                style={{
                  backgroundColor: input.trim() || pendingImage || pendingFile ? agent.color : "transparent",
                  color: input.trim() || pendingImage || pendingFile ? "#0A0A14" : agent.color,
                  border: `1px solid ${input.trim() || pendingImage || pendingFile ? agent.color : agent.color + "30"}`,
                  boxShadow: input.trim() || pendingImage || pendingFile ? `0 0 16px ${agent.color}30` : "none",
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatPage;
