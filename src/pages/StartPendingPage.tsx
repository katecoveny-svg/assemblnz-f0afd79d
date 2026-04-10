import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Search, FileText, ShieldCheck, CheckCircle2 } from "lucide-react";

const STAGES = [
  { key: "scraping", icon: Globe, label: "Reading your site…", duration: 8000 },
  { key: "classifying", icon: Search, label: "Analysing your industry…", duration: 5000 },
  { key: "planning", icon: FileText, label: "Drafting your plan…", duration: 12000 },
  { key: "checking", icon: ShieldCheck, label: "Running compliance checks…", duration: 4000 },
  { key: "done", icon: CheckCircle2, label: "Plan ready.", duration: 0 },
];

const StartPendingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);
  const [status, setStatus] = useState<string>("pending");

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
        if (data.pipeline_status === "complete" && data.plan_html_url) {
          clearInterval(interval);
          // Small delay to show the "done" animation
          setTimeout(() => {
            window.location.href = data.plan_html_url;
          }, 1500);
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
    if (status === "complete") setCurrentStage(STAGES.length - 1);
  }, [status]);

  if (status === "exception") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-10">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">a</span>
          </div>
          <span className="text-foreground font-semibold">assembl</span>
        </div>

        {/* Stages */}
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
                animate={{
                  opacity: isFuture ? 0.3 : 1,
                  y: 0,
                }}
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
                  isActive
                    ? "bg-primary/20"
                    : isDone
                      ? "bg-primary/10"
                      : "bg-muted"
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
        </div>

        <p className="text-xs text-muted-foreground text-center">
          This usually takes 2–3 minutes. You can close this tab — we'll email you the link.
        </p>
      </div>
    </div>
  );
};

export default StartPendingPage;
