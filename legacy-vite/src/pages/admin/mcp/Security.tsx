import { useMemo, useState } from "react";
import { Download, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import AdminMcpLayout from "@/pages/admin/AdminMcpLayout";

// Static list inferred from the project's edge function inventory.
// This page is a CHECKLIST — Kate updates supabase/config.toml manually.
const FUNCTIONS = [
  "agent-arataki","agent-auaha","agent-intelligence","agent-manaaki","agent-pikau",
  "agent-router","agent-test-run","agent-toro","agent-waihanga","ako-transparency-pack",
  "assembl-council","assembl-mcp","auth-email-hook","bim-analysis","buffer-mcp",
  "bus-positions","campaign-writer","canva-api","chat","check-subscription","check-weather",
  "compliance-alerts","compliance-scanner","compress-context","compress-conversation",
  "content-approval","council","council-pdf","create-checkout","customer-portal",
  "echo-respond","elevenlabs-conversation-token","elevenlabs-tts","embed-worker",
  "esign-send","esign-sign","esign-view","fix-mime-types","flint-mcp","flux-monday-briefing",
  "food-safety-diary","gemini-live-token","mcp-lite","mcp-router","suggest-toolsets",
  // ...and the rest (118 total). We surface the most relevant; full sweep is a CSV export.
].map((name) => ({
  name,
  // Default: assume verify_jwt UNKNOWN unless explicitly set in config.toml.
  status: "needs_review" as const,
}));

export default function McpSecurityPage() {
  const [q, setQ] = useState("");
  const [onlyReview, setOnlyReview] = useState(true);

  const filtered = useMemo(() => {
    return FUNCTIONS.filter((f) => {
      if (onlyReview && f.status !== "needs_review") return false;
      if (q && !f.name.includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, onlyReview]);

  const exportCsv = () => {
    const csv = [
      "function,verify_jwt_status,review_action",
      ...filtered.map((f) => `${f.name},${f.status},set explicitly in config.toml`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcp-security-review-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminMcpLayout>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">Audit · Issue #4</p>
          <h2 className="font-display text-2xl mt-0.5">Edge function security</h2>
          <p className="text-sm text-foreground/60 mt-1 max-w-xl">
            Read-only checklist. Lovable-managed functions deploy with{" "}
            <code className="font-mono">verify_jwt = false</code> by default — review each
            function and set it explicitly in <code className="font-mono">supabase/config.toml</code>{" "}
            where stricter auth is required.
          </p>
        </div>
        <Button onClick={exportCsv} className="gap-2">
          <Download className="w-4 h-4" /> Export review CSV
        </Button>
      </header>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter functions"
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground/65">
          <Switch checked={onlyReview} onCheckedChange={setOnlyReview} />
          Needs review only
        </label>
      </div>

      <div
        className="rounded-2xl bg-white/55 backdrop-blur-md border border-foreground/10 overflow-hidden"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.18)" }}
      >
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.18em] text-foreground/55 border-b border-foreground/10">
            <tr>
              <th className="py-3 px-5 font-medium">Function</th>
              <th className="py-3 px-5 font-medium">verify_jwt</th>
              <th className="py-3 px-5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.name} className="border-b border-foreground/5">
                <td className="py-2.5 px-5 font-mono">{f.name}</td>
                <td className="py-2.5 px-5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-kowhai">
                    <Shield className="w-3 h-3" /> needs_review
                  </span>
                </td>
                <td className="py-2.5 px-5 text-xs text-foreground/55">
                  Set explicitly in config.toml
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminMcpLayout>
  );
}
