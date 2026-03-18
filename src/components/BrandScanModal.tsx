import { useState } from "react";
import { X, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  agentName: string;
  agentColor: string;
  open: boolean;
  onClose: () => void;
  onBrandLoaded: (profile: string, businessName: string) => void;
}

const BrandScanModal = ({ agentName, agentColor, open, onClose, onBrandLoaded }: Props) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("scan-website", {
        body: { url: url.trim() },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const profile = data.brandProfile as string;
      // Extract business name from first line
      const nameMatch = profile.match(/business\s*name[:\s]*([^\n,.]+)/i);
      const businessName = nameMatch?.[1]?.trim() || new URL(url.startsWith("http") ? url : `https://${url}`).hostname;

      onBrandLoaded(profile, businessName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan website");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="relative w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl"
        style={{ borderColor: agentColor + "25" }}
      >
        <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} style={{ color: agentColor }} />
          <h3 className="text-sm font-bold text-foreground">
            Teach {agentName} your brand
          </h3>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Paste your website URL so the agent can understand your business and give tailored advice.
        </p>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.co.nz"
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none mb-3"
          style={{ borderColor: url ? agentColor + "40" : undefined }}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          disabled={loading}
        />

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleScan}
            disabled={!url.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{
              backgroundColor: agentColor,
              color: "#0A0A14",
            }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            {loading ? "Scanning..." : "Scan Website"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandScanModal;
