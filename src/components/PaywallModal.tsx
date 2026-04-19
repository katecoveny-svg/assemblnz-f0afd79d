import { X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { assemblMark } from "@/assets/brand";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/data/stripeTiers";
import { toast } from "sonner";

interface Props {
  type: "preview" | "daily_limit";
  agentName?: string;
  open: boolean;
  onClose: () => void;
}

const PaywallModal = ({ type, agentName, open, onClose }: Props) => {
  const [loading, setLoading] = useState<string | null>(null);

  if (!open) return null;

  const handleCheckout = async (priceId: string, label: string) => {
    setLoading(label);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-primary/15 bg-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>

        <div className="text-center space-y-4">
          <img src={assemblMark} alt="Assembl" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(212,168,67,0.25)] mx-auto" >

          {type === "preview" ? (
            <>
              <h2 className="text-lg font-bold text-foreground">
                You've enjoyed your free preview{agentName ? ` of ${agentName}` : ""}
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign up free to keep chatting — or upgrade for full access.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/signup"
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  Create free account
                </Link>
                <Link
                  to="/pricing"
                  className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground/70 text-center hover:text-foreground hover:border-foreground/10 transition-colors"
                >
                  See pricing
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground">
                You've reached today's free limit
              </h2>
              <p className="text-sm text-muted-foreground">
                Upgrade for unlimited access to all agents and premium features.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleCheckout(STRIPE_TIERS.pro.price_id, "pro")}
                  disabled={loading === "pro"}
                  className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all"
                  style={{ background: "#5AADA0", color: "#0A0A14" }}
                >
                  {loading === "pro" ? <Loader2 size={16} className="inline animate-spin" /> : "Leader — $1,290/mo (recommended)"}
                </button>
                <button
                  onClick={() => handleCheckout(STRIPE_TIERS.starter.price_id, "starter")}
                  disabled={loading === "starter"}
                  className="block w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground/70 text-center hover:text-foreground hover:border-foreground/10 transition-colors"
                >
                  {loading === "starter" ? <Loader2 size={16} className="inline animate-spin" /> : "Operator — $590/mo"}
                </button>
                <Link
                  to="/pricing"
                  className="block w-full py-2 text-xs text-muted-foreground text-center hover:text-foreground transition-colors"
                >
                  See all plans →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
