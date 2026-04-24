import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Rocket, Copy, CheckCircle2, X, ExternalLink, Lock, Eye } from "lucide-react";

const ACCENT = "#5AADA0";

interface SparkDeployModalProps {
  htmlContent: string;
  onClose: () => void;
  onDeployed?: () => void;
}

export default function SparkDeployModal({ htmlContent, onClose, onDeployed }: SparkDeployModalProps) {
  const { user } = useAuth();
  const [appName, setAppName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [password, setPassword] = useState("");
  const [showBranding, setShowBranding] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 50);

  const handleNameChange = (value: string) => {
    setDisplayName(value);
    setAppName(slugify(value));
  };

  const deploy = async () => {
    if (!user) {
      setError("Please sign in to deploy apps.");
      return;
    }

    if (!appName.trim()) {
      setError("Please add an app name before deploying.");
      return;
    }

    if (!htmlContent) {
      setError("There is no app preview to deploy yet.");
      return;
    }

    setDeploying(true);
    setError("");

    try {
      const { error: dbError } = await supabase.from("spark_apps" as any).insert({
        user_id: user.id,
        name: appName,
        display_name: displayName || appName,
        html_content: htmlContent,
        meta_description: metaDesc || `${displayName} — built with SPARK by Assembl`,
        password_hash: passwordProtect && password ? password : null,
        show_branding: showBranding,
        status: "live",
      } as any);

      if (dbError) {
        if (dbError.code === "23505") {
          setError("An app with this name already exists. Choose a different name.");
        } else {
          setError(dbError.message);
        }
        setDeploying(false);
        return;
      }

      const url = `${window.location.origin}/apps/${appName}`;
      setDeployedUrl(url);
      setDeployed(true);
      onDeployed?.();
    } catch (err) {
      setError("Deployment failed. Please try again.");
    } finally {
      setDeploying(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(deployedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEmbed = () => {
    navigator.clipboard.writeText(`<iframe src="${deployedUrl}" width="100%" height="600" frameborder="0" style="border-radius:12px;"></iframe>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-bold flex items-center gap-2" style={{ color: "#E4E4EC" }}>
            <Rocket size={16} style={{ color: ACCENT }} /> {deployed ? "App Deployed!" : "Deploy Your App"}
          </h3>
          <button onClick={onClose}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
        </div>

        {!deployed ? (
          <>
            {!user && (
              <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.72)" }}>
                  Sign in first to publish and manage SPARK apps.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-[11px] font-semibold"
                  style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                >
                  Sign In
                </a>
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>App Name *</label>
              <input value={displayName} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Paint Quote Calculator"
                className="w-full px-3 py-2.5 rounded-lg text-xs font-body bg-transparent border outline-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
              {appName && (
                <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  URL: {window.location.origin}/apps/{appName}
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Description (SEO)</label>
              <input value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Brief description for search engines..."
                className="w-full px-3 py-2.5 rounded-lg text-xs font-body bg-transparent border outline-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-body flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Lock size={12} /> Password protect
                </span>
                <button onClick={() => setPasswordProtect(!passwordProtect)} className="w-9 h-5 rounded-full relative transition-all"
                  style={{ background: passwordProtect ? ACCENT : "rgba(255,255,255,0.1)" }}>
                  <div className="w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all"
                    style={{ background: "#fff", left: passwordProtect ? "18px" : "3px" }} />
                </button>
              </div>
              {passwordProtect && (
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Set a password..." type="password"
                  className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-body flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Eye size={12} /> Show Assembl branding
                </span>
                <button onClick={() => setShowBranding(!showBranding)} className="w-9 h-5 rounded-full relative transition-all"
                  style={{ background: showBranding ? ACCENT : "rgba(255,255,255,0.1)" }}>
                  <div className="w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all"
                    style={{ background: "#fff", left: showBranding ? "18px" : "3px" }} />
                </button>
              </div>
            </div>

            {error && <p className="text-[11px] text-[#C85A54]">{error}</p>}

            <button onClick={deploy} disabled={!user || !appName.trim() || deploying}
              className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
              style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
              {deploying ? "Deploying..." : user ? " Deploy Live" : "Sign in to deploy"}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl p-4 text-center space-y-3" style={{ background: "rgba(102,187,106,0.08)", border: "1px solid rgba(102,187,106,0.2)" }}>
              <CheckCircle2 size={32} className="mx-auto" style={{ color: "rgba(102,187,106,0.9)" }} />
              <p className="text-xs font-body" style={{ color: "rgba(102,187,106,0.9)" }}>Your app is live!</p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "#E4E4EC" }}>
                  {deployedUrl}
                </code>
                <button onClick={copyUrl} className="p-1 rounded" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {copied ? <CheckCircle2 size={14} style={{ color: "rgba(102,187,106,0.9)" }} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <a href={deployedUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-semibold"
                style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                <ExternalLink size={12} /> View Live
              </a>
              <button onClick={copyEmbed}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-semibold"
                style={{ background: "rgba(255,255,255,0.04)", color: "#E4E4EC", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Copy size={12} /> Copy Embed Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
