import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, MessageSquare, Smartphone, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import AgentAvatar from "@/components/AgentAvatar";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { useEffect, useState } from "react";
import { setDynamicManifest } from "@/utils/pwaManifest";

const TOROA_COLOR = "#3A7D6E";
const GOLD = "#D4A843";

export default function ToroaInstallPage() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setDynamicManifest("operations");
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setPlatform("ios");
    else if (/Android/.test(ua)) setPlatform("android");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (isStandalone) {
    // Already installed — redirect to app
    window.location.href = "/toroa/app";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: "#09090F", color: "white" }}>
      <SEO
        title="Get Tōroa — Your Family's Second Brain | Assembl"
        description="Install Tōroa on your phone. SMS-first whānau navigator built for NZ families. No app store needed."
      />
      <PWAInstallBanner agentName="TŌROA" agentColor={TOROA_COLOR} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <AgentAvatar agentId="operations" color={TOROA_COLOR} size={80} />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wider" style={{ color: TOROA_COLOR }}>TŌROA</h1>
            <p className="text-xs font-body mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Your family's second brain</p>
          </div>
        </div>

        {/* Install CTA */}
        {platform === "ios" ? (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Smartphone size={32} className="mx-auto" style={{ color: GOLD }} />
            <h2 className="font-display text-lg font-semibold">Add to Home Screen</h2>
            <div className="text-left space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              <div className="flex items-start gap-3">
                <span className="font-display font-bold shrink-0" style={{ color: TOROA_COLOR }}>1.</span>
                <span>Tap the <strong className="text-white/80">Share</strong> button (the square with an arrow) at the bottom of Safari</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-display font-bold shrink-0" style={{ color: TOROA_COLOR }}>2.</span>
                <span>Scroll down and tap <strong className="text-white/80">"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-display font-bold shrink-0" style={{ color: TOROA_COLOR }}>3.</span>
                <span>Tap <strong className="text-white/80">"Add"</strong> — Tōroa will appear on your home screen like a real app</span>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${TOROA_COLOR}, ${TOROA_COLOR}dd)`,
              color: "white",
              boxShadow: `0 8px 32px ${TOROA_COLOR}40`,
            }}
          >
            <Download size={22} /> Install Tōroa
          </button>
        ) : (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Smartphone size={32} className="mx-auto" style={{ color: GOLD }} />
            <h2 className="font-display text-lg font-semibold">Install Tōroa</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {platform === "android"
                ? 'Tap the menu (⋮) in Chrome and select "Add to Home screen"'
                : 'Use Chrome or Edge and click the install icon in the address bar'}
            </p>
          </div>
        )}

        {/* Or use now */}
        <div className="space-y-3">
          <Link
            to="/toroa/app"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-medium text-sm transition-all hover:scale-[1.02]"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${TOROA_COLOR}30`, color: TOROA_COLOR }}
          >
            <MessageSquare size={16} /> Use Tōroa in browser
            <ChevronRight size={14} className="ml-auto opacity-50" />
          </Link>
        </div>

        {/* Features teaser */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          {["🥘 Meal Plans", "💰 Benefits Check", "🏫 School Admin"].map((f) => (
            <div key={f} className="rounded-lg py-2 px-1 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          <span style={{ color: GOLD }}>$29/mo</span> · Built in Aotearoa · No app store needed
        </p>

        <Link to="/toroa" className="inline-flex items-center gap-1 text-xs transition hover:opacity-80" style={{ color: "rgba(255,255,255,0.25)" }}>
          Learn more about Tōroa <ChevronRight size={12} />
        </Link>
      </motion.div>
    </div>
  );
}
