import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
}

const glassCard: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "Rangi", style: "professional", desc: "Professional NZ advisor" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Aroha", style: "warm", desc: "Warm Kiwi colleague" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Tama", style: "mate", desc: "Your Kiwi mate" },
];

const VoiceAgentLive = ({ agentId, agentName, agentColor }: Props) => {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responses, setResponses] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [voiceStyle, setVoiceStyle] = useState("professional");
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedVoice = VOICES.find((v) => v.style === voiceStyle) || VOICES[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responses]);

  const speakResponse = useCallback(
    async (text: string) => {
      if (!user) return;
      setIsSpeaking(true);
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text,
              voiceId: selectedVoice.id,
              voiceStyle: selectedVoice.style,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Voice synthesis failed");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.muted = isMuted;

        // Set up audio analysis for visualisation
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(audio);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyserRef.current = analyser;

        const updateVolume = () => {
          if (!analyserRef.current) return;
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setVolumeLevel(avg / 255);
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };

        audio.onplay = () => updateVolume();
        audio.onended = () => {
          setIsSpeaking(false);
          setVolumeLevel(0);
          cancelAnimationFrame(animFrameRef.current);
          audioCtx.close();
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
        toast.error("Voice playback failed");
        setIsSpeaking(false);
      }
    },
    [user, selectedVoice, isMuted]
  );

  const processUserMessage = useCallback(
    async (text: string) => {
      if (!user || !text.trim()) return;

      setResponses((prev) => [...prev, { role: "user", text }]);
      setIsProcessing(true);

      try {
        const reply = await agentChat({
          agentId,
          message: text,
          messages: responses.slice(-6).map((r) => ({
            role: r.role === "user" ? "user" : "assistant",
            content: r.text,
          })),
        });
        setResponses((prev) => [...prev, { role: "agent", text: reply }]);
        setIsProcessing(false);

        // Speak the response
        await speakResponse(reply);
      } catch (err) {
        console.error("Chat error:", err);
        setIsProcessing(false);
        toast.error("Failed to get response");
      }
    },
    [user, agentId, responses, speakResponse]
  );

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-NZ";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(interim || final);
      if (final) {
        setTranscript("");
        setIsListening(false);
        processUserMessage(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      if (event.error !== "no-speech") {
        toast.error("Microphone error: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [processUserMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript("");
  }, []);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    setIsSpeaking(false);
    setVolumeLevel(0);
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Animated ring size based on volume
  const ringScale = 1 + volumeLevel * 0.6;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Voice visualiser */}
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            {/* Outer animated ring */}
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
            {/* Main mic button */}
            <button
              onClick={isListening ? stopListening : isSpeaking ? stopSpeaking : startListening}
              disabled={isProcessing}
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isListening
                  ? `linear-gradient(135deg, ${agentColor}, ${agentColor}CC)`
                  : isSpeaking
                  ? `linear-gradient(135deg, ${agentColor}40, ${agentColor}20)`
                  : "rgba(255,255,255,0.05)",
                border: `2px solid ${isListening || isSpeaking ? agentColor : "rgba(255,255,255,0.1)"}`,
                boxShadow: isListening ? `0 0 40px ${agentColor}40` : "none",
              }}
            >
              {isProcessing ? (
                <Loader2 size={32} className="animate-spin" style={{ color: agentColor }} />
              ) : isListening ? (
                <Mic size={32} className="text-black animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 size={32} style={{ color: agentColor }} />
              ) : (
                <Mic size={32} style={{ color: agentColor }} />
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {isProcessing
              ? `${agentName} is thinking…`
              : isListening
              ? "Listening…"
              : isSpeaking
              ? `${agentName} is speaking`
              : "Tap to speak"}
          </p>

          {transcript && (
            <p className="mt-2 text-xs text-foreground/70 italic max-w-xs text-center">"{transcript}"</p>
          )}
        </div>

        {/* Conversation transcript */}
        <div
          ref={scrollRef}
          className="rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto"
          style={glassCard}
        >
          {responses.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-4">
              Tap the microphone to start a conversation with {agentName}
            </p>
          ) : (
            responses.map((r, i) => (
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
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {isMuted ? (
              <VolumeX size={16} className="text-muted-foreground" />
            ) : (
              <Volume2 size={16} style={{ color: agentColor }} />
            )}
          </button>

          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isSpeaking}
            className="p-4 rounded-full transition-all hover:scale-105"
            style={{
              background: isListening ? "#FF4D6A" : agentColor,
              color: "#0A0A14",
              boxShadow: `0 0 20px ${isListening ? "#FF4D6A40" : agentColor + "40"}`,
            }}
          >
            {isListening ? <PhoneOff size={20} /> : <Phone size={20} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Settings2 size={16} style={{ color: agentColor }} />
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="rounded-xl p-4 space-y-3" style={glassCard}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Voice Settings
            </p>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1.5">Voice style</label>
              <div className="flex gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.style}
                    onClick={() => setVoiceStyle(v.style)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      background: voiceStyle === v.style ? agentColor + "20" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${voiceStyle === v.style ? agentColor + "40" : "rgba(255,255,255,0.06)"}`,
                      color: voiceStyle === v.style ? agentColor : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {v.name} ({v.style})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-[8px] text-muted-foreground/50 text-center">
          Powered by ElevenLabs voice synthesis · Speech recognition via Web Speech API
        </p>
      </div>
    </div>
  );
};

export default VoiceAgentLive;
