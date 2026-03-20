import { X } from "lucide-react";
import { Link } from "react-router-dom";
import nexusLogo from "@/assets/nexus-logo.png";

interface Props {
  type: "preview" | "daily_limit";
  agentName?: string;
  open: boolean;
  onClose: () => void;
}

const PaywallModal = ({ type, agentName, open, onClose }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-primary/15 bg-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>

        <div className="text-center space-y-4">
          <AssemblLogo size={40} />

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
                <a
                  href="https://buy.stripe.com/bJebJ3gq0dkA6570Ki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all"
                  style={{ background: "#00FF88", color: "#0A0A14" }}
                >
                  Pro — $249/mo (recommended)
                </a>
                <a
                  href="https://buy.stripe.com/dRm3cx2za1BSctvdx4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground/70 text-center hover:text-foreground hover:border-foreground/10 transition-colors"
                >
                  Starter — $79/mo
                </a>
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
