import { Download, Share2, Copy, Check, Film, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { assemblMark } from "@/assets/brand";

const POUNAMU = "#3A7D6E";
const TEAL = "#5AADA0";
const GOLD = "#4AA5A8";
const CHARCOAL = "#3D4250";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(74,165,168,0.18)",
  boxShadow: "0 12px 40px rgba(58,125,110,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const BRAND_VIDEO_URL = "/brand/assembl-brand-video.gif";

const SOCIAL_CAPTIONS = {
  linkedin: `Seven industries. One governed intelligence.\n\nAssembl is the operating system for New Zealand business — governed AI built on tikanga principles.\n\nManaaki · Waihanga · Auaha · Arataki · Pikau · Hoko · Ako — plus Tōro for whānau.\n\nLearn more → assembl.co.nz`,
  instagram: `Hospitality, construction, creative, automotive, freight, retail, ECE — seven industry kete plus Tōro for whānau. One governed platform.\n\n#AssemblNZ #NZBusiness #AI #Tikanga #MadeInNZ`,
  twitter: `Seven industry kete + Tōro for whānau. One governed intelligence.\n\nAssembl — governed AI for NZ business.\n\nassembl.co.nz`,
};

export default function AdminBrandAssetsTab() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleDownload = async () => {
    const a = document.createElement("a");
    a.href = BRAND_VIDEO_URL;
    a.download = "assembl-brand-video.gif";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCaption = async (key: keyof typeof SOCIAL_CAPTIONS) => {
    await navigator.clipboard.writeText(SOCIAL_CAPTIONS[key]);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(BRAND_VIDEO_URL);
        const blob = await res.blob();
        const file = new File([blob], "assembl-brand-video.gif", { type: "image/gif" });
        await navigator.share({
          files: [file],
          title: "Assembl — Seven industries, one governed intelligence",
          text: SOCIAL_CAPTIONS.linkedin,
        });
      } catch {
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Video Hero */}
      <div className="rounded-3xl overflow-hidden p-6" style={GLASS}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: `linear-gradient(135deg, ${TEAL}, ${POUNAMU})` }}>
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: CHARCOAL, fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }}>
              ASSEMBL BRAND VIDEO
            </h3>
            <p className="text-xs" style={{ color: `${CHARCOAL}80` }}>
              Seven industries. One governed intelligence. — share-ready for socials
            </p>
          </div>
        </div>

        {/* Video preview with logo overlay */}
        <div className="relative rounded-2xl overflow-hidden mb-4 bg-black"
             style={{ aspectRatio: "1/1", maxWidth: 600, margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          <img loading="lazy" decoding="async" src={BRAND_VIDEO_URL} alt="Assembl brand video" className="w-full h-full object-cover" />

          {/* Glass logo overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl"
               style={{
                 background: "rgba(255,255,255,0.15)",
                 backdropFilter: "blur(20px)",
                 WebkitBackdropFilter: "blur(20px)",
                 border: "1px solid rgba(255,255,255,0.25)",
               }}>
            <img loading="lazy" decoding="async" src={assemblMark} alt="Assembl" className="w-6 h-6" />
            <span className="text-white text-xs font-light tracking-[3px]" style={{ fontFamily: "'Inter', sans-serif" }}>
              ASSEMBL
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${TEAL}, ${POUNAMU})`, boxShadow: `0 8px 24px ${POUNAMU}40` }}
          >
            <Download className="w-4 h-4" /> Download GIF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-transform hover:scale-105"
            style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${POUNAMU}30`, color: CHARCOAL }}
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        <div className="mt-4 text-center text-[10px]" style={{ color: `${CHARCOAL}60` }}>
          7.6 MB · 1080×1080 · GIF · Optimised for LinkedIn, Instagram, X
        </div>
      </div>

      {/* Social captions */}
      <div className="rounded-3xl p-6" style={GLASS}>
        <h4 className="text-sm font-bold mb-4 tracking-[1px]" style={{ color: CHARCOAL, fontFamily: "'Inter', sans-serif" }}>
          READY-TO-POST CAPTIONS
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.keys(SOCIAL_CAPTIONS) as Array<keyof typeof SOCIAL_CAPTIONS>).map((platform) => (
            <div key={platform} className="rounded-2xl p-4"
                 style={{ background: "rgba(255,255,255,0.5)", border: `1px solid ${TEAL}20` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: POUNAMU }}>
                  {platform === "twitter" ? "X / Twitter" : platform}
                </span>
                <button
                  onClick={() => handleCopyCaption(platform)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white"
                  style={{ color: copied === platform ? TEAL : `${CHARCOAL}70` }}
                  aria-label={`Copy ${platform} caption`}
                >
                  {copied === platform ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] whitespace-pre-line leading-relaxed" style={{ color: CHARCOAL }}>
                {SOCIAL_CAPTIONS[platform]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Brand mark + wordmark assets */}
      <div className="rounded-3xl p-6" style={GLASS}>
        <h4 className="text-sm font-bold mb-4 tracking-[1px]" style={{ color: CHARCOAL, fontFamily: "'Inter', sans-serif" }}>
          <ImageIcon className="w-4 h-4 inline mr-2" style={{ color: GOLD }} />
          LOGO ASSETS
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Mark (SVG)", file: "/brand/assembl-mark.svg" },
            { name: "Wordmark (SVG)", file: "/brand/assembl-wordmark.svg" },
            { name: "Te Kahui Reo", file: "/brand/te-kahui-reo-logo.svg" },
            { name: "Brand Video (GIF)", file: BRAND_VIDEO_URL },
          ].map((asset) => (
            <a
              key={asset.file}
              href={asset.file}
              download
              className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.5)", border: `1px solid ${TEAL}20` }}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#FAFBFC]">
                <img loading="lazy" decoding="async" src={asset.file} alt={asset.name} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-[10px] font-medium text-center" style={{ color: CHARCOAL }}>
                {asset.name}
              </span>
              <Download className="w-3 h-3" style={{ color: POUNAMU }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
