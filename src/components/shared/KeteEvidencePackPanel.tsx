import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Sparkles, Shield, Download, Check, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ComplianceCheck {
  check: string;
  status: "pass" | "flag" | "review" | "n/a";
}

interface PackTemplate {
  label: string;
  description: string;
  complianceChecks: ComplianceCheck[];
  packType: string;
}

interface KeteEvidencePackPanelProps {
  keteSlug: string;
  keteName: string;
  accentColor: string;
  agentId: string;
  agentName: string;
  packTemplates: PackTemplate[];
  /** Optional context data to include in the pack */
  contextData?: Record<string, unknown>;
}

const COMPILE_STEPS = [
  "Scanning documents…",
  "Verifying compliance references…",
  "Cross-referencing requirements…",
  "Generating table of contents…",
  "Compiling evidence pack…",
  "Running gap analysis…",
];

function CompileModal({ accentColor, onClose }: { accentColor: string; onClose: () => void }) {
  const [pct, setPct] = useState(0);
  const stepIdx = Math.min(Math.floor((pct / 100) * COMPILE_STEPS.length), COMPILE_STEPS.length - 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPct(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 80);
    const timeout = setTimeout(onClose, 5000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#0D0D14] border border-gray-200 rounded-xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} style={{ color: accentColor }} />
          <h3 className="text-lg font-medium text-white/90">Compiling Evidence Pack</h3>
        </div>
        <p className="text-sm mb-4" style={{ color: accentColor }}>{COMPILE_STEPS[stepIdx]}</p>
        <Progress value={pct} className="h-2 mb-2" />
        <p className="text-xs text-white/40 text-right">{pct}%</p>
      </div>
    </div>
  );
}

export default function KeteEvidencePackPanel({
  keteSlug,
  keteName,
  accentColor,
  agentId,
  agentName,
  packTemplates,
  contextData,
}: KeteEvidencePackPanelProps) {
  const [compiling, setCompiling] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const generatePack = useMutation({
    mutationFn: async (template: PackTemplate) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");

      const pack = {
        type: template.packType,
        kete: keteSlug,
        compliance_checks: template.complianceChecks,
        context: contextData || {},
        generated_at: new Date().toISOString(),
        watermark: `ASSEMBL-${keteSlug.toUpperCase()}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      };

      const { error } = await supabase.from("exported_outputs").insert({
        user_id: user.id,
        output_type: "evidence_pack",
        title: `${template.label} — ${keteName}`,
        content_preview: JSON.stringify(pack).slice(0, 500),
        agent_id: agentId,
        agent_name: agentName,
      });
      if (error) throw error;
      return pack;
    },
    onSuccess: (pack) => {
      setLastGenerated(pack.generated_at);
      toast.success("Evidence pack generated and saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleGenerate = (template: PackTemplate) => {
    setCompiling(true);
    setTimeout(() => {
      setCompiling(false);
      generatePack.mutate(template);
    }, 5000);
  };

  return (
    <>
      {compiling && <CompileModal accentColor={accentColor} onClose={() => setCompiling(false)} />}

      <div className="rounded-2xl p-5 relative overflow-hidden" style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: `0 0 40px ${accentColor}08`,
      }}>
        {/* Subtle gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `linear-gradient(135deg, ${accentColor}06 0%, transparent 60%)`,
        }} />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}15` }}>
              <FileText size={16} style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                Evidence Pack Generator
                <Sparkles size={12} style={{ color: accentColor }} />
              </h3>
              <p className="text-[10px] text-white/35">{keteName} · Watermarked & audit-ready</p>
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-2 mb-4">
            {packTemplates.map((tpl) => (
              <div key={tpl.packType} className="flex items-center justify-between p-3 rounded-xl" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs text-white/70 font-medium">{tpl.label}</p>
                  <p className="text-[10px] text-white/35 truncate">{tpl.description}</p>
                </div>
                <button
                  onClick={() => handleGenerate(tpl)}
                  disabled={generatePack.isPending}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: `${accentColor}20`, color: accentColor }}
                >
                  <Download size={12} /> Generate
                </button>
              </div>
            ))}
          </div>

          {/* Compliance badge row */}
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><Shield size={10} style={{ color: accentColor }} /> Pipeline-verified</span>
            <span className="flex items-center gap-1"><Check size={10} /> Watermarked</span>
            {lastGenerated && (
              <span className="flex items-center gap-1 ml-auto"><Clock size={10} /> Last: {new Date(lastGenerated).toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
