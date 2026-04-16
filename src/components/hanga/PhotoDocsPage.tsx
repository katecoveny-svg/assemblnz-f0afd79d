import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, MapPin, Clock, Layers, Grid, List, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AaaipGuardBadge, useAaaipGuard } from "@/aaaip";

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
    background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
    borderColor: "rgba(255,255,255,0.5)", boxShadow: "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
  }}>{children}</div>
);

export default function PhotoDocsPage() {
  const [photos, setPhotos] = useState<Photo[]>(DEMO_PHOTOS);
  const [view, setView] = useState<"grid" | "timeline">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [workerConsent, setWorkerConsent] = useState(true);
  const guard = useAaaipGuard("waihanga");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      // Most site photos contain identifiable workers. The AAAIP
      // worker-consent policy gates uploads unless the crew's
      // consent has been recorded.
      const decision = guard.check({
        kind: "upload_photo",
        payload: {
          containsWorkers: true,
          workerConsent,
        },
        world: {},
        rationale: "Upload site photo via drag-and-drop",
      });
      if (decision.blocked) {
        toast.error("Photo upload blocked", { description: decision.explanation });
        return;
      }
      if (decision.requiresHuman) {
        toast.warning("Consent review needed", { description: decision.explanation });
        return;
      }
      setUploading(true);
      const newPhoto: Photo = {
        id: Date.now().toString(),
        name: "new-upload.jpg",
        timestamp: new Date().toLocaleString(),
        location: "Pending GPS",
        aiAnalysis: null,
        thumbnail: "📷",
        analyzed: false,
      };
      setPhotos((p) => [newPhoto, ...p]);
      setTimeout(() => {
        setPhotos((p) =>
          p.map((ph) =>
            ph.id === newPhoto.id
              ? {
                  ...ph,
                  aiAnalysis:
                    "🔍 Analysis complete: No immediate hazards detected. Good housekeeping observed. PPE compliance confirmed.",
                  analyzed: true,
                }
              : ph,
          ),
        );
        setUploading(false);
      }, 2500);
    },
    [guard, workerConsent],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Camera size={22} style={{ color: KOWHAI }} /> Photo Documentation</h1>
          <p className="text-xs text-[#9CA3AF]">AI-Powered Hazard Detection — Whakaahua</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <input
              type="checkbox"
              checked={workerConsent}
              onChange={(e) => setWorkerConsent(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300"
            />
            Crew photo consent on file
          </label>
          <AaaipGuardBadge domain="waihanga" accentColor={POUNAMU} subtitle="Worker consent required" />
          <div className="flex gap-1">
            <button onClick={() => setView("grid")} className={`p-2 rounded-lg ${view === "grid" ? "bg-white/10 text-foreground" : "text-gray-400"}`}><Grid size={16} /></button>
            <button onClick={() => setView("timeline")} className={`p-2 rounded-lg ${view === "timeline" ? "bg-white/10 text-foreground" : "text-gray-400"}`}><List size={16} /></button>
          </div>
        </div>
      </motion.div>

      {/* Upload area */}
      <Glass className="p-8">
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-gray-300"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {uploading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Layers size={40} style={{ color: KOWHAI }} className="mx-auto mb-3" />
            </motion.div>
          ) : (
            <Upload size={40} className="text-[#9CA3AF] mx-auto mb-3" />
          )}
          <p className="text-sm text-gray-500">{uploading ? "AI analyzing photo..." : "Drag & drop photos here or click to upload"}</p>
          <p className="text-[11px] text-white/25 mt-1">ĀRAI will automatically scan for hazards</p>
        </div>
      </Glass>

      {/* Photo gallery */}
      <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {photos.map((photo, i) => (
          <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <div onClick={() => setSelectedPhoto(photo)}><Glass className="overflow-hidden cursor-pointer hover:border-white/15 transition-all">
              <div className="h-40 flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, rgba(26,58,92,0.3), rgba(255,255,255,0.65))" }}>
                {photo.thumbnail}
              </div>
              <div className="p-4">
                <div className="text-xs text-[#3D4250] font-medium truncate">{photo.name}</div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
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
                      <Layers size={10} style={{ color: KOWHAI }} />
                    </motion.div>
                    <span className="text-[10px]" style={{ color: KOWHAI }}>Analyzing...</span>
                  </div>
                )}
              </div>
            </Glass>
            </div>
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
                <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 text-gray-400"><X size={18} /></button>
                <h3 className="text-sm font-semibold text-foreground mb-2">{selectedPhoto.name}</h3>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock size={10} />{selectedPhoto.timestamp}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{selectedPhoto.location}</span>
                </div>
                {selectedPhoto.aiAnalysis && (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(58,125,110,0.08)", border: "1px solid rgba(58,125,110,0.15)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} style={{ color: POUNAMU }} />
                      <span className="text-xs font-medium" style={{ color: POUNAMU }}>AI Analysis</span>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">{selectedPhoto.aiAnalysis}</p>
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
