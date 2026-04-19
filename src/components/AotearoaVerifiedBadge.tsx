/**
 * Aotearoa Verified Badge — Gamified compliance status
 * Shows verification progress across H&S, Customs, Brand Scan.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, HardHat, Package, Palette, CheckCircle2, Circle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrandDna } from "@/contexts/BrandDnaContext";

const GOLD = "#D4A843";
const POUNAMU = "#00A86B";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

interface VerificationStep {
  id: string;
  label: string;
  icon: React.ElementType;
  completed: boolean;
  description: string;
}

export default function AotearoaVerifiedBadge({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { brand } = useBrandDna();
  const [steps, setSteps] = useState<VerificationStep[]>([
    { id: "brand", label: "Brand Scan", icon: Palette, completed: false, description: "Complete a brand DNA scan" },
    { id: "hs", label: "H&S Check", icon: HardHat, completed: false, description: "Submit a Health & Safety compliance check" },
    { id: "customs", label: "Customs Declaration", icon: Package, completed: false, description: "Process a customs/freight document" },
    { id: "signoff", label: "HITL Sign-Off", icon: ShieldCheck, completed: false, description: "Verify & sign off an AI output" },
  ]);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const [brandRes, memRes] = await Promise.all([
        supabase.from("brand_identities").select("id").eq("user_id", user.id).limit(1),
        supabase.from("agent_memory").select("memory_key").eq("user_id", user.id).limit(100),
      ]);

      const hasBrand = (brandRes.data?.length || 0) > 0 || !!brand;
      const keys = (memRes.data || []).map((m) => m.memory_key);
      const hasHS = keys.some((k) => k.includes("safety") || k.includes("hs-") || k.includes("waihanga"));
      const hasCustoms = keys.some((k) => k.includes("customs") || k.includes("freight") || k.includes("arataki"));
      const hasSignoff = keys.some((k) => k.includes("signoff"));

      setSteps((prev) => prev.map((s) => ({
        ...s,
        completed:
          s.id === "brand" ? hasBrand :
          s.id === "hs" ? hasHS :
          s.id === "customs" ? hasCustoms :
          s.id === "signoff" ? hasSignoff :
          false,
      })));
    };
    check();
  }, [user, brand]);

  const completedCount = steps.filter((s) => s.completed).length;
  const allComplete = completedCount === steps.length;
  const progressPercent = (completedCount / steps.length) * 100;

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{
          background: allComplete ? "rgba(0,168,107,0.15)" : "rgba(212,168,67,0.1)",
          border: `1px solid ${allComplete ? "rgba(0,168,107,0.3)" : "rgba(212,168,67,0.2)"}`,
          color: allComplete ? POUNAMU : GOLD,
        }}
      >
        {allComplete ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
        {allComplete ? "Aotearoa Verified ✓" : `${completedCount}/${steps.length} Verified`}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 space-y-5" style={GLASS}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${allComplete ? "bg-[#00A86B]/20" : "bg-white/5"}`}>
            {allComplete
              ? <Star className="w-8 h-8 text-[#00A86B]" />
              : <Shield className="w-8 h-8 text-gray-400" />}
          </div>
          {allComplete && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#00A86B] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-foreground" />
            </motion.div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: allComplete ? POUNAMU : "white" }}>
            {allComplete ? "Aotearoa Verified" : "Verification Progress"}
          </h3>
          <p className="text-xs text-white/40">
            {allComplete
              ? "100% Compliant · 100% Brand Aligned"
              : `Complete all checks to earn your verified status`}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-white/40">{completedCount} of {steps.length} complete</span>
          <span className="font-bold" style={{ color: allComplete ? POUNAMU : GOLD }}>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: allComplete ? POUNAMU : `linear-gradient(90deg, ${GOLD}, ${POUNAMU})` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: step.completed ? "rgba(0,168,107,0.05)" : "transparent" }}
          >
            {step.completed
              ? <CheckCircle2 className="w-5 h-5 text-[#00A86B] shrink-0" />
              : <Circle className="w-5 h-5 text-white/15 shrink-0" />}
            <step.icon className="w-4 h-4 shrink-0" style={{ color: step.completed ? POUNAMU : "rgba(255,255,255,0.3)" }} />
            <div className="flex-1">
              <p className={`text-sm ${step.completed ? "text-white/80" : "text-white/40"}`}>{step.label}</p>
              <p className="text-[10px] text-white/25">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
