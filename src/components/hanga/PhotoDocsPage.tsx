import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, MapPin, Clock, Brain, Grid, List, X, Sparkles } from "lucide-react";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

interface Photo {
  id: string; name: string; timestamp: string; location: string; aiAnalysis: string | null; thumbnail: string; analyzed: boolean;
}

const DEMO_PHOTOS: Photo[] = [
  { id: "1", name: "scaffold-level4-north.jpg", timestamp: "2 Apr 2026 09:15", location: "Level 4 North", aiAnalysis: "⚠️ Missing edge protection detected on north face. Scaffold tag expired (30 Mar). Recommend immediate inspection.", thumbnail: "📸", analyzed: true },
  { id: "2", name: "trench-services-B.jpg", timestamp: "2 Apr 2026 08:42", location: "Ground East", aiAnalysis: "⚠️ Trench depth exceeds 1.5m without visible shoring. NZS 4431 compliance concern. Workers observed without hard hats.", thumbnail: "📸", analyzed: true },
  { id: "3", name: "crane-exclusion-zone.jpg", timestamp: "1 Apr 2026 14:30", location: "Site Perimeter", aiAnalysis: "✅ Exclusion barriers in place. Signage visible. Spotter positioned correctly.", thumbnail: "📸", analyzed: true },
  { id: "4", name: "level2-slab-pour.jpg", timestamp: "1 Apr 2026 11:00", location: "Level 2 Central", aiAnalysis: "✅ Concrete pour proceeding as per methodology. PPE compliance observed. Vibrator in use.", thumbnail: "📸", analyzed: true },
];

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))",
    borderColor: "rgba(255,255,255,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  }}>{children}</div>
);

export default function PhotoDocsPage() {
  const [photos, setPhotos] = useState<Photo[]>(DEMO_PHOTOS);
  const [view, setView] = useState<"grid" | "timeline">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploading(true);
    const newPhoto: Photo = {
      id: Date.now().toString(), name: "new-upload.jpg", timestamp: new Date().toLocaleString(), location: "Pending GPS",
      aiAnalysis: null, thumbnail: "📷", analyzed: false,
    };
    setPhotos(p => [newPhoto, ...p]);
    setTimeout(() => {
      setPhotos(p => p.map(ph => ph.id === newPhoto.id ? { ...ph, aiAnalysis: "🔍 Analysis complete: No immediate hazards detected. Good housekeeping observed. PPE compliance confirmed.", analyzed: true } : ph));
      setUploading(false);
    }, 2500);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Camera size={22} style={{ color: KOWHAI }} /> Photo Documentation</h1>
          <p className="text-xs text-white/40">AI-Powered Hazard Detection — Whakaahua</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg ${view === "grid" ? "bg-white/10 text-white" : "text-white/30"}`}><Grid size={16} /></button>
          <button onClick={() => setView("timeline")} className={`p-2 rounded-lg ${view === "timeline" ? "bg-white/10 text-white" : "text-white/30"}`}><List size={16} /></button>
        </div>
      </motion.div>

      {/* Upload area */}
      <Glass className="p-8">
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-white/20"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {uploading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Brain size={40} style={{ color: KOWHAI }} className="mx-auto mb-3" />
            </motion.div>
          ) : (
            <Upload size={40} className="text-white/20 mx-auto mb-3" />
          )}
          <p className="text-sm text-white/50">{uploading ? "AI analyzing photo..." : "Drag & drop photos here or click to upload"}</p>
          <p className="text-[11px] text-white/25 mt-1">ĀRAI will automatically scan for hazards</p>
        </div>
      </Glass>

      {/* Photo gallery */}
      <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {photos.map((photo, i) => (
          <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <div onClick={() => setSelectedPhoto(photo)}><Glass className="overflow-hidden cursor-pointer hover:border-white/15 transition-all">
              <div className="h-40 flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, rgba(26,58,92,0.3), rgba(15,15,26,0.8))" }}>
                {photo.thumbnail}
              </div>
              <div className="p-4">
                <div className="text-xs text-white/70 font-medium truncate">{photo.name}</div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                  <span className="flex items-center gap-1"><Clock size={10} />{photo.timestamp}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{photo.location}</span>
                </div>
                {photo.analyzed && (
                  <div className="mt-2 flex items-center gap-1">
                    <Sparkles size={10} style={{ color: POUNAMU }} />
                    <span className="text-[10px]" style={{ color: POUNAMU }}>AI Analyzed</span>
                  </div>
                )}
                {!photo.analyzed && (
                  <div className="mt-2 flex items-center gap-1">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
                      <Brain size={10} style={{ color: KOWHAI }} />
                    </motion.div>
                    <span className="text-[10px]" style={{ color: KOWHAI }}>Analyzing...</span>
                  </div>
                )}
              </div>
            </Glass>
          </motion.div>
        ))}
      </div>

      {/* Photo detail modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPhoto(null)} />
            <motion.div className="fixed inset-4 sm:inset-10 z-50 flex items-center justify-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <Glass className="w-full max-w-lg p-6 relative">
                <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 text-white/30"><X size={18} /></button>
                <h3 className="text-sm font-semibold text-white mb-2">{selectedPhoto.name}</h3>
                <div className="flex items-center gap-3 text-[11px] text-white/30 mb-4">
                  <span className="flex items-center gap-1"><Clock size={10} />{selectedPhoto.timestamp}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{selectedPhoto.location}</span>
                </div>
                {selectedPhoto.aiAnalysis && (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(58,125,110,0.08)", border: "1px solid rgba(58,125,110,0.15)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} style={{ color: POUNAMU }} />
                      <span className="text-xs font-medium" style={{ color: POUNAMU }}>AI Analysis</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{selectedPhoto.aiAnalysis}</p>
                  </div>
                )}
              </Glass>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
