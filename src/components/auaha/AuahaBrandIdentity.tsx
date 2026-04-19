import { useState, useEffect, useRef } from "react";
import { Fingerprint, Globe, Sparkles, Palette, Check, Save, Eye, Zap, ChevronDown, ChevronUp, Shield, Type, MessageSquare, Target, Package, ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#F0D078";

interface BrandDna {
  business_name?: string;
  industry?: string;
  target_audience?: string;
  key_products?: string[];
  usps?: string[];
  visual_identity?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    background_preference?: string;
    photography_style?: string;
    visual_aesthetic?: string;
  };
  typography?: {
    heading_style?: string;
    heading_font?: string;
    body_style?: string;
    body_font?: string;
    text_density?: string;
  };
  voice_tone?: {
    formality?: number;
    personality_traits?: string[];
    sentence_style?: string;
    emoji_usage?: string;
    jargon_level?: string;
    cta_style?: string;
    tone_category?: string;
  };
  logo_url?: string;
  tagline?: string;
  social_links?: string[];
  key_messaging?: string[];
  brand_summary?: string;
  brand_score?: number;
}

function useBrandProfile() {
  return useQuery({
    queryKey: ["auaha-brand-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/* ── Animated colour swatch ── */
function ColourSwatch({ color, label, delay = 0 }: { color: string; label: string; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-1 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{ scale: hovered ? 1.2 : 1, boxShadow: hovered ? `0 0 24px ${color}66` : `0 0 0px ${color}00` }}
        className="w-12 h-12 rounded-xl border border-gray-200 relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm"
          >
            <Eye className="w-4 h-4 text-foreground" />
          </motion.div>
        )}
      </motion.div>
      <span className="text-[10px] font-mono text-[#6B7280]">{color}</span>
      <span className="text-[9px] text-[#8B92A0] uppercase tracking-wider">{label}</span>
    </motion.div>
  );
}

/* ── Scanning animation ── */
function ScanAnimation() {
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #FFFFFF, #FAFBFC)" }}>
      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Pulsing dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ACCENT,
            left: `${15 + (i % 3) * 30}%`,
            top: `${20 + Math.floor(i / 3) * 40}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
      {/* Central text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Zap className="w-8 h-8" style={{ color: ACCENT }} />
        </motion.div>
        <motion.p
          className="text-[#4A5160] text-xs mt-3 tracking-widest uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          PRISM is analysing...
        </motion.p>
        <p className="text-[#6B7280] text-[10px] mt-1">Extracting colours · fonts · voice · identity</p>
      </div>
    </div>
  );
}

/* ── Brand Score Ring ── */
function BrandScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  const colour = score >= 80 ? "#34d399" : score >= 60 ? ACCENT : "#ef4444";

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="relative w-28 h-28 flex items-center justify-center"
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="56" cy="56" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="56" cy="56" r="40" fill="none" stroke={colour} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="text-center z-10">
        <motion.span
          className="text-2xl font-bold"
          style={{ color: colour }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <p className="text-[9px] text-[#6B7280] uppercase tracking-wider">Brand Score</p>
      </div>
    </motion.div>
  );
}

/* ── Formality meter ── */
function FormalityMeter({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#6B7280]">Casual</span>
      <div className="flex-1 h-1.5 rounded-full bg-[rgba(74,165,168,0.04)] relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, #34d399, ${ACCENT}, #ef4444)` }}
          initial={{ width: "0%" }}
          animate={{ width: `${level * 10}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] text-[#6B7280]">Formal</span>
    </div>
  );
}

/* ── Main Component ── */
export default function AuahaBrandIdentity() {
  const { data: existingProfile, isLoading } = useBrandProfile();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [brandDna, setBrandDna] = useState<BrandDna | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true, visual: true, voice: false, products: false,
  });

  // Load existing brand DNA from DB
  useEffect(() => {
    if (existingProfile?.brand_dna) {
      setBrandDna(existingProfile.brand_dna as unknown as BrandDna);
    }
  }, [existingProfile]);

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const scanWebsite = async () => {
    if (!url.trim()) return toast.error("Enter a website URL");
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-website", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.brandDna) {
        setBrandDna(data.brandDna);
        toast.success(`PRISM extracted brand DNA for "${data.brandDna.business_name || "your site"}"`);
        // Invalidate to refetch from DB (edge function already saved it)
        queryClient.invalidateQueries({ queryKey: ["auaha-brand-profile"] });
        queryClient.invalidateQueries({ queryKey: ["auaha-brand"] });
        // Auto-expand all sections
        setExpandedSections({ identity: true, visual: true, voice: true, products: true });
      } else if (data?.brandProfile) {
        toast.success("Brand profile analysed");
      }

      if (data?.scanWarning) toast.warning(data.scanWarning);
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const rescan = () => {
    setBrandDna(null);
    setIsScanning(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[rgba(74,165,168,0.04)] rounded w-48" />
          <div className="h-32 bg-[rgba(74,165,168,0.04)] rounded" />
        </div>
      </div>
    );
  }

  const vi = brandDna?.visual_identity;
  const vt = brandDna?.voice_tone;
  const ty = brandDna?.typography;

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Brand Identity</p>
          <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>
            Brand DNA Scanner
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">Powered by PRISM · AI-powered brand extraction</p>
        </div>
        {brandDna && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(90,173,160,0.1)", color: "#34d399" }}>
              <Check className="w-3 h-3" /> DNA Extracted
            </span>
            <button onClick={rescan} className="text-[#6B7280] hover:text-[#4A5160] transition-colors" title="Re-scan">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scanner Input */}
      <motion.div
        layout
        className="rounded-xl border backdrop-blur-xl p-6"
        style={{ background: "rgba(255,255,255,0.92)", borderColor: isScanning ? `${ACCENT}44` : "rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Website Scanner</span>
        </div>

        {!isScanning ? (
          <div className="flex gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scanWebsite()}
              className="flex-1 bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gray-300 transition-colors"
              placeholder="https://yourbusiness.co.nz"
            />
            <Button onClick={scanWebsite} style={{ background: ACCENT, color: "#000" }} className="min-w-[120px]">
              Scan <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <ScanAnimation />
        )}
      </motion.div>

      {/* Brand DNA Results */}
      <AnimatePresence>
        {brandDna && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Top row: Score + Identity */}
            <div className="grid lg:grid-cols-[auto,1fr] gap-4">
              {/* Brand Score */}
              {brandDna.brand_score != null && (
                <motion.div
                  className="rounded-xl border backdrop-blur-xl p-6 flex flex-col items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <BrandScoreRing score={brandDna.brand_score} />
                  <p className="text-[10px] text-[#6B7280] mt-2 text-center max-w-[120px]">
                    Based on visual consistency, messaging & digital presence
                  </p>
                </motion.div>
              )}

              {/* Identity Card */}
              <motion.div
                className="rounded-xl border backdrop-blur-xl p-6"
                style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button className="flex items-center justify-between w-full mb-3" onClick={() => toggleSection("identity")}>
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" style={{ color: ACCENT }} />
                    <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Brand Identity</span>
                  </div>
                  {expandedSections.identity ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>

                <AnimatePresence>
                  {expandedSections.identity && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
                      <div className="flex items-center gap-3">
                        {brandDna.logo_url && (
                          <img loading="lazy" decoding="async" src={brandDna.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-[rgba(74,165,168,0.04)] p-1" onError={(e) = /> { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <div>
                          <h2 className="text-foreground text-lg font-medium">{brandDna.business_name}</h2>
                          <p className="text-[#6B7280] text-xs">{brandDna.industry} · {brandDna.target_audience}</p>
                        </div>
                      </div>
                      {brandDna.tagline && (
                        <p className="text-sm italic" style={{ color: `${ACCENT}cc` }}>"{brandDna.tagline}"</p>
                      )}
                      {brandDna.brand_summary && (
                        <p className="text-[#6B7280] text-xs leading-relaxed">{brandDna.brand_summary}</p>
                      )}
                      {brandDna.social_links && brandDna.social_links.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {brandDna.social_links.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 rounded-full bg-[rgba(74,165,168,0.04)] text-[#6B7280] hover:text-[#2A2F3D] hover:bg-[rgba(74,165,168,0.06)] transition-all flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {new URL(link).hostname.replace("www.", "")}
                            </a>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Visual Identity */}
            {vi && (
              <motion.div
                className="rounded-xl border backdrop-blur-xl p-6"
                style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button className="flex items-center justify-between w-full mb-4" onClick={() => toggleSection("visual")}>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" style={{ color: ACCENT }} />
                    <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Visual Identity</span>
                  </div>
                  {expandedSections.visual ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>

                <AnimatePresence>
                  {expandedSections.visual && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-5">
                      {/* Colour palette */}
                      <div>
                        <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-3">Colour Palette</p>
                        <div className="flex gap-4 flex-wrap">
                          {vi.primary_color && <ColourSwatch color={vi.primary_color} label="Primary" delay={0} />}
                          {vi.secondary_color && <ColourSwatch color={vi.secondary_color} label="Secondary" delay={0.1} />}
                          {vi.accent_color && <ColourSwatch color={vi.accent_color} label="Accent" delay={0.2} />}
                          {vi.background_color && <ColourSwatch color={vi.background_color} label="Background" delay={0.3} />}
                          {vi.text_color && <ColourSwatch color={vi.text_color} label="Text" delay={0.4} />}
                        </div>
                      </div>

                      {/* Gradient preview */}
                      {vi.primary_color && vi.secondary_color && (
                        <motion.div
                          className="h-12 rounded-xl overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${vi.primary_color}, ${vi.secondary_color}, ${vi.accent_color || vi.primary_color})` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        />
                      )}

                      {/* Style tags */}
                      <div className="flex gap-2 flex-wrap">
                        {vi.visual_aesthetic && (
                          <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200 text-[#6B7280]">
                            ✦ {vi.visual_aesthetic}
                          </span>
                        )}
                        {vi.photography_style && (
                          <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200 text-[#6B7280]">
                            📷 {vi.photography_style}
                          </span>
                        )}
                        {vi.background_preference && (
                          <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200 text-[#6B7280]">
                            🌗 {vi.background_preference} mode
                          </span>
                        )}
                      </div>

                      {/* Typography */}
                      {ty && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Typography</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-[rgba(74,165,168,0.04)]">
                              <div className="flex items-center gap-2 mb-1">
                                <Type className="w-3 h-3 text-[#6B7280]" />
                                <span className="text-[9px] text-[#6B7280] uppercase">Heading</span>
                              </div>
                              <p className="text-foreground text-lg" style={{ fontFamily: `"${ty.heading_font}", ${ty.heading_style}` }}>
                                {ty.heading_font || ty.heading_style}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-[rgba(74,165,168,0.04)]">
                              <div className="flex items-center gap-2 mb-1">
                                <Type className="w-3 h-3 text-[#6B7280]" />
                                <span className="text-[9px] text-[#6B7280] uppercase">Body</span>
                              </div>
                              <p className="text-foreground text-sm" style={{ fontFamily: `"${ty.body_font}", ${ty.body_style}` }}>
                                {ty.body_font || ty.body_style}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Voice & Tone */}
            {vt && (
              <motion.div
                className="rounded-xl border backdrop-blur-xl p-6"
                style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button className="flex items-center justify-between w-full mb-4" onClick={() => toggleSection("voice")}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" style={{ color: ACCENT }} />
                    <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Voice & Tone</span>
                  </div>
                  {expandedSections.voice ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>

                <AnimatePresence>
                  {expandedSections.voice && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                      {/* Personality traits */}
                      {vt.personality_traits && vt.personality_traits.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {vt.personality_traits.map((trait, i) => (
                            <motion.span
                              key={trait}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 * i, type: "spring" }}
                              className="text-xs px-3 py-1.5 rounded-full"
                              style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}33` }}
                            >
                              {trait}
                            </motion.span>
                          ))}
                        </div>
                      )}

                      {/* Formality */}
                      {vt.formality != null && (
                        <div>
                          <p className="text-[10px] text-[#6B7280] mb-2">Formality Level</p>
                          <FormalityMeter level={vt.formality} />
                        </div>
                      )}

                      {/* Voice attributes */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {vt.sentence_style && (
                          <div className="p-2 rounded-lg bg-[rgba(74,165,168,0.04)] text-center">
                            <p className="text-[9px] text-[#6B7280] uppercase">Sentences</p>
                            <p className="text-[#4A5160] text-[11px] mt-0.5">{vt.sentence_style}</p>
                          </div>
                        )}
                        {vt.emoji_usage && (
                          <div className="p-2 rounded-lg bg-[rgba(74,165,168,0.04)] text-center">
                            <p className="text-[9px] text-[#6B7280] uppercase">Emojis</p>
                            <p className="text-[#4A5160] text-[11px] mt-0.5">{vt.emoji_usage}</p>
                          </div>
                        )}
                        {vt.jargon_level && (
                          <div className="p-2 rounded-lg bg-[rgba(74,165,168,0.04)] text-center">
                            <p className="text-[9px] text-[#6B7280] uppercase">Jargon</p>
                            <p className="text-[#4A5160] text-[11px] mt-0.5">{vt.jargon_level}</p>
                          </div>
                        )}
                        {vt.cta_style && (
                          <div className="p-2 rounded-lg bg-[rgba(74,165,168,0.04)] text-center">
                            <p className="text-[9px] text-[#6B7280] uppercase">CTA Style</p>
                            <p className="text-[#4A5160] text-[11px] mt-0.5">{vt.cta_style}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Products & USPs */}
            {((brandDna.key_products && brandDna.key_products.length > 0) || (brandDna.usps && brandDna.usps.length > 0)) && (
              <motion.div
                className="rounded-xl border backdrop-blur-xl p-6"
                style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button className="flex items-center justify-between w-full mb-4" onClick={() => toggleSection("products")}>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" style={{ color: ACCENT }} />
                    <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Products & USPs</span>
                  </div>
                  {expandedSections.products ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>

                <AnimatePresence>
                  {expandedSections.products && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                      {brandDna.key_products && brandDna.key_products.length > 0 && (
                        <div>
                          <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-2">Products / Services</p>
                          <div className="flex gap-2 flex-wrap">
                            {brandDna.key_products.map((p, i) => (
                              <motion.span
                                key={p}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="text-xs px-3 py-1.5 rounded-lg bg-[rgba(74,165,168,0.04)] text-[#4A5160] border border-gray-100"
                              >
                                {p}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}
                      {brandDna.usps && brandDna.usps.length > 0 && (
                        <div>
                          <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-2">Unique Selling Points</p>
                          <div className="space-y-2">
                            {brandDna.usps.map((u, i) => (
                              <motion.div
                                key={u}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(74,165,168,0.04)]"
                              >
                                <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                                <span className="text-[#4A5160] text-xs">{u}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Key Messaging */}
            {brandDna.key_messaging && brandDna.key_messaging.length > 0 && (
              <motion.div
                className="rounded-xl border backdrop-blur-xl p-6"
                style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" style={{ color: ACCENT }} />
                  <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Key Messaging</span>
                </div>
                <div className="space-y-2">
                  {brandDna.key_messaging.map((msg, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className="text-[#6B7280] text-xs pl-3 border-l-2"
                      style={{ borderColor: `${ACCENT}44` }}
                    >
                      {msg}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!brandDna && !isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: "rgba(74,165,168,0.14)", background: "rgba(74,165,168,0.04)" }}
        >
          <Fingerprint className="w-12 h-12 mx-auto mb-4" style={{ color: `${ACCENT}44` }} />
          <h3 className="text-[#4A5160] text-sm mb-1">No Brand DNA Yet</h3>
          <p className="text-[#6B7280] text-xs">Enter a website URL above and PRISM will extract colours, fonts, voice, and identity</p>
        </motion.div>
      )}
    </div>
  );
}
