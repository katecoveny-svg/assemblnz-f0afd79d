import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, BookOpen, Languages, Layers, CheckCircle, XCircle, ChevronDown, ChevronRight, ExternalLink, Music, Shapes, Type, Microscope, CookingPot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VocabItem {
  maori: string;
  english: string;
  usage: string;
  pronunciation: string;
}

interface SentenceItem {
  english: string;
  maori: string;
  notes: string;
}

interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LearningData {
  videoTitle: string;
  summary: string;
  vocabulary: VocabItem[];
  sentences: SentenceItem[];
  quiz: QuizItem[];
  culturalContext: string;
}

interface Props {
  agentColor: string;
  onSendToChat?: (message: string) => void;
}

const TeReoVideoLearner = ({ agentColor, onSendToChat }: Props) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LearningData | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"vocab" | "sentences" | "quiz">("vocab");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [revealedVocab, setRevealedVocab] = useState<Set<number>>(new Set());

  const EXAMPLES = [
    { id: "JfD0nHrJDC0", title: "How chords work", icon: Music, accent: "#4AA5A8" },
    { id: "WFtTdf3I6Ug", title: "Understanding fractals", icon: Shapes, accent: "#3A7D6E" },
    { id: "U0EySK4T2aY", title: "Logic behind Chinese characters", icon: Type, accent: "#4AA5A8" },
    { id: "f-ldPgEfAHI", title: "Magical mitosis", icon: Microscope, accent: "#3A7D6E" },
    { id: "hfCwwG8Ats0", title: "The craft of the casserole", icon: CookingPot, accent: "#4AA5A8" },
  ];

  const handleGenerate = async (inputUrl?: string) => {
    const targetUrl = inputUrl || url;
    if (!targetUrl) return;
    setLoading(true);
    setError(null);
    setData(null);
    setQuizAnswers({});
    setRevealedVocab(new Set());
    setActiveSection("vocab");

    // Extract video ID for embed
    const idMatch = targetUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|^)([a-zA-Z0-9_-]{11})/);
    if (idMatch) setVideoId(idMatch[1]);

    try {
      const { data: resp, error: err } = await supabase.functions.invoke("te-reo-video-learn", {
        body: { url: targetUrl },
      });
      if (err) throw new Error(err.message);
      if (!resp?.success) throw new Error(resp?.error || "Failed to generate");
      setData(resp.data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleVocab = (idx: number) => {
    setRevealedVocab(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const selectQuizAnswer = (qIdx: number, aIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  };

  const quizScore = data?.quiz
    ? Object.entries(quizAnswers).filter(([qi, ai]) => data.quiz[Number(qi)]?.correctIndex === ai).length
    : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#FAFBFC" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} style={{ color: agentColor }} />
          <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "3px", color: agentColor }}>
            MĀRAMA
          </span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>
            Te Reo Māori Video Learning
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste a YouTube URL..."
            className="flex-1 px-3 py-2 rounded-lg text-xs"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.5)",
              color: "#1A1D29",
              outline: "none",
            }}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading || !url}
            className="px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              background: loading ? "rgba(255,255,255,0.5)" : agentColor,
              color: loading ? "rgba(255,255,255,0.35)" : "#09090F",
              border: `1px solid ${agentColor}`,
              opacity: !url ? 0.5 : 1,
            }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            {loading ? "Generating..." : "Learn"}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Examples when no data */}
        {!data && !loading && !error && (
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>
              Or try an example:
            </p>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXAMPLES.map(ex => {
                const Icon = ex.icon;
                return (
                  <button
                    key={ex.id}
                    onClick={() => { setUrl(`https://www.youtube.com/watch?v=${ex.id}`); handleGenerate(`https://www.youtube.com/watch?v=${ex.id}`); }}
                    className="rounded-xl text-left group transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: `${ex.accent}08`, border: `1px solid ${ex.accent}18` }}
                  >
                    <div className="flex flex-col items-center justify-center h-20 gap-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${ex.accent}15` }}>
                        <Icon size={18} style={{ color: ex.accent }} />
                      </div>
                      <div className="w-5 h-0.5 rounded-full" style={{ background: `${ex.accent}30` }} />
                    </div>
                    <p className="px-3 pb-2.5 text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: ex.accent, fontWeight: 500 }}>
                      {ex.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: agentColor }} />
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
              Generating te reo Māori exercises...
            </p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
              This usually takes 15-30 seconds
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg p-4" style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.2)" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px", color: "#E05050" }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {data && (
          <>
            {/* Video embed */}
            {videoId && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.5)" }}>
                <div className="relative" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
              <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "16px", color: "#1A1D29", marginBottom: "6px" }}>
                {data.videoTitle}
              </h3>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                {data.summary}
              </p>
              {data.culturalContext && (
                <p className="mt-2 pt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px", color: agentColor, lineHeight: 1.5, borderTop: "1px solid rgba(255,255,255,0.5)" }}>
                  {data.culturalContext}
                </p>
              )}
            </div>

            {/* Section tabs */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
              {([
                { id: "vocab" as const, label: "Kupu (Vocab)", icon: Languages, count: data.vocabulary?.length },
                { id: "sentences" as const, label: "Rerenga (Sentences)", icon: BookOpen, count: data.sentences?.length },
                { id: "quiz" as const, label: "Pātai (Quiz)", icon: Layers, count: data.quiz?.length },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[10px] transition-all"
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: activeSection === tab.id ? 700 : 400,
                    letterSpacing: "1px",
                    background: activeSection === tab.id ? agentColor + "15" : "transparent",
                    color: activeSection === tab.id ? agentColor : "rgba(255,255,255,0.4)",
                    border: activeSection === tab.id ? `1px solid ${agentColor}30` : "1px solid transparent",
                  }}
                >
                  <tab.icon size={11} />
                  {tab.label}
                  {tab.count && <span className="opacity-50">({tab.count})</span>}
                </button>
              ))}
            </div>

            {/* VOCABULARY */}
            {activeSection === "vocab" && (
              <div className="space-y-2">
                {data.vocabulary?.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-xl overflow-hidden cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}
                    onClick={() => toggleVocab(i)}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "14px", color: agentColor }}>
                          {v.maori}
                        </span>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                          {revealedVocab.has(i) ? v.english : "tap to reveal"}
                        </span>
                      </div>
                      {revealedVocab.has(i) ? <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.2)" }} /> : <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)" }} />}
                    </div>
                    <AnimatePresence>
                      {revealedVocab.has(i) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
                            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "8px" }}>
                              /{v.pronunciation}/
                            </p>
                            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.5)", fontStyle: "italic", lineHeight: 1.5 }}>
                              "{v.usage}"
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* SENTENCES */}
            {activeSection === "sentences" && (
              <div className="space-y-3">
                {data.sentences?.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}
                  >
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "#1A1D29", marginBottom: "6px" }}>
                      {s.english}
                    </p>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "13px", color: agentColor, marginBottom: "4px" }}>
                      → {s.maori}
                    </p>
                    {s.notes && (
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                        {s.notes}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* QUIZ */}
            {activeSection === "quiz" && (
              <div className="space-y-4">
                {data.quiz?.map((q, qi) => {
                  const answered = quizAnswers[qi] !== undefined;
                  const correct = answered && quizAnswers[qi] === q.correctIndex;
                  return (
                    <motion.div
                      key={qi}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: qi * 0.05 }}
                      className="rounded-xl p-4"
                      style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${answered ? (correct ? "rgba(58,125,110,0.3)" : "rgba(220,50,50,0.2)") : "rgba(255,255,255,0.5)"}` }}
                    >
                      <p className="mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "#1A1D29" }}>
                        {qi + 1}. {q.question}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const isSelected = quizAnswers[qi] === oi;
                          const isCorrectOption = oi === q.correctIndex;
                          const showResult = answered;
                          return (
                            <button
                              key={oi}
                              onClick={() => !answered && selectQuizAnswer(qi, oi)}
                              disabled={answered}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2"
                              style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                background: showResult && isCorrectOption ? "rgba(58,125,110,0.15)"
                                  : showResult && isSelected && !isCorrectOption ? "rgba(220,50,50,0.1)"
                                  : "rgba(255,255,255,0.5)",
                                border: `1px solid ${showResult && isCorrectOption ? "rgba(58,125,110,0.3)"
                                  : showResult && isSelected && !isCorrectOption ? "rgba(220,50,50,0.2)"
                                  : isSelected ? agentColor + "40" : "rgba(255,255,255,0.5)"}`,
                                color: showResult && isCorrectOption ? "#3A7D6E"
                                  : showResult && isSelected && !isCorrectOption ? "#E05050"
                                  : "rgba(255,255,255,0.65)",
                                cursor: answered ? "default" : "pointer",
                              }}
                            >
                              {showResult && isCorrectOption && <CheckCircle size={12} className="shrink-0" />}
                              {showResult && isSelected && !isCorrectOption && <XCircle size={12} className="shrink-0" />}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {answered && (
                        <p className="mt-2 pt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, borderTop: "1px solid rgba(255,255,255,0.5)" }}>
                          {q.explanation}
                        </p>
                      )}
                    </motion.div>
                  );
                })}

                {/* Score */}
                {data.quiz && Object.keys(quizAnswers).length === data.quiz.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl p-5 text-center"
                    style={{ background: `${agentColor}10`, border: `1px solid ${agentColor}30` }}
                  >
                    <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "24px", color: agentColor }}>
                      {quizScore}/{data.quiz.length}
                    </p>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                      {quizScore === data.quiz.length ? "Ka rawe! Perfect score!" : quizScore >= data.quiz.length / 2 ? "Ka pai! Good effort!" : "Kia kaha! Keep practising!"}
                    </p>
                    {onSendToChat && (
                      <button
                        onClick={() => onSendToChat(`I just completed a te reo Māori exercise based on "${data.videoTitle}" and scored ${quizScore}/${data.quiz!.length}. Can you help me practise the words I got wrong?`)}
                        className="mt-3 px-4 py-2 rounded-lg text-xs transition-all"
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          background: agentColor + "20",
                          border: `1px solid ${agentColor}30`,
                          color: agentColor,
                        }}
                      >
                        Practise with {onSendToChat ? "chat" : "agent"} →
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeReoVideoLearner;
