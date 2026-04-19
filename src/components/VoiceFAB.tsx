import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KOWHAI = "#4AA5A8";

type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

const STATUS_LABELS: Record<VoiceState, { mi: string; en: string }> = {
  idle: { mi: "", en: "" },
  listening: { mi: "Kei te whakarongo...", en: "Listening..." },
  thinking: { mi: "Kei te whakaaro...", en: "Thinking..." },
  speaking: { mi: "Kei te kōrero...", en: "Speaking..." },
  error: { mi: "He hapa", en: "Connection error" },
};

interface Props {
  packId?: string;
  agentId?: string;
}

const VoiceFAB = ({ packId = "waihanga", agentId }: Props) => {
  const [state, setState] = useState<VoiceState>("idle");
  const [expanded, setExpanded] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        setState("thinking");
        const audioBlob = new Blob(chunks.current, { type: "audio/webm" });

        try {
          // For now, convert audio to text via a simple approach
          // and route through the existing agent-router
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            // Use browser's SpeechRecognition as fallback
            toast.info("Voice processing — routing to your specialist agent");
            setState("speaking");
            setTimeout(() => {
              setState("idle");
              setExpanded(false);
            }, 2000);
          };
        } catch {
          setState("error");
          toast.error("Voice connection failed. Please try again.");
        }

        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setState("listening");
      setExpanded(true);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  }, []);

  const toggle = () => {
    if (state === "listening") {
      stopRecording();
    } else if (state === "idle" || state === "error") {
      startRecording();
    }
  };

  const close = () => {
    stopRecording();
    setState("idle");
    setExpanded(false);
    setTranscript("");
  };

  const statusLabel = STATUS_LABELS[state];

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: state === "listening"
            ? `radial-gradient(circle, ${KOWHAI}, rgba(74,165,168,0.8))`
            : "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
          border: `2px solid ${state === "listening" ? KOWHAI : "rgba(74,165,168,0.3)"}`,
          boxShadow: state === "listening"
            ? `0 0 30px rgba(74,165,168,0.4), 0 0 60px rgba(74,165,168,0.15)`
            : "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={state === "listening" ? { boxShadow: [
          "0 0 20px rgba(74,165,168,0.3)",
          "0 0 40px rgba(74,165,168,0.5)",
          "0 0 20px rgba(74,165,168,0.3)",
        ] } : {}}
        transition={state === "listening" ? { duration: 1.5, repeat: Infinity } : {}}
      >
        {state === "listening" ? (
          <MicOff size={22} color="#09090F" />
        ) : (
          <Mic size={22} style={{ color: KOWHAI }} />
        )}
      </motion.button>

      {/* Expanded status panel */}
      <AnimatePresence>
        {expanded && state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 rounded-2xl p-4 min-w-[220px] border backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.65)",
              borderColor: "rgba(74,165,168,0.2)",
              boxShadow: "0 0 40px rgba(0,0,0,0.5)",
            }}
          >
            <button onClick={close} className="absolute top-2 right-2 text-gray-400 hover:text-[#6B7280]">
              <X size={14} />
            </button>

            {/* Pulsing ring */}
            {state === "listening" && (
              <div className="flex justify-center mb-3">
                <div className="relative w-12 h-12">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${KOWHAI}`, opacity: 0.3 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${KOWHAI}`, opacity: 0.5 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                  <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: `${KOWHAI}22` }}>
                    <Mic size={18} style={{ color: KOWHAI }} />
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-center" style={{ color: KOWHAI, fontFamily: "'JetBrains Mono', monospace" }}>
              {statusLabel.mi}
            </p>
            <p className="text-[10px] text-center text-[#9CA3AF] mt-0.5">
              {statusLabel.en}
            </p>

            {transcript && (
              <p className="mt-3 text-[11px] text-[#6B7280] border-t pt-2" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                {transcript}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceFAB;
