import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const KETE_MESSAGES: Record<string, { mi: string; en: string; wananga: string }> = {
  hanga: {
    mi: "Nau mai ki te Kete Hanga",
    en: "Welcome to your Construction Intelligence Kete. Like the kete woven from harakeke, this brings together all the knowledge your building business needs in one place.",
    wananga: "Te Kete Tuauri — the basket of the physical world",
  },
  manaaki: {
    mi: "Nau mai ki te Kete Manaaki",
    en: "Welcome to your Hospitality Intelligence Kete. Drawn from Te Kete Aronui, the basket of love and care for people.",
    wananga: "Te Kete Aronui — the basket of goodness and humanity",
  },
  pakihi: {
    mi: "Nau mai ki te Kete Pakihi",
    en: "Welcome to your Business Intelligence Kete. Drawn from Te Kete Tuatea, the basket of strategy and governance.",
    wananga: "Te Kete Tuatea — the basket of strategy and governance",
  },
  auaha: {
    mi: "Nau mai ki te Kete Auaha",
    en: "Welcome to your Creative Intelligence Kete. Drawn from Te Kete Aronui, the basket of human expression.",
    wananga: "Te Kete Aronui — the basket of goodness and humanity",
  },
  hangarau: {
    mi: "Nau mai ki te Kete Hangarau",
    en: "Welcome to your Technology Intelligence Kete. Drawn from Te Kete Tuauri, the basket of systems and the natural world.",
    wananga: "Te Kete Tuauri — the basket of systems and nature",
  },
};

interface Props {
  packId: string;
}

const KeteOnboardingCard = ({ packId }: Props) => {
  const storageKey = `kete_onboarding_${packId}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === "1");

  const msg = KETE_MESSAGES[packId];
  if (!msg || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, "1");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative rounded-2xl p-6 mb-6 border overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(74,165,168,0.08), rgba(58,125,110,0.06))",
          borderColor: "rgba(74,165,168,0.2)",
          boxShadow: "0 0 40px rgba(74,165,168,0.06)",
        }}
      >
        {/* Harakeke weave pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 12px,
              rgba(74,165,168,0.04) 12px,
              rgba(74,165,168,0.04) 13px
            ), repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 12px,
              rgba(74,165,168,0.04) 12px,
              rgba(74,165,168,0.04) 13px
            )`,
          }}
        />

        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white/60 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <p
          className="text-lg font-light mb-2 relative z-10"
          style={{ fontFamily: "'Inter', sans-serif", color: "#4AA5A8" }}
        >
          {msg.mi}
        </p>
        <p
          className="text-sm leading-relaxed mb-3 relative z-10"
          style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.65)" }}
        >
          {msg.en}
        </p>
        <p
          className="text-[11px] font-mono tracking-wider relative z-10"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "rgba(74,165,168,0.45)" }}
        >
          {msg.wananga}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default KeteOnboardingCard;
