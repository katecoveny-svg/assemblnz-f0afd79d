import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Sparkles, Download, Loader2, Image, Wand2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrandDna } from "@/contexts/BrandDnaContext";
import { motion, AnimatePresence } from "framer-motion";

const OBSIDIAN = "#0A0A0A";
const POUNAMU = "#00A86B";
const TEAL = "#00CED1";

export default function AuahaSpeechToImage() {
  const { session } = useAuth();
  const { brand } = useBrandDna();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const recognitionRef = useRef<any>(null);

  // Web Speech API
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-NZ";
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(final || interim);
    };

    recognition.onaudioprocess = () => {
      setPulseScale(1 + Math.random() * 0.3);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
    toast.success("Listening... describe your scene");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Pulse animation while listening
  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setPulseScale(1 + Math.random() * 0.4);
    }, 200);
    return () => clearInterval(interval);
  }, [isListening]);

  const generateImage = useCallback(async () => {
    if (!transcript.trim()) return toast.error("Describe a scene first");
    setIsGenerating(true);
    setImageUrl(null);

    try {
      // Enhance prompt with brand context
      let enhancedPrompt = transcript;
      if (brand) {
        enhancedPrompt += `\n\nBrand context: ${brand.businessName} (${brand.industry}). Style should align with brand colours: ${brand.colors.primary}, ${brand.colors.secondary}. Tone: ${brand.voiceTone}.`;
      }

      const { data, error } = await supabase.functions.invoke("stitch-generate", {
        body: {
          prompt: enhancedPrompt,
          aspectRatio: "16:9",
          style: "photographic",
        },
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        toast.success("Image generated from your voice prompt");
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [transcript, brand]);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-wide text-[#1A1D29]" style={{ fontFamily: "Lato, sans-serif" }}>
          Speech-to-Image Canvas
        </h1>
        <p className="text-[#6B7280] text-sm mt-1" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          Describe a scene with your voice — AUAHA NZ generates it instantly
        </p>
      </div>

      {/* Voice Capture */}
      <div className="relative rounded-2xl border overflow-hidden" style={{
        background: "linear-gradient(135deg, rgba(10,10,10,0.9), rgba(0,168,107,0.05))",
        borderColor: isListening ? `${POUNAMU}60` : "rgba(255,255,255,0.08)",
      }}>
        {/* Ambient glow when listening */}
        {isListening && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${POUNAMU}15 0%, transparent 70%)`,
          }} />
        )}

        <div className="relative p-8 flex flex-col items-center gap-6">
          {/* Mic Button */}
          <motion.button
            onClick={isListening ? stopListening : startListening}
            className="relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: isListening
                ? `radial-gradient(circle, ${POUNAMU}40, ${POUNAMU}15)`
                : "rgba(255,255,255,0.04)",
              border: `2px solid ${isListening ? POUNAMU : "rgba(255,255,255,0.1)"}`,
              boxShadow: isListening ? `0 0 60px ${POUNAMU}30, 0 0 120px ${POUNAMU}10` : "none",
            }}
            animate={{ scale: isListening ? pulseScale : 1 }}
            transition={{ duration: 0.15 }}
          >
            {isListening ? (
              <MicOff className="w-10 h-10" style={{ color: POUNAMU }} />
            ) : (
              <Mic className="w-10 h-10 text-[#6B7280]" />
            )}

            {/* Rings */}
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: `${POUNAMU}30` }}
                  animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: `${TEAL}20` }}
                  animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </motion.button>

          <p className="text-[#6B7280] text-sm">
            {isListening ? "Listening — speak naturally, then click to stop" : "Click the microphone to start"}
          </p>

          {/* Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl"
              >
                <div className="rounded-xl border p-4" style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-3.5 h-3.5" style={{ color: POUNAMU }} />
                    <span className="text-[11px] uppercase tracking-wider text-[#6B7280]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      Your prompt
                    </span>
                  </div>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full bg-transparent text-[#1A1D29] text-sm resize-none outline-none min-h-[60px]"
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brand context badge */}
          {brand && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]" style={{
              background: "rgba(0,168,107,0.1)",
              border: `1px solid ${POUNAMU}30`,
              color: POUNAMU,
            }}>
              <Wand2 className="w-3 h-3" />
              Brand DNA active: {brand.businessName}
            </div>
          )}

          {/* Generate */}
          <Button
            onClick={generateImage}
            disabled={!transcript.trim() || isGenerating}
            className="px-8 py-3 rounded-xl text-sm font-medium"
            style={{
              background: `linear-gradient(135deg, ${POUNAMU}, ${TEAL})`,
              color: OBSIDIAN,
              opacity: !transcript.trim() || isGenerating ? 0.5 : 1,
            }}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate Image</>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Image */}
      <AnimatePresence>
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="relative">
              <img src={imageUrl} alt="Generated from speech" className="w-full h-auto" >
              <div className="absolute bottom-4 right-4 flex gap-2">
                <a href={imageUrl} download className="p-2 rounded-lg backdrop-blur-xl" style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <Download className="w-4 h-4 text-foreground" />
                </a>
              </div>
            </div>
            <div className="p-4" style={{ background: "rgba(10,10,10,0.8)" }}>
              <p className="text-[#6B7280] text-xs italic">"{transcript}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested prompts from brand */}
      {brand && brand.suggestions.videoIdeas.length > 0 && !transcript && (
        <div className="space-y-3">
          <h3 className="text-[#6B7280] text-xs uppercase tracking-wider" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            Suggested scenes from Brand DNA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {brand.suggestions.videoIdeas.slice(0, 3).map((idea, i) => (
              <button
                key={i}
                onClick={() => setTranscript(idea)}
                className="text-left p-4 rounded-xl border transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <Image className="w-4 h-4 mb-2" style={{ color: TEAL }} />
                <p className="text-[#2A2F3D] text-sm">{idea}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
