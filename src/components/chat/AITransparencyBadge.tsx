import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NeonBrain, NeonShield, NeonGlobe, NeonCheckmark, NeonClipboard, NeonSiren } from "@/components/NeonIcons";

const AITransparencyBadge = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.04)" }}>
        <span className="text-[10px]" style={{ color: "#ffffff20" }}>
          <span className="inline-flex align-middle mr-0.5"><NeonBrain size={10} color="#ffffff20" /></span> AI-generated response — verify with a qualified professional ·{" "}
          <button
            onClick={() => setOpen(true)}
            className="underline hover:text-foreground/30 transition-colors"
            style={{ color: "#ffffff20" }}
          >
            How this works
          </button>
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">How Assembl AI Works</DialogTitle>
            <DialogDescription className="sr-only">Information about Assembl's AI technology, data handling, and security</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 text-xs text-foreground/70">
            {/* AI Model */}
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><NeonBrain size={14} /> AI Model</h4>
              <p>Assembl agents are powered by leading AI models from providers committed to safety and responsible AI. We deliver fast, accurate, industry-specific responses grounded in New Zealand legislation and standards.</p>
            </div>

            {/* Data Handling */}
            <div>
            <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><NeonShield size={14} color="hsl(42,63%,55%)" /> Your data is taonga</h4>
              <p className="mb-2 text-foreground/60">Taonga means treasure in Te Reo Māori. We treat every piece of your data with the care it deserves.</p>
              <ul className="space-y-1.5 list-none">
                <li>• Conversations are processed in real-time via secure AI APIs</li>
                <li>• Your data is <strong className="text-foreground">not used to train AI models</strong></li>
                <li>• Uploaded documents are processed for the current session only</li>
                <li>• Conversation history is stored securely for your convenience and can be deleted at any time</li>
                <li>• No conversation data is shared with third parties</li>
                <li>• Message metadata (timestamps, agent used) is stored for usage analytics</li>
              </ul>

            {/* IPP 3A Indirect Collection */}
            <div className="mt-3 p-2.5 rounded-lg border" style={{ borderColor: "hsl(42 63% 55% / 0.2)", background: "hsl(42 63% 55% / 0.05)" }}>
              <h5 className="font-semibold text-foreground text-[11px] mb-1">IPP 3A — Indirect Collection (Privacy Act 2020)</h5>
              <p className="text-foreground/50 text-[10px] leading-relaxed">Effective 1 May 2026, when our specialist advisors use information originally provided to a different advisor (e.g. business details shared with AROHA used by LEDGER for payroll), or retrieved from public registries (Companies Office, NZBN), you will be notified of the source, purpose, and your rights to access, correct, or delete that information. You can opt out of cross-advisor data sharing at any time via your settings or by contacting <a href="mailto:kate@assembl.co.nz" className="text-primary underline">kate@assembl.co.nz</a>.</p>
            </div>
            </div>

            {/* Data Sovereignty */}
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><NeonGlobe size={14} /> Data Sovereignty</h4>
              <p>Your conversations are processed via secure AI infrastructure. We acknowledge this means data may cross NZ borders during processing. Mitigations include:</p>
              <ul className="space-y-1 list-none mt-1.5">
                <li>• Data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>• AI providers do not retain or use your data for training</li>
                <li>• Our backend infrastructure uses industry-standard security practices</li>
                <li>• User account data and metadata is stored in secure cloud infrastructure</li>
              </ul>
            </div>

            {/* Accuracy */}
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><NeonCheckmark size={14} /> Accuracy & Quality</h4>
              <p>Every agent is configured with NZ-specific legislation, standards, and industry knowledge through carefully maintained system prompts. Our accuracy measures include:</p>
              <ul className="space-y-1 list-none mt-1.5">
                <li>• Direct references to NZ legislation (legislation.govt.nz)</li>
                <li>• Regular prompt updates to reflect law changes</li>
                <li>• Source citations in every response</li>
                <li>• Industry-specific knowledge bases per agent</li>
              </ul>
              <p className="mt-1.5 font-medium text-foreground/50">AI can make mistakes. Always verify important decisions with a qualified professional.</p>
            </div>

            {/* Security Architecture */}
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><NeonShield size={14} /> Security Architecture</h4>
              <ul className="space-y-1 list-none">
                <li>• All API keys are stored as encrypted environment variables — never exposed to client-side code</li>
                <li>• Agent system prompts are executed server-side only (protected intellectual property)</li>
                <li>• Row-level security ensures users can only access their own data</li>
                <li>• Authentication via secure session tokens with automatic refresh</li>
                <li>• All communication uses HTTPS/TLS encryption</li>
              </ul>
            </div>

            {/* Privacy Compliance */}
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><NeonClipboard size={14} /> NZ Privacy Compliance</h4>
              <p>Assembl is committed to compliance with the <strong className="text-foreground">New Zealand Privacy Act 2020</strong>. Our practices align with the 13 Information Privacy Principles (IPPs). For full details, see our <a href="/privacy" className="text-primary underline hover:text-primary/80">Privacy Policy</a>.</p>
            </div>

            {/* Incident Response */}
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><NeonSiren size={14} /> Incident Response</h4>
              <p>In the event of a data breach or security incident:</p>
              <ul className="space-y-1 list-none mt-1.5">
                <li>• Affected users will be notified within 72 hours</li>
                <li>• The Office of the Privacy Commissioner will be notified as required under the Privacy Act 2020</li>
                <li>• Immediate containment and remediation steps will be taken</li>
                <li>• A post-incident review will be conducted</li>
              </ul>
            </div>

            <div className="pt-3" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}>
              <p className="text-[10px] flex items-center gap-1" style={{ color: "#ffffff15" }}>
                © 2026 Assembl. All rights reserved. Agent designs, system prompts, and automation workflows are proprietary trade secrets of Assembl. · Auckland, New Zealand · Built in Aotearoa
              </p>
              <div className="flex gap-3 mt-2">
                <a href="/privacy" className="text-[10px] text-primary/60 hover:text-primary underline">Privacy Policy</a>
                <a href="/terms" className="text-[10px] text-primary/60 hover:text-primary underline">Terms of Use</a>
                <a href="/disclaimer" className="text-[10px] text-primary/60 hover:text-primary underline">Disclaimer</a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AITransparencyBadge;
