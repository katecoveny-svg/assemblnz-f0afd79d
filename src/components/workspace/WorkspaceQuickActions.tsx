/**
 * WorkspaceQuickActions — polished launchpad card for the workspace dashboard.
 * Surfaces the most common in-product actions with beautiful hover states.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, Users, FileText, Plug, Brain, Shield, ArrowRight,
} from "lucide-react";

interface QuickAction {
  label: string;
  desc: string;
  to: string;
  icon: typeof Play;
}

const ACTIONS: QuickAction[] = [
  { label: "Run a workflow", desc: "Pick a kete & start", to: "/workspace/workflows", icon: Play },
  { label: "Browse agents", desc: "46 specialists", to: "/agents", icon: Users },
  { label: "Evidence packs", desc: "Past results", to: "/workspace/evidence", icon: FileText },
  { label: "Connect tools", desc: "Stripe, Xero, more", to: "/workspace/connections", icon: Plug },
  { label: "Memory & training", desc: "Tune your agents", to: "/workspace/memory", icon: Brain },
  { label: "Compliance hub", desc: "Live NZ regs", to: "/workspace/compliance", icon: Shield },
];

interface WorkspaceQuickActionsProps {
  accent: string;
}

export default function WorkspaceQuickActions({ accent }: WorkspaceQuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-xl p-5"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(74,165,168,0.15)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif", letterSpacing: "1px" }}
        >
          <span className="w-1 h-4 rounded-full" style={{ background: accent }} />
          Quick actions
        </h2>
        <Link
          to="/agents"
          className="text-[11px] flex items-center gap-1 transition-colors"
          style={{ color: accent }}
        >
          See all <ArrowRight size={10} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              className="group relative p-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${accent}08`;
                e.currentTarget.style.borderColor = `${accent}30`;
                e.currentTarget.style.boxShadow = `0 6px 16px ${accent}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.6)";
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center mb-2 transition-colors"
                style={{
                  background: `${accent}12`,
                  color: accent,
                }}
              >
                <Icon size={14} />
              </div>
              <p className="text-[12px] font-semibold leading-tight" style={{ color: "#3D4250" }}>
                {a.label}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>
                {a.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
