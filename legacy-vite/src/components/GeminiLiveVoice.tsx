import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { GEMINI_KIWI_VOICES, getDefaultGeminiVoice } from "@/data/elevenLabsAgents";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
  systemPrompt?: string;
}

export interface GeminiLiveVoiceHandle {
  sendTextPrompt: (text: string) => void;
}

// Use centralized Gemini NZ voice definitions
const GEMINI_VOICES = GEMINI_KIWI_VOICES;

const NZ_VOICE_INSTRUCTION = `IMPORTANT VOICE STYLE: You are not a textbook — you are the friend who happens to know the subject really well. Speak with a natural New Zealand English accent and manner. Use Kiwi phrases naturally: "no worries", "sweet as", "good on ya", "that's a tricky one", "keen?". Start with the plain answer, then add backing detail. Don't lead with section numbers — lead with what the person needs to know. If something is genuinely complicated, say so: "This one's a bit of a minefield, actually." Light humour is fine — "The Holidays Act is... not exactly beach reading." Use te reo Māori greetings naturally (kia ora, ka pai, tēnā koe). Be warm, down-to-earth, and approachable — like a trusted Kiwi colleague, not a corporate bot. NEVER say "I'm just an AI" — instead say "I can tell you what the law says, but if you're in a tricky spot, here's who to call." Avoid American slang. When greeting, prefer "Kia ora" over "Hello".`;

const glassCard: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const GeminiLiveVoice = forwardRef<GeminiLiveVoiceHandle, Props>(({ agentId, agentName, agentColor, systemPrompt }, ref) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceName, setVoiceName] = useState<string>(() => getDefaultGeminiVoice(agentId));
  const [transcript, setTranscript] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const playQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Expose sendTextPrompt to parent via ref
  useImperativeHandle(ref, () => ({
    sendTextPrompt: (text: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Send text as a client message to the Gemini Live session
        wsRef.current.send(JSON.stringify({
          clientContent: {
            turns: [{ role: "user", parts: [{ text }] }],
            turnComplete: true,
          },
        }));
        setTranscript(prev => [...prev, { role: "user", text }]);
      } else {
        toast.info("Start a voice session first, then try a quick prompt");
      }
    },
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const playNextChunk = useCallback(async () => {
    if (isPlayingRef.current || playQueueRef.current.length === 0) return;
    if (!audioContextRef.current) return;

    isPlayingRef.current = true;
    const chunk = playQueueRef.current.shift()!;

    try {
      // Gemini Live outputs 16-bit PCM at 24kHz
      const int16 = new Int16Array(chunk);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        if (playQueueRef.current.length > 0) {
          playNextChunk();
        } else {
          setIsSpeaking(false);
          setVolumeLevel(0);
        }
      };
      source.start();
      setIsSpeaking(true);
      setVolumeLevel(0.6);
    } catch (err) {
      console.error("Audio playback error:", err);
      isPlayingRef.current = false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to use voice chat");
      return;
    }

    setIsConnecting(true);

    try {
      // 1. Get ephemeral token from edge function
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke("gemini-live-token", {
        body: { agentId, voiceName, systemPrompt },
      });

      if (tokenErr || !tokenData?.uri) {
        throw new Error(tokenErr?.message || "Failed to get voice session token");
      }

      // 2. Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      mediaStreamRef.current = stream;

      // 3. Set up audio context
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      // 4. Connect WebSocket to Gemini Live
      const wsUri = tokenData.uri;
      const ws = new WebSocket(wsUri);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Gemini Live] Connected");
        setIsConnected(true);
        setIsConnecting(false);
        setIsListening(true);

        // Send setup message with system instruction
        const setupMsg = {
          setup: {
            model: "models/gemini-3.1-flash-live-preview",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
            },
            systemInstruction: {
              parts: [{
                text: (systemPrompt ? systemPrompt + "\n\n" : "") + NZ_VOICE_INSTRUCTION + (systemPrompt ? "" : `\n\nYou are ${agentName}, an AI assistant by Assembl (assembl.co.nz). You are speaking with a user in real-time voice conversation. Be concise, natural, and helpful. Speak like a knowledgeable New Zealand business advisor.`),
              }],
            },
            realtimeInput: {
              automaticActivityDetection: { disabled: false },
            },
          },
        };
        ws.send(JSON.stringify(setupMsg));

        // Start streaming microphone audio
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const pcm = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(pcm.length);
          for (let i = 0; i < pcm.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, pcm[i] * 32768));
          }
          const uint8 = new Uint8Array(int16.buffer);
          let binaryStr = "";
          for (let j = 0; j < uint8.length; j++) {
            binaryStr += String.fromCharCode(uint8[j]);
          }
          const base64 = btoa(binaryStr);
          ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{
                data: base64,
                mimeType: "audio/pcm;rate=16000",
              }],
            },
          }));
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Handle audio response
          if (msg.serverContent?.modelTurn?.parts) {
            for (const part of msg.serverContent.modelTurn.parts) {
              if (part.inlineData?.data) {
                // Decode base64 PCM audio
                const binary = atob(part.inlineData.data);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                  bytes[i] = binary.charCodeAt(i);
                }
                playQueueRef.current.push(bytes.buffer);
                playNextChunk();
              }
              if (part.text) {
                setTranscript(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "agent") {
                    return [...prev.slice(0, -1), { role: "agent", text: last.text + part.text }];
                  }
                  return [...prev, { role: "agent", text: part.text }];
                });
              }
            }
          }

          // Handle turn completion
          if (msg.serverContent?.turnComplete) {
            setIsListening(true);
          }

          // Handle user transcript (if available)
          if (msg.clientContent?.turns) {
            for (const turn of msg.clientContent.turns) {
              if (turn.role === "user") {
                for (const part of turn.parts || []) {
                  if (part.text) {
                    setTranscript(prev => [...prev, { role: "user", text: part.text }]);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("[Gemini Live] Message parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[Gemini Live] WebSocket error:", err);
        toast.error("Voice connection error");
        disconnect();
      };

      ws.onclose = (e) => {
        console.log("[Gemini Live] Closed:", e.code, e.reason);
        setIsConnected(false);
        setIsListening(false);
        setIsConnecting(false);
      };
    } catch (err) {
      console.error("[Gemini Live] Connection error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to start voice session");
      setIsConnecting(false);
      disconnect();
    }
  }, [user, agentId, agentName, voiceName, systemPrompt, playNextChunk]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    playQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setVolumeLevel(0);
  }, []);

  const ringScale = 1 + volumeLevel * 0.6;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Gemini Live badge */}
        <div className="flex items-center justify-center gap-2">
          <Zap size={12} style={{ color: agentColor }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: agentColor }}>
            Gemini Live · Real-time Voice
          </span>
        </div>

        {/* Voice visualiser */}
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full transition-transform duration-100"
              style={{
                background: `radial-gradient(circle, ${agentColor}20 0%, transparent 70%)`,
                transform: `scale(${ringScale + 0.5})`,
                opacity: isSpeaking || isListening ? 0.6 : 0,
              }}
            />
            <div
              className="absolute inset-0 rounded-full transition-transform duration-75"
              style={{
                border: `2px solid ${agentColor}40`,
                transform: `scale(${ringScale + 0.2})`,
                opacity: isSpeaking || isListening ? 0.8 : 0.2,
              }}
            />
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isConnected
                  ? `linear-gradient(135deg, ${agentColor}, ${agentColor}CC)`
                  : "rgba(255,255,255,0.05)",
                border: `2px solid ${isConnected ? agentColor : "rgba(255,255,255,0.1)"}`,
                boxShadow: isConnected ? `0 0 40px ${agentColor}40` : "none",
              }}
            >
              {isConnecting ? (
                <Loader2 size={32} className="animate-spin" style={{ color: agentColor }} />
              ) : isConnected ? (
                isSpeaking ? (
                  <Volume2 size={32} className="text-black" />
                ) : (
                  <Mic size={32} className="text-black animate-pulse" />
                )
              ) : (
                <Phone size={32} style={{ color: agentColor }} />
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {isConnecting
              ? "Connecting to Gemini Live…"
              : isConnected
              ? isSpeaking
                ? `${agentName} is speaking`
                : "Listening — just talk naturally"
              : "Tap to start live voice session"}
          </p>
        </div>

        {/* Transcript */}
        <div ref={scrollRef} className="rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto" style={glassCard}>
          {transcript.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-4">
              Start a real-time voice conversation with {agentName} — powered by Gemini Live
            </p>
          ) : (
            transcript.map((r, i) => (
              <div key={i} className={`flex ${r.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-xl px-3 py-2"
                  style={{
                    background: r.role === "user" ? "rgba(255,255,255,0.08)" : `${agentColor}15`,
                    border: `1px solid ${r.role === "user" ? "rgba(255,255,255,0.06)" : agentColor + "25"}`,
                  }}
                >
                  <p className="text-[11px] text-foreground leading-relaxed">{r.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className="p-4 rounded-full transition-all hover:scale-105"
            style={{
              background: isConnected ? "#C85A54" : agentColor,
              color: "#0A0A14",
              boxShadow: `0 0 20px ${isConnected ? "#C85A5440" : agentColor + "40"}`,
            }}
          >
            {isConnected ? <PhoneOff size={20} /> : <Phone size={20} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Zap size={16} style={{ color: agentColor }} />
          </button>
        </div>

        {/* Voice settings */}
        {showSettings && (
          <div className="rounded-xl p-4 space-y-3" style={glassCard}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Gemini Voice Settings
            </p>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1.5">Voice</label>
              <div className="flex flex-wrap gap-2">
                {GEMINI_VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoiceName(v.id)}
                    disabled={isConnected}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      background: voiceName === v.id ? agentColor + "20" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${voiceName === v.id ? agentColor + "40" : "rgba(255,255,255,0.06)"}`,
                      color: voiceName === v.id ? agentColor : "rgba(255,255,255,0.5)",
                      opacity: isConnected ? 0.5 : 1,
                    }}
                  >
                    {v.label} ({v.style})
                  </button>
                ))}
              </div>
              {isConnected && (
                <p className="text-[8px] text-muted-foreground/50 mt-1">
                  Disconnect to change voice
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-[8px] text-muted-foreground/50 text-center">
          Powered by Google Gemini Live API · Real-time bidirectional audio
        </p>
      </div>
    </div>
  );
});

GeminiLiveVoice.displayName = "GeminiLiveVoice";

export default GeminiLiveVoice;
