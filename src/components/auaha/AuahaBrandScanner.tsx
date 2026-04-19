import { useState } from "react";
import { Globe, Sparkles, Loader2, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrandDna } from "@/contexts/BrandDnaContext";
import { motion, AnimatePresence } from "framer-motion";

const POUNAMU = "#00A86B";
const TEAL = "#00CED1";

export default function AuahaBrandScanner() {
  const { brand, isScanning, scanUrl } = useBrandDna();
  const [url, setUrl] = useState("");

  const handleScan = () => {
    if (!url.trim()) return;
    let scanTarget = url.trim();
    if (!/^https?:\/\//i.test(scanTarget)) scanTarget = `https://${scanTarget}`;
    scanUrl(scanTarget);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-wide text-[#1A1D29]" style={{ fontFamily: "Lato, sans-serif" }}>
          Brand Scanner
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Enter a URL to extract brand voice, colours, values — powering all AUAHA NZ modules
        </p>
      </div>

      {/* URL Input */}
      <div className="rounded-2xl border p-6" style={{
        background: "linear-gradient(135deg, rgba(10,10,10,0.9), rgba(0,168,107,0.03))",
        borderColor: isScanning ? `${POUNAMU}40` : "rgba(255,255,255,0.08)",
      }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourbrand.co.nz"
              className="pl-10 bg-transparent border-gray-200 text-[#1A1D29]"
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
          </div>
          <Button
            onClick={handleScan}
            disabled={!url.trim() || isScanning}
            className="px-6 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${TEAL})`, color: "#0A0A0A" }}
          >
            {isScanning ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Scanning...</>
            ) : (
              <><Eye className="w-4 h-4 mr-2" /> Scan</>
            )}
          </Button>
        </div>

        {isScanning && (
          <div className="mt-4 space-y-2">
            {["Fetching page content...", "Extracting brand voice...", "Analysing colour palette...", "Mapping target audience..."].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.6 }}
                className="flex items-center gap-2 text-xs text-[#6B7280]"
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: POUNAMU }} />
                {step}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Brand DNA Results */}
      <AnimatePresence>
        {brand && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Identity Card */}
            <div className="rounded-2xl border p-6" style={{
              background: "linear-gradient(135deg, rgba(10,10,10,0.9), rgba(0,168,107,0.05))",
              borderColor: `${POUNAMU}20`,
            }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold" style={{
                  background: brand.colors.primary,
                  color: "#3D4250",
                }}>
                  {brand.businessName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl text-[#1A1D29] font-light">{brand.businessName}</h2>
                  <p className="text-[#6B7280] text-sm">{brand.industry} · {brand.voiceTone}</p>
                </div>
                {brand.scanUrl && (
                  <a href={brand.scanUrl} target="_blank" rel="noopener" className="ml-auto">
                    <ExternalLink className="w-4 h-4 text-[#6B7280] hover:text-[#4A5160]" />
                  </a>
                )}
              </div>

              {/* Tagline */}
              {brand.tagline && (
                <p className="text-[#4A5160] text-sm italic mb-4">"{brand.tagline}"</p>
              )}

              {/* Colours */}
              <div className="mb-4">
                <span className="text-[#6B7280] text-xs uppercase tracking-wider block mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  Colour Palette
                </span>
                <div className="flex gap-3">
                  {Object.entries(brand.colors).map(([name, hex]) => (
                    <div key={name} className="text-center">
                      <div className="w-12 h-12 rounded-xl border border-gray-200" style={{ background: hex }} />
                      <span className="text-[9px] text-[#6B7280] mt-1 block">{name}</span>
                      <span className="text-[9px] text-[#8B92A0] font-mono">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <span className="text-[#6B7280] text-xs uppercase tracking-wider block mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  Keywords
                </span>
                <div className="flex flex-wrap gap-2">
                  {brand.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs" style={{
                      background: "rgba(0,168,107,0.08)",
                      border: `1px solid ${POUNAMU}20`,
                      color: `${POUNAMU}cc`,
                    }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <span className="text-[#6B7280] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  Target Audience
                </span>
                <p className="text-[#4A5160] text-sm">{brand.targetAudience}</p>
              </div>
            </div>

            {/* Symbiotic Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { module: "video" as const, label: "Video Ideas", icon: "" },
                { module: "podcast" as const, label: "Podcast Topics", icon: "🎙️" },
                { module: "copy" as const, label: "Copy Angles", icon: "✍️" },
                { module: "app" as const, label: "App Ideas", icon: "" },
              ].map(({ module, label, icon }) => (
                <div key={module} className="rounded-xl border p-4" style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}>
                  <span className="text-lg mb-2 block">{icon}</span>
                  <h4 className="text-[#4A5160] text-xs uppercase tracking-wider mb-2">{label}</h4>
                  <ul className="space-y-1.5">
                    {brand.suggestions[module === "video" ? "videoIdeas" : module === "podcast" ? "podcastTopics" : module === "copy" ? "copyAngles" : "appIdeas"].map((item, i) => (
                      <li key={i} className="text-[#6B7280] text-xs flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: TEAL }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
