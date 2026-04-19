import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { X, Globe, Loader2, Instagram, Linkedin, Upload, Palette, Type, Eye, CheckCircle2, AlertCircle, PenLine } from "lucide-react";
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
    background_color?: string;
    text_color?: string;
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
    tone_category?: string;
  };
  brand_summary: string;
  brand_score: number;
  logo_url?: string;
  tagline?: string;
  social_links?: string[];
  key_messaging?: string[];
}

interface Props {
  agentName: string;
  agentColor: string;
  open: boolean;
  onClose: () => void;
  onBrandLoaded: (profile: string, businessName: string, brandDna?: BrandDna) => void;
}

/* ── Brand Card (visual result) ── */
const BrandCard = ({ dna, onClose }: { dna: BrandDna; onClose: () => void }) => {
  const [editDna, setEditDna] = useState<BrandDna>(dna);
  const [saving, setSaving] = useState(false);
  const vi = editDna.visual_identity;
  const colourKeys = [
    { key: "primary_color" as const, label: "Primary" },
    { key: "secondary_color" as const, label: "Secondary" },
    { key: "accent_color" as const, label: "Accent" },
  ];
  const tone = editDna.voice_tone;

  const updateColour = (key: keyof typeof vi, value: string) => {
    setEditDna(prev => ({
      ...prev,
      visual_identity: { ...prev.visual_identity, [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("brand_profiles").update({ brand_dna: editDna as any }).eq("user_id", user.id);
    } catch { /* silent */ }
    setSaving(false);
    onClose();
  };

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider" style={{ color: "#3A6A9C" }}>
        <CheckCircle2 size={14} /> Brand DNA Extracted
      </div>

      <div className="rounded-xl border border-border/30 bg-card/50 p-4 space-y-4">
        {/* Name + Industry */}
        <div className="flex items-start gap-3">
          {editDna.logo_url && (
            <img loading="lazy" decoding="async" src={editDna.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white/10" >
          )}
          <div>
            <h4 className="font-display font-bold text-sm text-foreground">{editDna.business_name}</h4>
            <p className="text-[10px] text-muted-foreground">{editDna.industry} · Score: {editDna.brand_score}/100</p>
          </div>
        </div>

        {/* Editable colour swatches */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1"><Palette size={10} /> Colours <span className="text-[8px] opacity-50">(tap to edit)</span></p>
          <div className="flex gap-2">
            {colourKeys.map(({ key, label }) => (
              <label key={key} className="flex flex-col items-center gap-0.5 cursor-pointer group">
                <div className="relative w-8 h-8 rounded-lg border border-gray-200 overflow-hidden group-hover:ring-1 group-hover:ring-white/20 transition-all">
                  <div className="absolute inset-0" style={{ background: vi[key] }} />
                  <input
                    type="color"
                    value={vi[key] || "#000000"}
                    onChange={e => updateColour(key, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <span className="text-[8px] font-mono text-muted-foreground">{vi[key]}</span>
                <span className="text-[7px] text-muted-foreground/50">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Type size={10} /> Typography</p>
          <div className="flex gap-4">
            <div>
              <p className="text-xs font-bold text-foreground" style={{ fontFamily: editDna.typography.heading_font }}>{editDna.typography.heading_font}</p>
              <p className="text-[9px] text-muted-foreground">Headings</p>
            </div>
            <div>
              <p className="text-xs text-foreground" style={{ fontFamily: editDna.typography.body_font }}>{editDna.typography.body_font}</p>
              <p className="text-[9px] text-muted-foreground">Body</p>
            </div>
          </div>
        </div>

        {/* Tone */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Eye size={10} /> Tone</p>
          <div className="flex flex-wrap gap-1">
            {tone.personality_traits?.slice(0, 5).map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-border/30 text-foreground/80">{t}</span>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">
            Formality: {tone.formality}/10 · {tone.tone_category || tone.sentence_style}
          </p>
        </div>

        {/* Tagline */}
        {editDna.tagline && (
          <div>
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5">Tagline</p>
            <p className="text-xs text-foreground/80 italic">"{editDna.tagline}"</p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        All advisors will now use your brand profile. Update anytime in Settings.
      </p>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-display font-bold transition-all disabled:opacity-60"
        style={{ background: "#3A6A9C", color: "#0A0A14" }}
      >
        {saving ? "Saving..." : "Continue with Brand DNA →"}
      </button>
    </div>
  );
};

/* ── Manual Brand Form ── */
const ManualBrandForm = ({ agentColor, onSubmit, loading }: { agentColor: string; onSubmit: (data: any) => void; loading: boolean }) => {
  const [form, setForm] = useState({
    businessName: "", industry: "", audience: "", tagline: "", logoUrl: "",
    primaryColour: "#10B981", secondaryColour: "#1A3A5C", accentColour: "#3A6A9C",
    headingFont: "", bodyFont: "", formality: 5,
    toneTraits: "" as string,
  });

  const handleSubmit = () => {
    onSubmit({
      ...form,
      toneTraits: form.toneTraits ? form.toneTraits.split(",").map(t => t.trim()) : ["professional", "friendly"],
    });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none text-foreground";
  const labelClass = "text-[9px] font-mono uppercase tracking-wider mb-1 block text-muted-foreground";

  return (
    <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="flex items-center gap-2 mb-1">
        <PenLine size={14} style={{ color: agentColor }} />
        <p className="text-xs font-display font-bold text-foreground">Enter your brand details manually</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Business Name *</label>
          <input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="My Business" className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
        </div>
        <div>
          <label className={labelClass}>Industry</label>
          <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="e.g. Hospitality" className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tagline</label>
        <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Your brand tagline" className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
      </div>

      <div>
        <label className={labelClass}>Target Audience</label>
        <input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} placeholder="e.g. NZ small businesses" className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
      </div>

      <div>
        <label className={labelClass}>Brand Colours</label>
        <div className="flex gap-2">
          {(["primaryColour", "secondaryColour", "accentColour"] as const).map(key => (
            <div key={key} className="flex items-center gap-1.5">
              <input type="color" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border-0" />
              <span className="text-[8px] font-mono text-muted-foreground">{key.replace("Colour", "")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Heading Font</label>
          <input value={form.headingFont} onChange={e => setForm(f => ({ ...f, headingFont: e.target.value }))} placeholder="e.g. Syne" className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
        </div>
        <div>
          <label className={labelClass}>Body Font</label>
          <input value={form.bodyFont} onChange={e => setForm(f => ({ ...f, bodyFont: e.target.value }))} placeholder="e.g. Inter" className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tone Traits (comma-separated)</label>
        <input value={form.toneTraits} onChange={e => setForm(f => ({ ...f, toneTraits: e.target.value }))} placeholder="e.g. professional, warm, direct" className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
      </div>

      <div>
        <label className={labelClass}>Logo URL (optional)</label>
        <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." className={inputClass} style={{ borderColor: "hsl(var(--border))" }} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!form.businessName.trim() || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-bold transition-all disabled:opacity-40"
        style={{ background: agentColor, color: "#0A0A14" }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
        {loading ? "Saving..." : "Save Brand Profile"}
      </button>
    </div>
  );
};

const BrandScanModal = ({ agentName, agentColor, open, onClose, onBrandLoaded }: Props) => {
  const [url, setUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [scanResult, setScanResult] = useState<BrandDna | null>(null);

  if (!open) return null;

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setScanResult(null);

    try {
      const fallbackContent = typeof document !== "undefined" ? document.body?.innerText?.slice(0, 30000) || "" : "";

      const { data, error: fnError } = await supabase.functions.invoke("scan-website", {
        body: { url: url.trim(), instagram: instagram.trim() || undefined, linkedin: linkedin.trim() || undefined, fallbackContent },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        if (data.showManualForm) {
          setShowManualForm(true);
          setError(data.error);
          return;
        }
        throw new Error(data.error);
      }

      const brandDna = data.brandDna as BrandDna | undefined;
      if (brandDna) {
        setScanResult(brandDna);
        const businessName = brandDna.business_name || new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
        onBrandLoaded(data.brandProfile as string, businessName, brandDna);
      } else {
        onBrandLoaded(data.brandProfile as string, url, undefined);
        onClose();
      }
    } catch (err) {
      if (err instanceof FunctionsHttpError) {
        try {
          const errorBody = await err.context.json();
          setError(errorBody?.error || "Failed to scan website");
          if (errorBody?.showManualForm) setShowManualForm(true);
          return;
        } catch { setError("Failed to scan website"); return; }
      }
      setError(err instanceof Error ? err.message : "Failed to scan website");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (manualBrand: any) => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("scan-website", {
        body: { url: "manual", manualBrand },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const brandDna = data.brandDna as BrandDna | undefined;
      if (brandDna) {
        setScanResult(brandDna);
        onBrandLoaded(data.brandProfile, brandDna.business_name, brandDna);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save brand profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWithResult = () => {
    setScanResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ background: "hsl(var(--card))", borderColor: `${agentColor}25` }}
      >
        <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>

        {/* Show brand card if scan completed */}
        {scanResult ? (
          <BrandCard dna={scanResult} onClose={handleCloseWithResult} />
        ) : showManualForm ? (
          <>
            {error && (
              <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle size={14} className="text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive">{error}</p>
              </div>
            )}
            <ManualBrandForm agentColor={agentColor} onSubmit={handleManualSubmit} loading={loading} />
            <button onClick={() => { setShowManualForm(false); setError(""); }} className="w-full mt-2 text-[10px] text-muted-foreground hover:text-foreground text-center">
              ← Back to URL scan
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={20} style={{ color: agentColor }} />
              <h3 className="text-sm font-display font-bold text-foreground">
                Let {agentName} learn your brand
              </h3>
            </div>

            <p className="text-[11px] font-body mb-4 text-muted-foreground">
              Enter your website URL. {agentName} scans colours, fonts, tone, and messaging so every agent matches your brand automatically.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider mb-1 block text-muted-foreground">Website URL *</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. assembl.co.nz"
                  className="w-full px-3 py-2.5 rounded-lg text-xs font-body bg-transparent border outline-none text-foreground"
                  style={{ borderColor: url ? `${agentColor}40` : "hsl(var(--border))" }}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  disabled={loading}
                />
              </div>

              <button onClick={() => setShowExtras(!showExtras)} className="text-[10px] font-medium" style={{ color: agentColor }}>
                {showExtras ? "− Hide" : "+ Add"} social profiles
              </button>

              {showExtras && (
                <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2">
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1 text-muted-foreground">
                      <Instagram size={10} /> Instagram Handle
                    </label>
                    <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourbusiness" className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none text-foreground" style={{ borderColor: "hsl(var(--border))" }} disabled={loading} />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1 text-muted-foreground">
                      <Linkedin size={10} /> LinkedIn Page URL
                    </label>
                    <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/company/yourbusiness" className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none text-foreground" style={{ borderColor: "hsl(var(--border))" }} disabled={loading} />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-destructive mt-3">{error}</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleScan}
                disabled={!url.trim() || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-bold transition-all disabled:opacity-40 hover:scale-[0.98]"
                style={{ backgroundColor: agentColor, color: "#0A0A14" }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                {loading ? "Scanning Brand DNA..." : "Scan My Brand →"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border text-muted-foreground hover:text-foreground transition-colors"
                style={{ borderColor: "hsl(var(--border))" }}
              >
                Skip
              </button>
            </div>

            <button
              onClick={() => setShowManualForm(true)}
              className="w-full mt-3 text-[10px] text-muted-foreground hover:text-foreground text-center transition-colors"
            >
              Can't scan? Enter brand details manually →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandScanModal;
