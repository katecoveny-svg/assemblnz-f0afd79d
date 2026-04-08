import { useState } from "react";
import { Fingerprint, Globe, Sparkles, Plus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#F0D078";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaBrandIdentity() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [brand, setBrand] = useState({
    name: "", colors: ["#D4A843", "#3A7D6E", "#1A3A5C", "#F0D078"],
    fonts: { primary: "Lato", secondary: "Plus Jakarta Sans" },
    tone: "Professional yet approachable",
    mission: "", audience: "",
  });

  const scanWebsite = async () => {
    if (!url.trim()) return toast.error("Enter a website URL");
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-website", { body: { url } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.brandName) setBrand((b) => ({ ...b, name: data.brandName }));
      toast.success("PRISM scanned the website and extracted brand data");
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Brand Identity</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Brand Identity</h1>
        <p className="text-white/50 text-sm mt-1">Powered by PRISM & CHROMATIC</p>
      </div>

      {/* Website Scanner */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="text-white/60 text-xs uppercase tracking-[2px]">Website Scanner</span>
        </div>
        <div className="flex gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none"
            placeholder="https://yourbusiness.co.nz"
          />
          <Button onClick={scanWebsite} disabled={isScanning} style={{ background: ACCENT, color: "#000" }}>
            {isScanning ? "Scanning..." : "Scan"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Brand Profile */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-white/60 text-xs uppercase tracking-[3px]">Brand Profile</h3>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Brand Name</label>
            <input
              value={brand.name}
              onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Voice & Tone</label>
            <input
              value={brand.tone}
              onChange={(e) => setBrand({ ...brand, tone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Mission</label>
            <textarea
              value={brand.mission}
              onChange={(e) => setBrand({ ...brand, mission: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Target Audience</label>
            <textarea
              value={brand.audience}
              onChange={(e) => setBrand({ ...brand, audience: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none min-h-[60px]"
            />
          </div>

          <Button onClick={() => toast.success("Brand profile saved")} style={{ background: ACCENT, color: "#000" }}>
            Save Brand Profile
          </Button>
        </GlassCard>

        {/* Colours & Fonts */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-xs uppercase tracking-[3px]">Brand Colours</h3>
              <button className="text-white/30 hover:text-white/60"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-3">
              {brand.colors.map((c, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-xl mb-1.5 cursor-pointer hover:scale-105 transition-transform" style={{ background: c }} />
                  <span className="text-white/30 text-[10px] font-mono">{c}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4">Typography</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-white text-sm" style={{ fontFamily: brand.fonts.primary }}>
                    {brand.fonts.primary}
                  </p>
                  <p className="text-white/30 text-xs">Primary / Display</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT }}>Aa</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-white text-sm" style={{ fontFamily: brand.fonts.secondary }}>
                    {brand.fonts.secondary}
                  </p>
                  <p className="text-white/30 text-xs">Body / Content</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT }}>Aa</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-3">Brand Consistency</h3>
            <p className="text-white/40 text-xs mb-3">Upload an image or paste copy to check brand alignment</p>
            <Button variant="outline" className="w-full border-white/10 text-white/60" onClick={() => toast.info("Brand checker coming soon")}>
              <Palette className="w-4 h-4 mr-2" /> Check Brand Consistency
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
