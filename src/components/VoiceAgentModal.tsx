import { useState, useCallback, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { X, Mic, Phone, PhoneOff, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  agentColor: string;
  elevenLabsAgentId?: string;
  onHandoffToChat?: (transcript: { role: "user" | "agent"; text: string }[]) => void;
}

const PLATFORM_CONTEXT = `You are part of the Assembl platform. If the user needs to upload documents, scan invoices, share images, or perform any file-based task, let them know they can switch to the text chat where document upload and scanning is available. Say something like "I can help you with that — for document uploads, tap the 'Continue in Chat' button below and I'll pick up right where we left off." You can also suggest handoffs to other specialist agents on the platform when relevant.`;

const VoiceAgentModal = ({ open, onClose, agentId, agentName, agentColor, elevenLabsAgentId, onHandoffToChat }: Props) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contextSentRef = useRef(false);

  // ── ElevenLabs Conversational AI mode ──
  const conversation = useConversation({
    onConnect: () => {
      setIsConnecting(false);
      toast.success(`Connected to ${agentName}`);
    },
    onDisconnect: () => {
      toast.info("Voice session ended");
    },
    onMessage: (message: any) => {
      if (message.type === "user_transcript" && message.user_transcription_event?.user_transcript) {
        setTranscript(prev => [...prev, { role: "user", text: message.user_transcription_event.user_transcript }]);
      }
      if (message.type === "agent_response" && message.agent_response_event?.agent_response) {
        setTranscript(prev => [...prev, { role: "agent", text: message.agent_response_event.agent_response }]);
      }
    },
    onError: (error: any) => {
      console.error("Voice error:", error);
      toast.error("Voice connection error");
      setIsConnecting(false);
    },
  });

  // ── Fallback: Speech Recognition + Chat + TTS mode ──
  const [fallbackListening, setFallbackListening] = useState(false);
  const [fallbackProcessing, setFallbackProcessing] = useState(false);
  const [fallbackSpeaking, setFallbackSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  const isConversationalMode = !!elevenLabsAgentId;
  const isConnected = isConversationalMode ? conversation.status === "connected" : fallbackActive;
  const isSpeaking = isConversationalMode ? conversation.isSpeaking : fallbackSpeaking;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcript]);

  // Send platform context after connection established
  useEffect(() => {
    if (isConversationalMode && conversation.status === "connected" && !contextSentRef.current) {
      try {
        conversation.sendContextualUpdate(PLATFORM_CONTEXT);
        contextSentRef.current = true;
      } catch (e) {
        console.warn("Could not send contextual update:", e);
      }
    }
  }, [conversation.status, isConversationalMode]);

  // Auto-save transcript on disconnect so voice data is never lost
  const prevOpenRef = useRef(open);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (wasOpen && !open) {
      // Modal is closing — save transcript before clearing
      if (transcript.length > 0 && onHandoffToChat) {
        onHandoffToChat(transcript);
      }
      if (conversation.status === "connected") conversation.endSession();
      recognitionRef.current?.stop();
      audioRef.current?.pause();
      setTranscript([]);
      setFallbackActive(false);
      setFallbackListening(false);
      setFallbackProcessing(false);
      setFallbackSpeaking(false);
      setLiveTranscript("");
      contextSentRef.current = false;
    }
  }, [open]);

  // Also save transcript when ElevenLabs disconnects unexpectedly
  const prevStatusRef = useRef(conversation.status);
  useEffect(() => {
    const wasConnected = prevStatusRef.current === "connected";
    prevStatusRef.current = conversation.status;

    if (wasConnected && conversation.status !== "connected" && transcript.length > 0 && onHandoffToChat) {
      onHandoffToChat(transcript);
      toast.info("Voice session ended — conversation saved to chat");
    }
  }, [conversation.status]);

  // ── Handoff to text chat (explicit button click) ──
  const handoffDoneRef = useRef(false);
  const handleHandoffToChat = useCallback(() => {
    if (onHandoffToChat && transcript.length > 0 && !handoffDoneRef.current) {
      handoffDoneRef.current = true;
      onHandoffToChat(transcript);
    }
    // End voice session
    if (isConversationalMode && conversation.status === "connected") {
      conversation.endSession();
    } else {
      recognitionRef.current?.stop();
      audioRef.current?.pause();
    }
    onClose();
    toast.success("Conversation transferred to text chat");
  }, [transcript, onHandoffToChat, isConversationalMode, conversation, onClose]);

  // ── Start Conversational AI session ──
  const startConversational = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-conversation-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ agentId: elevenLabsAgentId }),
        }
      );

      if (!res.ok) throw new Error("Failed to get conversation token");
      const data = await res.json();

      if (data.signedUrl) {
        await conversation.startSession({ signedUrl: data.signedUrl });
      } else if (data.token) {
        await conversation.startSession({ conversationToken: data.token, connectionType: "webrtc" as const });
      } else {
        throw new Error("No token received");
      }
    } catch (err: any) {
      console.error("Start error:", err);
      toast.error("Could not start voice session");
      setIsConnecting(false);
    }
  }, [conversation, elevenLabsAgentId]);

  const stopConversational = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // ── Fallback TTS flow ──
  const speakFallback = useCallback(async (text: string) => {
    if (!user) return;
    setFallbackSpeaking(true);
    try {
      const session = await supabase.auth.getSession();
      const tkn = session.data.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({ text, voiceId: "JBFqnCBsd6RMkjVDRZzb", voiceStyle: "professional" }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setFallbackSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch { setFallbackSpeaking(false); }
  }, [user]);

  const processFallbackMessage = useCallback(async (text: string) => {
    if (!user || !text.trim()) return;
    setTranscript(prev => [...prev, { role: "user", text }]);
    setFallbackProcessing(true);
    try {
      const historyMessages = transcript.slice(-6).map(r => ({
        role: r.role === "user" ? "user" : "assistant",
        content: r.text,
      }));
      const messages = [...historyMessages, { role: "user", content: text }];

      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages, agentId },
      });
      if (error) throw error;
      const reply = data?.content || data?.reply || data?.message || "I didn't catch that.";
      setTranscript(prev => [...prev, { role: "agent", text: reply }]);
      setFallbackProcessing(false);
      await speakFallback(reply);
    } catch { setFallbackProcessing(false); toast.error("Failed to get response"); }
  }, [user, agentId, transcript, speakFallback]);

  const startFallback = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch { toast.error("Microphone access required"); return; }

    setFallbackActive(true);
    startFallbackListening();
  }, []);

  const startFallbackListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported"); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-NZ";
    recognition.onresult = (event: any) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setLiveTranscript(interim || final);
      if (final) { setLiveTranscript(""); setFallbackListening(false); processFallbackMessage(final); }
    };
    recognition.onerror = () => setFallbackListening(false);
    recognition.onend = () => setFallbackListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setFallbackListening(true);
  }, [processFallbackMessage]);

  const stopFallback = useCallback(() => {
    recognitionRef.current?.stop();
    audioRef.current?.pause();
    setFallbackActive(false);
    setFallbackListening(false);
    setFallbackSpeaking(false);
  }, []);

  if (!open) return null;

  const handleStart = isConversationalMode ? startConversational : startFallback;
  const handleStop = isConversationalMode ? stopConversational : stopFallback;

  const isActive = isConnected || isConnecting;
  const showListening = isConversationalMode ? (isConnected && !isSpeaking) : fallbackListening;
  const showProcessing = !isConversationalMode && fallbackProcessing;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{ background: "rgba(14,14,26,0.95)", border: `1px solid ${agentColor}20` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${agentColor}15` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${agentColor}20`, color: agentColor }}>
              {agentName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{agentName} Voice</p>
              <p className="text-[10px] text-muted-foreground">
                {isConnected ? "Connected" : isConnecting ? "Connecting…" : "Ready"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Handoff to chat button */}
            {transcript.length > 0 && (
              <button
                onClick={handleHandoffToChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
                style={{ background: `${agentColor}15`, border: `1px solid ${agentColor}30`, color: agentColor }}
                title="Continue this conversation in text chat with document upload"
              >
                <MessageSquare size={12} /> Continue in Chat
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Visualiser */}
        <div className="flex flex-col items-center py-10">
          <div className="relative">
            {/* Pulse rings */}
            {(showListening || isSpeaking) && (
              <>
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${agentColor}10`, animationDuration: "2s" }} />
                <div className="absolute -inset-3 rounded-full" style={{ border: `2px solid ${agentColor}25`, animation: "pulse 1.5s infinite" }} />
              </>
            )}
            <button
              onClick={isActive ? handleStop : handleStart}
              disabled={showProcessing}
              className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isActive ? `linear-gradient(135deg, ${agentColor}, ${agentColor}CC)` : "rgba(255,255,255,0.05)",
                border: `2px solid ${isActive ? agentColor : "rgba(255,255,255,0.1)"}`,
                boxShadow: isActive ? `0 0 40px ${agentColor}30` : "none",
              }}
            >
              {isConnecting || showProcessing ? (
                <Loader2 size={28} className="animate-spin" style={{ color: isActive ? "#0A0A14" : agentColor }} />
              ) : isActive ? (
                <PhoneOff size={28} className="text-[#0A0A14]" />
              ) : (
                <Phone size={28} style={{ color: agentColor }} />
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {isConnecting ? "Connecting…"
              : showProcessing ? `${agentName} is thinking…`
              : isSpeaking ? `${agentName} is speaking`
              : showListening ? "Listening…"
              : isActive ? "Speak now"
              : "Tap to start voice chat"}
          </p>

          {liveTranscript && (
            <p className="mt-2 text-xs text-foreground/70 italic max-w-xs text-center">"{liveTranscript}"</p>
          )}

          {/* Tap-to-talk for fallback mode */}
          {!isConversationalMode && fallbackActive && !fallbackListening && !fallbackProcessing && !fallbackSpeaking && (
            <button
              onClick={startFallbackListening}
              className="mt-3 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all hover:scale-105"
              style={{ background: `${agentColor}15`, border: `1px solid ${agentColor}30`, color: agentColor }}
            >
              <Mic size={12} className="inline mr-1" /> Tap to speak
            </button>
          )}
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div ref={scrollRef} className="mx-4 mb-4 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {transcript.map((r, i) => (
              <div key={i} className={`flex ${r.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] rounded-xl px-3 py-1.5" style={{
                  background: r.role === "user" ? "rgba(255,255,255,0.06)" : `${agentColor}10`,
                  border: `1px solid ${r.role === "user" ? "rgba(255,255,255,0.05)" : agentColor + "20"}`,
                }}>
                  <p className="text-[11px] text-foreground leading-relaxed">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Handoff hint */}
        {isConnected && transcript.length >= 2 && (
          <div className="mx-4 mb-3 px-3 py-2 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[9px] text-muted-foreground">
              Need to upload documents or images? <button onClick={handleHandoffToChat} className="font-medium underline" style={{ color: agentColor }}>Continue in text chat →</button>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[8px] text-muted-foreground/50">
            Powered by ElevenLabs · {isConversationalMode ? "Conversational AI" : "Speech Recognition + TTS"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentModal;
