import { useEffect, useState } from "react";
import { MessageSquare, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface TextUsButtonProps {
  keteName: string;
  accentColor: string;
  /** Override SMS number (E.164). Otherwise resolved from kete_channel_config or fallback. */
  phoneNumber?: string;
  showWhatsApp?: boolean;
}

// Public NZ number fallback (Twilio Assembl). Used until kete_channel_config row resolves.
// Kept E.164 so both `sms:` and `wa.me/` accept it.
const FALLBACK_PHONE = "+6448879880";

/**
 * Open the on-page KeteAgentChat anywhere on the site by dispatching a global event.
 * KeteAgentChat listens for "assembl:open-chat" and opens itself.
 */
export const openKeteChat = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("assembl:open-chat"));
  }
};

/**
 * "Text us / WhatsApp / Chat now" — three-mode CTA.
 *  - Mobile: native sms: + wa.me deep links.
 *  - Desktop: opens the on-page agent chat (no phone needed) + still shows WhatsApp.
 *  - Always shows "Chat now" so prospects on stage Wi-Fi can talk to the agent immediately.
 */
const TextUsButton = ({
  keteName,
  accentColor,
  phoneNumber,
  showWhatsApp = true,
}: TextUsButtonProps) => {
  const isMobile = useIsMobile();
  const [resolvedNumber, setResolvedNumber] = useState<string>(phoneNumber || FALLBACK_PHONE);
  const [waEnabled, setWaEnabled] = useState<boolean>(showWhatsApp);

  useEffect(() => {
    if (phoneNumber) return; // explicit override wins
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("kete_channel_config")
          .select("sms_enabled, whatsapp_enabled")
          .eq("kete_code", keteName.toLowerCase())
          .maybeSingle();
        if (cancelled || !data) return;
        // sms_enabled / whatsapp_enabled are booleans here; the actual numbers
        // live in TWILIO_PHONE_NUMBER / TWILIO_WHATSAPP_NUMBER secrets server-side.
        // We keep the fallback E.164 client-side and only honour the on/off flags.
        if (data.sms_enabled === false) setResolvedNumber("");
        if (data.whatsapp_enabled === false) setWaEnabled(false);
      } catch {
        /* silent — keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [keteName, phoneNumber]);

  const smsBody = encodeURIComponent(`Hi Assembl — I'm interested in ${keteName}`);
  const cleanNumber = resolvedNumber.replace(/\+/g, "");
  const smsHref = resolvedNumber ? `sms:${resolvedNumber}?body=${smsBody}` : "";
  const waHref = `https://wa.me/${cleanNumber}?text=${smsBody}`;
  const showSms = !!resolvedNumber && isMobile; // hide on desktop where sms: doesn't work
  const showWa = waEnabled && /^\d{10,15}$/.test(cleanNumber);

  const baseStyle = (color: string) => ({
    color,
    border: `1px solid ${color}35`,
    background: `${color}08`,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* Always-on: opens the on-page agent chat. Works on every device. */}
      <button
        type="button"
        onClick={openKeteChat}
        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
        style={{
          background: accentColor,
          color: "#FAF6EF",
          border: `1px solid ${accentColor}`,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: `0 6px 24px ${accentColor}30`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 32px ${accentColor}50`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 6px 24px ${accentColor}30`;
        }}
      >
        <MessageCircle size={15} />
        Chat with {keteName}
      </button>

      {/* Mobile-only: native SMS deep-link */}
      {showSms && (
        <a
          href={smsHref}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
          style={baseStyle(accentColor)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${accentColor}60`;
            e.currentTarget.style.background = `${accentColor}15`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${accentColor}35`;
            e.currentTarget.style.background = `${accentColor}08`;
          }}
        >
          <Phone size={15} />
          Text us
        </a>
      )}

      {/* WhatsApp deep-link — works on both desktop (opens web.whatsapp) and mobile */}
      {showWa && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
          style={{
            color: "#25D366",
            border: "1px solid rgba(37,211,102,0.3)",
            background: "rgba(37,211,102,0.06)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(37,211,102,0.6)";
            e.currentTarget.style.background = "rgba(37,211,102,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(37,211,102,0.3)";
            e.currentTarget.style.background = "rgba(37,211,102,0.06)";
          }}
        >
          <MessageSquare size={15} />
          WhatsApp
        </a>
      )}
    </div>
  );
};

export default TextUsButton;
