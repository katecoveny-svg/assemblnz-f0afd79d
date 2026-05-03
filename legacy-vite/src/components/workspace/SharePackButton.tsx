// ═══════════════════════════════════════════════════════════════
// "Share this pack" affordance — owner-only.
// Mints a share_token if missing and copies the public URL to clipboard.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { Share2, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface SharePackButtonProps {
  packId: string;
  /** Existing token if already shared. */
  existingToken?: string | null;
  isPubliclyShared?: boolean;
  accent?: string;
}

function makeToken(): string {
  // 16-char URL-safe token; collisions effectively zero for this scale.
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16);
}

export default function SharePackButton({ packId, existingToken, isPubliclyShared, accent = "#4AA5A8" }: SharePackButtonProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState(existingToken ?? null);
  const [shared, setShared] = useState(!!isPubliclyShared);

  async function share() {
    setBusy(true);
    try {
      let nextToken = token;
      if (!nextToken) nextToken = makeToken();

      const { error } = await supabase
        .from("evidence_packs")
        .update({
          share_token: nextToken,
          is_publicly_shared: true,
          shared_at: new Date().toISOString(),
        })
        .eq("id", packId);

      if (error) throw error;

      const url = `${window.location.origin}/evidence/share/${nextToken}`;
      await navigator.clipboard.writeText(url);
      setToken(nextToken);
      setShared(true);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch (e: any) {
      toast.error(e.message || "Could not create share link");
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("evidence_packs")
        .update({ is_publicly_shared: false })
        .eq("id", packId);
      if (error) throw error;
      setShared(false);
      toast.success("Share link revoked");
    } catch (e: any) {
      toast.error(e.message || "Could not revoke link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={share}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors disabled:opacity-50"
        style={{
          background: shared ? `${accent}18` : `${accent}12`,
          color: accent,
          border: `1px solid ${accent}30`,
        }}
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : copied ? <Check size={12} /> : <Share2 size={12} />}
        {copied ? "Copied" : shared ? "Copy share link" : "Share pack"}
      </button>
      {shared && (
        <button
          onClick={revoke}
          disabled={busy}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px]"
          style={{ background: "rgba(0,0,0,0.04)", color: "#6B7280" }}
          title="Revoke share link"
        >
          <X size={10} /> Revoke
        </button>
      )}
    </div>
  );
}
