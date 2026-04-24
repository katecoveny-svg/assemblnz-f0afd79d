import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, MapPin, Clock, Layers, Grid, List, X, Sparkles,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { AaaipGuardBadge, useAaaipGuard } from "@/aaaip";
import {
  MARAMA_WAIHANGA as M,
  MaramaShell,
  MaramaCard,
  MaramaBadge,
  MaramaButton,
  MaramaStat,
} from "./marama";

interface Photo {
  id: string;
  name: string;
  timestamp: string;
  location: string;
  aiAnalysis: string | null;
  thumbnail: string;
  analyzed: boolean;
  hazard?: "ok" | "warn" | "alert";
}

const DEMO_PHOTOS: Photo[] = [
  {
    id: "1",
    name: "scaffold-level4-north.jpg",
    timestamp: "2 Apr 2026 09:15",
    location: "Level 4 North",
    aiAnalysis:
      "Missing edge protection detected on the north face. Scaffold tag expired 30 March. Recommend immediate inspection before next lift.",
    thumbnail: "🏗️",
    analyzed: true,
    hazard: "alert",
  },
  {
    id: "2",
    name: "trench-services-B.jpg",
    timestamp: "2 Apr 2026 08:42",
    location: "Ground East",
    aiAnalysis:
      "Trench depth exceeds 1.5 m without visible shoring. NZS 4431 compliance concern. Two workers observed without hard hats.",
    thumbnail: "🚧",
    analyzed: true,
    hazard: "warn",
  },
  {
    id: "3",
    name: "crane-exclusion-zone.jpg",
    timestamp: "1 Apr 2026 14:30",
    location: "Site perimeter",
    aiAnalysis:
      "Exclusion barriers in place. Signage visible and legible. Spotter positioned correctly per lift plan.",
    thumbnail: "🛠️",
    analyzed: true,
    hazard: "ok",
  },
  {
    id: "4",
    name: "level2-slab-pour.jpg",
    timestamp: "1 Apr 2026 11:00",
    location: "Level 2 Central",
    aiAnalysis:
      "Concrete pour proceeding as per methodology. PPE compliance observed across the crew. Vibrator in use.",
    thumbnail: "🧱",
    analyzed: true,
    hazard: "ok",
  },
];

const hazardTone = (h?: Photo["hazard"]) => {
  if (h === "alert") return "alert" as const;
  if (h === "warn") return "warn" as const;
  return "ok" as const;
};

const hazardLabel = (h?: Photo["hazard"]) =>
  h === "alert" ? "Action required" : h === "warn" ? "Review" : "Clear";

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
      const decision = guard.check({
        kind: "upload_photo",
        payload: { containsWorkers: true, workerConsent },
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
        timestamp: new Date().toLocaleString("en-NZ"),
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
                    "Analysis complete. No immediate hazards detected. Good housekeeping observed. PPE compliance confirmed.",
                  analyzed: true,
                  hazard: "ok",
                }
              : ph,
          ),
        );
        setUploading(false);
      }, 2500);
    },
    [guard, workerConsent],
  );

  const counts = {
    total: photos.length,
    flagged: photos.filter((p) => p.hazard === "alert" || p.hazard === "warn").length,
    cleared: photos.filter((p) => p.hazard === "ok").length,
    pending: photos.filter((p) => !p.analyzed).length,
  };

  return (
    <MaramaShell
      eyebrow="WAIHANGA · Whakaahua"
      title="Photo documentation"
      titleMi="Whakaahua"
      description="Drop site photos here. ĀRAI scans each frame for hazards, PPE compliance and overdue scaffold tags before they reach the project record."
      icon={<Camera size={22} />}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <label
            className="flex items-center gap-2 text-[11px] cursor-pointer"
            style={{ color: M.textSecondary }}
          >
            <input
              type="checkbox"
              checked={workerConsent}
              onChange={(e) => setWorkerConsent(e.target.checked)}
              className="h-3.5 w-3.5 rounded"
              style={{ accentColor: M.accentDeep }}
            />
            Crew photo consent on file
          </label>
          <AaaipGuardBadge
            domain="waihanga"
            accentColor={M.accentDeep}
            subtitle="Worker consent required"
          />
          <div
            className="flex gap-1 rounded-full p-1"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${M.borderSoft}`,
            }}
          >
            <button
              onClick={() => setView("grid")}
              className="p-1.5 rounded-full transition-colors"
              style={{
                background: view === "grid" ? M.accentSoft : "transparent",
                color: view === "grid" ? M.accentDeep : M.textSecondary,
              }}
              aria-label="Grid view"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setView("timeline")}
              className="p-1.5 rounded-full transition-colors"
              style={{
                background: view === "timeline" ? M.accentSoft : "transparent",
                color: view === "timeline" ? M.accentDeep : M.textSecondary,
              }}
              aria-label="Timeline view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MaramaStat
          index={0}
          label="Total photos"
          value={counts.total}
          icon={<Camera size={16} />}
        />
        <MaramaStat
          index={1}
          label="Flagged"
          value={counts.flagged}
          delta="Needs review"
          deltaTone="warn"
          icon={<AlertTriangle size={16} />}
        />
        <MaramaStat
          index={2}
          label="Cleared"
          value={counts.cleared}
          delta="No hazards"
          deltaTone="ok"
          icon={<CheckCircle2 size={16} />}
        />
        <MaramaStat
          index={3}
          label="Awaiting analysis"
          value={counts.pending}
          icon={<Layers size={16} />}
        />
      </div>

      {/* Upload area */}
      <MaramaCard padding="lg">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-2xl px-8 py-10 text-center cursor-pointer transition-all"
          style={{
            background: "rgba(238,231,222,0.4)",
            border: `1.5px dashed ${M.accentRing}`,
          }}
        >
          {uploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Layers
                size={36}
                style={{ color: M.accentDeep }}
                className="mx-auto mb-3"
              />
            </motion.div>
          ) : (
            <Upload
              size={36}
              style={{ color: M.accentDeep }}
              className="mx-auto mb-3"
            />
          )}
          <p
            className="font-display text-lg font-light"
            style={{ color: M.textPrimary }}
          >
            {uploading
              ? "ĀRAI is analysing the photo…"
              : "Drag and drop photos here"}
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: M.textSecondary }}
          >
            Or click to browse — ĀRAI scans automatically for site hazards.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <MaramaButton size="sm" variant="primary" icon={<Upload size={14} />}>
              Choose photos
            </MaramaButton>
          </div>
        </div>
      </MaramaCard>

      {/* Photo gallery */}
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-3"
        }
      >
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedPhoto(photo)}
            className="cursor-pointer"
          >
            <MaramaCard padding="sm" className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="rounded-2xl h-40 flex items-center justify-center text-5xl"
                style={{
                  background: `linear-gradient(135deg, ${M.accentSoft}, rgba(255,255,255,0.6))`,
                  border: `1px solid ${M.borderSoft}`,
                }}
              >
                {photo.thumbnail}
              </div>
              <div className="pt-3">
                <div
                  className="text-xs font-medium truncate font-mono"
                  style={{ color: M.textPrimary }}
                >
                  {photo.name}
                </div>
                <div
                  className="flex items-center flex-wrap gap-3 mt-2 text-[10px]"
                  style={{ color: M.textMuted }}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {photo.timestamp}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {photo.location}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {photo.analyzed ? (
                    <MaramaBadge tone={hazardTone(photo.hazard)} size="sm" icon={<Sparkles size={10} />}>
                      {hazardLabel(photo.hazard)}
                    </MaramaBadge>
                  ) : (
                    <MaramaBadge tone="info" size="sm">
                      Analysing…
                    </MaramaBadge>
                  )}
                </div>
              </div>
            </MaramaCard>
          </motion.div>
        ))}
      </div>

      {/* Photo detail modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <>
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: "rgba(111,97,88,0.35)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
            />
            <motion.div
              className="fixed inset-4 sm:inset-10 z-50 flex items-center justify-center pointer-events-none"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            >
              <div className="w-full max-w-lg pointer-events-auto">
                <MaramaCard
                  tone="raised"
                  padding="lg"
                  className="relative"
                  title={selectedPhoto.name}
                  eyebrow="Site photo"
                  actions={
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="p-1.5 rounded-full"
                      style={{ color: M.textSecondary }}
                    >
                      <X size={16} />
                    </button>
                  }
                >
                  <div
                    className="rounded-2xl h-48 flex items-center justify-center text-6xl mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${M.accentSoft}, rgba(255,255,255,0.7))`,
                      border: `1px solid ${M.borderSoft}`,
                    }}
                  >
                    {selectedPhoto.thumbnail}
                  </div>
                  <div
                    className="flex items-center gap-3 text-[11px] mb-4"
                    style={{ color: M.textSecondary }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {selectedPhoto.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {selectedPhoto.location}
                    </span>
                    {selectedPhoto.analyzed && (
                      <MaramaBadge tone={hazardTone(selectedPhoto.hazard)} size="sm">
                        {hazardLabel(selectedPhoto.hazard)}
                      </MaramaBadge>
                    )}
                  </div>
                  {selectedPhoto.aiAnalysis && (
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: M.accentSoft,
                        border: `1px solid ${M.borderSoft}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} style={{ color: M.accentDeep }} />
                        <span
                          className="text-xs font-medium"
                          style={{ color: M.accentDeep }}
                        >
                          ĀRAI analysis
                        </span>
                      </div>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: M.textPrimary }}
                      >
                        {selectedPhoto.aiAnalysis}
                      </p>
                    </div>
                  )}
                </MaramaCard>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MaramaShell>
  );
}
