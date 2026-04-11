import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

const WineGlass3D = lazy(() => import("@/components/kete/models/WineGlass3D"));
const HardHat3D = lazy(() => import("@/components/kete/models/HardHat3D"));
const Palette3D = lazy(() => import("@/components/kete/models/Palette3D"));
const CarSilhouette3D = lazy(() => import("@/components/kete/models/CarSilhouette3D"));
const Container3D = lazy(() => import("@/components/kete/models/Container3D"));

export type IndustryModel = "wine-glass" | "hard-hat" | "palette" | "car" | "container";

interface LandingKeteHeroProps {
  accentColor: string;
  accentLight: string;
  model: IndustryModel;
  size?: number;
}

const MODEL_MAP: Record<IndustryModel, React.LazyExoticComponent<React.FC<{ accentColor: string; accentLight: string; size?: number }>>> = {
  "wine-glass": WineGlass3D,
  "hard-hat": HardHat3D,
  "palette": Palette3D,
  "car": CarSilhouette3D,
  "container": Container3D,
};

export default function LandingKeteHero({
  accentColor,
  accentLight,
  model,
  size = 180,
}: LandingKeteHeroProps) {
  const ModelComponent = MODEL_MAP[model];

  return (
    <motion.div
      className="relative flex items-center justify-center mb-10"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.6,
          height: size * 1.6,
          background: `radial-gradient(circle, ${accentColor}18 0%, ${accentColor}08 40%, transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          border: `1px solid ${accentColor}20`,
          boxShadow: `0 0 40px ${accentColor}12, inset 0 0 30px ${accentColor}08`,
        }}
      />
      <Suspense
        fallback={
          <div
            className="rounded-full animate-pulse"
            style={{ width: size, height: size, background: `${accentColor}10` }}
          />
        }
      >
        <ModelComponent accentColor={accentColor} accentLight={accentLight} size={size} />
      </Suspense>
    </motion.div>
  );
}
