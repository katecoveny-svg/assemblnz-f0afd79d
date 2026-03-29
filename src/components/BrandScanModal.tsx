import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { X, Globe, Loader2, Instagram, Linkedin, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BrandDna {
  business_name: string;
  industry: string;
  target_audience: string;
  key_products: string[];
  usps: string[];
  visual_identity: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_preference: string;
    photography_style: string;
    visual_aesthetic: string;
  };
  typography: {
    heading_style: string;
    heading_font: string;
    body_style: string;
    body_font: string;
    text_density: string;
  };
  voice_tone: {
    formality: number;
    personality_traits: string[];
    sentence_style: string;
    emoji_usage: string;
    jargon_level: string;
    cta_style: string;
  };
  brand_summary: string;
  brand_score: number;
}

interface Props {
  agentName: string;
  agentColor: string;
  open: boolean;
  onClose: () => void;
  onBrandLoaded: (profile: string, businessName: string, brandDna?: BrandDna) => void;
}

const BrandScanModal = ({ agentName, agentColor, open, onClose, onBrandLoaded }: Props) => {
  const [url, setUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExtras, setShowExtras] = useState(false);

  if (!open) return null;

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");

    try {
      const fallbackContent = typeof document !== "undefined"
        ? document.body?.innerText?.slice(0, 30000) || ""
        : "";

      const { data, error: fnError } = await supabase.functions.invoke("scan-website", {
        body: {
          url: url.trim(),
          instagram: instagram.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          fallbackContent,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const profile = data.brandProfile as string;
      const brandDna = data.brandDna as BrandDna | undefined;
      const businessName = brandDna?.business_name || new URL(url.startsWith("http") ? url : `https://${url}`).hostname;

      onBrandLoaded(profile, businessName, brandDna);
      onClose();
    } catch (err) {
      if (err instanceof FunctionsHttpError) {
        try {
          const errorBody = await err.context.json();
          setError(errorBody?.error || "Failed to scan website");
          return;
        } catch {
          setError("Failed to scan website");
          return;
        }
      }

      setError(err instanceof Error ? err.message : "Failed to scan website");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ background: "#0D0D14", borderColor: agentColor + "25" }}
      >
        <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Globe size={20} style={{ color: agentColor }} />
          <h3 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>
            Let {agentName} learn your brand
          </h3>
        </div>

        <p className="text-[11px] font-jakarta mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          Enter your website URL. {agentName} scans it and builds your Brand DNA — colours, fonts, tone, imagery style — so every piece of content matches your brand automatically.
        </p>

        <div className="space-y-3">
          {/* Website URL */}
          <div>
            <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.3)" }}>Website URL *</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. assembl.co.nz"
              className="w-full px-3 py-2.5 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
              style={{ borderColor: url ? agentColor + "40" : "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              disabled={loading}
            />
          </div>

          {/* Toggle extras */}
          <button
            onClick={() => setShowExtras(!showExtras)}
            className="text-[10px] font-medium"
            style={{ color: agentColor }}
          >
            {showExtras ? "− Hide" : "+ Add"} social profiles &amp; assets
          </button>

          {showExtras && (
            <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2">
              {/* Instagram */}
              <div>
                <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Instagram size={10} /> Instagram Handle
                </label>
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@yourbusiness"
                  className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
                  disabled={loading}
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Linkedin size={10} /> LinkedIn Page URL
                </label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/company/yourbusiness"
                  className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
                  disabled={loading}
                />
              </div>

              {/* Upload zone */}
              <div>
                <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Upload size={10} /> Brand Assets (optional)
                </label>
                <div className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-opacity-40 transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <Upload size={16} className="mx-auto mb-1" style={{ color: "rgba(255,255,255,0.2)" }} />
                  <p className="text-[10px] font-jakarta" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Drag logos, brand guides, or colour palettes here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-destructive mt-3">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleScan}
            disabled={!url.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-syne font-bold transition-all disabled:opacity-40 hover:scale-[0.98]"
            style={{
              backgroundColor: agentColor,
              color: "#0A0A14",
            }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            {loading ? "Scanning Brand DNA..." : "Scan My Brand →"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border text-muted-foreground hover:text-foreground transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandScanModal;
