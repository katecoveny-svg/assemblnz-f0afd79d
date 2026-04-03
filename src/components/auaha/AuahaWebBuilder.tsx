import { Globe, Sparkles, Code, FileText, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ACCENT = "#F0D078";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaWebBuilder() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Web Builder</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Website Builder</h1>
        <p className="text-white/50 text-sm mt-1">Powered by PIXEL, MUSE & CHROMATIC</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: FileText, title: "Site Structure", desc: "PIXEL generates sitemap and page hierarchy from your brief", action: "Generate Structure" },
          { icon: Palette, title: "Design System", desc: "CHROMATIC creates colour scheme and component library", action: "Create Design" },
          { icon: Code, title: "Export Code", desc: "Download as HTML/React or push to GitHub", action: "Export" },
        ].map((card) => (
          <GlassCard key={card.title} className="p-6 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `2px solid ${ACCENT}33` }}>
              <card.icon className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <h3 className="text-white text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-white/40 text-xs mb-4">{card.desc}</p>
            <Button onClick={() => toast.info("Coming soon")} style={{ background: ACCENT, color: "#000" }} className="w-full">
              {card.action} <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6">
        <label className="text-white/50 text-xs block mb-2">Website Concept Brief</label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none min-h-[120px]"
          placeholder="Describe the website you want to build. What's it for? Who's the audience? What pages do you need?"
        />
        <Button onClick={() => toast.info("Web generation coming soon")} className="mt-3" style={{ background: ACCENT, color: "#000" }}>
          Generate Website <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </GlassCard>
    </div>
  );
}
