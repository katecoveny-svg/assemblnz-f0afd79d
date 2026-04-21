import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/data/stripeTiers";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Search, FileText, ShieldCheck, CheckCircle2, ArrowRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import LightPageShell from "@/components/LightPageShell";
import { assemblWordmark } from "@/assets/brand";

const STAGES = [
  { key: "scraping", icon: Globe, label: "Reading your site…", duration: 8000 },
  { key: "classifying", icon: Search, label: "Analysing your industry…", duration: 5000 },
  { key: "planning", icon: FileText, label: "Drafting your plan…", duration: 12000 },
  { key: "checking", icon: ShieldCheck, label: "Running compliance checks…", duration: 4000 },
  { key: "done", icon: CheckCircle2, label: "Plan ready.", duration: 0 },
];

const PLANS = [
  {
    key: "starter",
    name: "Operator",
    price: "$590",
    period: "/mo",
    setup: "$1,490 setup",
    desc: "1 kete · up to 5 seats",
    priceId: STRIPE_TIERS.starter.price_id,
    recommended: false,
  },
  {
    key: "pro",
    name: "Leader",
    price: "$1,290",
    period: "/mo",
    setup: "$1,990 setup",
    desc: "2 kete · up to 15 seats · quarterly compliance review",
    priceId: STRIPE_TIERS.pro.price_id,
    recommended: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "$2,890",
    period: "/mo",
    setup: "$2,990 setup",
    desc: "All 7 industry kete + Tōro · unlimited seats · 99.9% SLA",
    priceId: STRIPE_TIERS.enterprise.price_id,
    recommended: false,
  },
];

const StartPendingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);
  const [status, setStatus] = useState<string>("pending");
  const [planUrl, setPlanUrl] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Poll for pipeline status
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("tenant_intake")
        .select("pipeline_status, plan_html_url, exception_path")
        .eq("id", id)
        .single();

      if (data) {
        setStatus(data.pipeline_status);
        if (data.pipeline_status === "complete") {
          clearInterval(interval);
          setPlanUrl(data.plan_html_url);
        } else if (data.pipeline_status === "exception") {
          clearInterval(interval);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, navigate]);

  // Animate through stages
  useEffect(() => {
    if (currentStage >= STAGES.length - 1) return;
    const timeout = setTimeout(() => {
      setCurrentStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, STAGES[currentStage].duration);
    return () => clearTimeout(timeout);
  }, [currentStage]);

  // If pipeline completes before animation, jump to done
  useEffect(() => {
    if (status === "complete") {
      setCurrentStage(STAGES.length - 1);
      // Show plan selection after a beat
      setTimeout(() => setShowPlans(true), 1200);
    }
  }, [status]);

  const handleCheckout = async (priceId: string, key: string) => {
    setCheckoutLoading(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (status === "exception") {
    return (
      <LightPageShell>
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              We need a few hours to set this up properly.
            </h1>
            <p className="text-sm text-muted-foreground">
              We'll email you as soon as your plan is ready. It usually takes less than 24 hours.
            </p>
          </div>
        </div>
      </LightPageShell>
    );
  }

  return (
    <LightPageShell>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full space-y-10">
          {/* Wordmark */}
          <div className="flex items-center justify-center">
            <img src={assemblWordmark} alt="assembl" className="h-7 w-auto" />
          </div>

        {/* Stages */}
        {!showPlans && (
          <div className="space-y-4">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isActive = i === currentStage;
              const isDone = i < currentStage;
              const isFuture = i > currentStage;

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isFuture ? 0.3 : 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : isDone
                        ? "border-border/30 bg-card/30"
                        : "border-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? "bg-primary/20" : isDone ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {isActive ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? "text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/50"
                  }`}>
                    {stage.label}
                  </span>
                </motion.div>
              );
            })}

            <p className="text-xs text-muted-foreground text-center">
              This usually takes 2–3 minutes. You can close this tab — we'll email you the link.
            </p>
          </div>
        )}

        {/* Plan selection */}
        <AnimatePresence>
          {showPlans && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <h2 className="text-xl font-bold text-foreground">Your plan is ready</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a tier to activate your workspace and start working with your agents.
                </p>
              </div>

              {planUrl && (
                <a
                  href={planUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  View your personalised plan
                </a>
              )}

              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.key}
                    onClick={() => handleCheckout(plan.priceId, plan.key)}
                    disabled={!!checkoutLoading}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      plan.recommended
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/60 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                          {plan.recommended && (
                            <span className="text-[10px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{plan.setup} (split across first 3 invoices)</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-lg font-bold text-foreground">{plan.price}</span>
                        <span className="text-xs text-muted-foreground">{plan.period}</span>
                        {checkoutLoading === plan.key ? (
                          <div className="mt-1">
                            <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />
                          </div>
                        ) : (
                          <div className="mt-1">
                            <CreditCard className="w-4 h-4 text-muted-foreground ml-auto" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                All prices NZD excl. GST. Setup fees can be split across your first 3 invoices.
                <br />
                Need a custom solution?{" "}
                <a href="/contact" className="text-primary underline underline-offset-2">Talk to us</a>.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground py-2"
              >
                Skip for now — continue on free tier →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StartPendingPage;
