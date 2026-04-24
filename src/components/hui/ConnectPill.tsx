import { useState } from "react";
import { Check, X, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Provider = "calendar" | "drive" | "granola" | "gmail";

interface Props {
  name: string;
  provider: Provider;
  connected: boolean;
  onChange?: () => void;
}

export const ConnectPill = ({ name, provider, connected, onChange }: Props) => {
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    if (connected) {
      toast.info(`${name} is already connected`);
      return;
    }
    setLoading(true);
    try {
      if (provider === "calendar") {
        const { data, error } = await supabase.functions.invoke("google-calendar", {
          body: { action: "get_auth_url" },
        });
        if (error) throw error;
        if (!data?.authUrl) throw new Error("No auth URL returned");
        const win = window.open(data.authUrl, "_blank", "width=520,height=700");
        const handler = (event: MessageEvent) => {
          if (event.data?.type === "google-calendar-connected") {
            toast.success("Google Calendar connected");
            window.removeEventListener("message", handler);
            onChange?.();
          }
          if (event.data?.type === "google-calendar-error") {
            toast.error("Couldn't connect Google Calendar");
            window.removeEventListener("message", handler);
          }
        };
        window.addEventListener("message", handler);
        if (!win) toast.message("Allow pop-ups to connect Google Calendar");
      } else if (provider === "drive") {
        toast.message("Google Drive — coming soon", {
          description: "Drive connect uses the same Google account as Calendar. We'll surface this in the next release.",
        });
      } else if (provider === "granola") {
        toast.message("Granola — coming soon", {
          description: "Granola transcript sync is on the roadmap. Reach out to the Assembl team if you'd like an early pilot.",
        });
      } else if (provider === "gmail") {
        toast.message("Gmail — coming soon", {
          description: "Gmail draft sync is on the roadmap.",
        });
      }
    } catch (err) {
      toast.error(`Couldn't start ${name} connection`, {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={connect}
      className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Inter'] border transition-colors ${
        connected
          ? "bg-[#C9D8D0]/40 border-[#9DB89D]/30 text-[#6F6158]"
          : "bg-white/60 border-[rgba(142,129,119,0.14)] text-[#6F6158] hover:bg-[#EEE7DE]"
      }`}
      aria-label={connected ? `${name} connected` : `Connect ${name}`}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : connected ? (
        <Check size={12} className="text-[#9DB89D]" />
      ) : (
        <Plus size={12} className="text-[#9D8C7D] group-hover:text-[#6F6158]" />
      )}
      <span>{name}</span>
      {!connected && !loading && (
        <span className="text-[#9D8C7D] group-hover:text-[#6F6158]">· Connect</span>
      )}
    </button>
  );
};
