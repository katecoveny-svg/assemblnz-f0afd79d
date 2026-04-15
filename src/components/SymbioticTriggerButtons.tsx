/**
 * Symbiotic Trigger Buttons — One-click cross-sector actions
 * Place on kete dashboards to enable cross-pollination.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Video, Package, FileText, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { agentChat } from "@/lib/agentChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TriggerDef {
  id: string;
  label: string;
  description: string;
  fromKete: string;
  toKete: string;
  fromColor: string;
  toColor: string;
  icon: React.ElementType;
  prompt: (context: string) => string;
  toAgentId: string;
}

const TRIGGERS: TriggerDef[] = [
  {
    id: "construction-to-creative",
    label: "Send to Creative",
    description: "Generate a 15-second TikTok-style video from this milestone",
    fromKete: "waihanga", toKete: "auaha",
    fromColor: "#3A7D6E", toColor: "#F0D078",
    icon: Video,
    toAgentId: "rhythm",
    prompt: (ctx) => `Create a 15-second TikTok-style video concept for this construction milestone. Use the brand voice from Brand DNA if available. NZ market context.\n\nMilestone:\n${ctx}`,
  },
  {
    id: "freight-to-hospitality",
    label: "Scan for Inventory",
    description: "Identify hospitality items in this shipment",
    fromKete: "pikau", toKete: "manaaki",
    fromColor: "#5AADA0", toColor: "#D4A843",
    icon: Package,
    toAgentId: "aura",
    prompt: (ctx) => `Scan this customs/freight document and identify any items relevant to a hospitality business (food, beverages, equipment, linen, amenities). List what was found with quantities and suggest where they should be allocated.\n\nDocument:\n${ctx}`,
  },
  {
    id: "creative-to-construction",
    label: "Generate Site Report",
    description: "Turn creative assets into a formatted site progress report",
    fromKete: "auaha", toKete: "waihanga",
    fromColor: "#F0D078", toColor: "#3A7D6E",
    icon: FileText,
    toAgentId: "kanohi",
    prompt: (ctx) => `Generate a professional NZ construction site progress report from the following creative/photo assets. Include safety observations, progress percentage estimates, and next steps. Building Act 2004 compliant format.\n\nAssets:\n${ctx}`,
  },
  {
    id: "hospitality-to-creative",
    label: "Create Social Post",
    description: "Generate social media content from this event/booking",
    fromKete: "manaaki", toKete: "auaha",
    fromColor: "#D4A843", toColor: "#F0D078",
    icon: Video,
    toAgentId: "prism",
    prompt: (ctx) => `Create an engaging social media post (Instagram + Facebook) for this hospitality event/booking. Use NZ English, include relevant hashtags, and suggest an image prompt. Brand DNA tone if available.\n\nEvent:\n${ctx}`,
  },
];

interface Props {
  /** Which kete is this button placed on */
  sourceKete: string;
  /** Context text to send (milestone description, shipment details, etc.) */
  context: string;
  /** Agent colour for styling */
  agentColor?: string;
}

export default function SymbioticTriggerButtons({ sourceKete, context, agentColor = "#D4A843" }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  const availableTriggers = TRIGGERS.filter(t => t.fromKete === sourceKete);

  if (availableTriggers.length === 0) return null;

  const handleTrigger = async (trigger: TriggerDef) => {
    if (!context.trim()) {
      toast.error("No context to send — select or describe content first");
      return;
    }

    setLoading(trigger.id);
    try {
      const response = await agentChat({
        agentId: trigger.toAgentId,
        packId: trigger.toKete,
        message: trigger.prompt(context.substring(0, 3000)),
        userId: user?.id,
      });

      setResults(prev => ({ ...prev, [trigger.id]: response }));

      // Log the symbiotic trigger
      if (user) {
        try {
          await supabase.from("agent_triggers").insert({
            user_id: user.id,
            trigger_agent: sourceKete,
            trigger_event: trigger.id,
            target_agent: trigger.toAgentId,
            target_action: trigger.label,
            payload: { context: context.substring(0, 500), response: response.substring(0, 500) },
          });
        } catch { /* silent */ }
      }

      toast.success(`${trigger.label} complete — ${trigger.toKete} responded`);
    } catch (e: any) {
      toast.error(e.message || "Trigger failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[9px] font-display uppercase tracking-[3px] text-white/25 mb-1">
        <Zap size={10} className="text-pounamu" />
        Symbiotic Actions
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTriggers.map((trigger) => {
          const Icon = trigger.icon;
          const isLoading = loading === trigger.id;
          const hasResult = !!results[trigger.id];

          return (
            <button
              key={trigger.id}
              onClick={() => handleTrigger(trigger)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-body font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 group"
              style={{
                background: hasResult ? "rgba(0,168,107,0.08)" : `${trigger.toColor}08`,
                border: `1px solid ${hasResult ? "rgba(0,168,107,0.2)" : `${trigger.toColor}20`}`,
                color: hasResult ? "#00A86B" : trigger.toColor,
              }}
              title={trigger.description}
            >
              {isLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : hasResult ? (
                <CheckCircle2 size={12} />
              ) : (
                <Icon size={12} />
              )}
              <span className="px-1 py-0.5 rounded text-[8px] uppercase tracking-wider" style={{ background: `${trigger.fromColor}15`, color: trigger.fromColor }}>
                {trigger.fromKete}
              </span>
              <ArrowRight size={8} className="opacity-40" />
              <span className="px-1 py-0.5 rounded text-[8px] uppercase tracking-wider" style={{ background: `${trigger.toColor}15`, color: trigger.toColor }}>
                {trigger.toKete}
              </span>
              <span className="ml-0.5">{trigger.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <AnimatePresence>
        {Object.entries(results).map(([id, result]) => {
          const trigger = TRIGGERS.find(t => t.id === id);
          if (!trigger) return null;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl p-3 text-[11px] font-body text-white/60 leading-relaxed max-h-48 overflow-y-auto"
              style={{ background: `${trigger.toColor}06`, border: `1px solid ${trigger.toColor}12` }}
            >
              <div className="flex items-center gap-1.5 mb-2 text-[9px] font-display uppercase tracking-[2px]" style={{ color: trigger.toColor }}>
                <Zap size={10} />
                {trigger.toKete} response
              </div>
              <div className="whitespace-pre-wrap">{result}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
