import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

interface PWAInstallBannerProps {
  agentName: string;
  agentColor: string;
}

const PWAInstallBanner = ({ agentName, agentColor }: PWAInstallBannerProps) => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show inside iframes (Lovable preview)
    try { if (window.self !== window.top) return; } catch { return; }

    // Check if dismissed recently
    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
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
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-xs font-body shrink-0"
      style={{
        background: `${agentColor}12`,
        borderBottom: `1px solid ${agentColor}20`,
      }}
    >
      {isIOS ? <Share size={14} style={{ color: agentColor }} /> : <Download size={14} style={{ color: agentColor }} />}
      <p className="flex-1 text-white/60">
        {isIOS ? (
          <>Tap <strong className="text-white/80">Share</strong> then <strong className="text-white/80">Add to Home Screen</strong> to install {agentName}</>
        ) : (
          <>Install <strong style={{ color: agentColor }}>{agentName}</strong> as an app for quick access</>
        )}
      </p>
      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="px-3 py-1 rounded-lg text-[10px] font-bold font-display transition"
          style={{ background: agentColor, color: "#3D3428" }}
        >
          Install
        </button>
      )}
      <button onClick={handleDismiss} className="p-1 rounded hover:bg-white/5 transition">
        <X size={12} className="text-gray-400" />
      </button>
    </div>
  );
};

export default PWAInstallBanner;
