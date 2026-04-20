import { MessageSquare, Phone } from "lucide-react";

interface TextUsButtonProps {
  keteName: string;
  accentColor: string;
  /** The public SMS entry point, e.g. a shortcode like "3688" or an E.164 mobile. */
  phoneNumber?: string;
  showWhatsApp?: boolean;
}

// Inbound Assembl messaging number — routes through Twilio → tnz-inbound gateway.
// Both SMS and WhatsApp deep-links use this E.164 number.
const DEFAULT_PHONE = "+14785516606";

/**
 * "Text us" CTA that opens the visitor's native SMS or WhatsApp app
 * pre-addressed to the Assembl number with a kete-specific starter message.
 */
const TextUsButton = ({
  keteName,
  accentColor,
  phoneNumber = DEFAULT_PHONE,
  showWhatsApp = true,
}: TextUsButtonProps) => {
  const smsBody = encodeURIComponent(`Hi Assembl — I'm interested in ${keteName}`);
  const cleanNumber = phoneNumber.replace(/\+/g, "");
  const canUseWhatsApp = showWhatsApp && /^\d{10,15}$/.test(cleanNumber);

  const smsHref = `sms:${phoneNumber}?body=${smsBody}`;
  const waHref = `https://wa.me/${cleanNumber}?text=${smsBody}`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={smsHref}
        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
        style={{
          color: accentColor,
          border: `1px solid ${accentColor}35`,
          background: `${accentColor}08`,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${accentColor}60`;
          e.currentTarget.style.background = `${accentColor}15`;
          e.currentTarget.style.boxShadow = `0 0 24px ${accentColor}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${accentColor}35`;
          e.currentTarget.style.background = `${accentColor}08`;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Phone size={15} />
        Text us
      </a>

      {canUseWhatsApp && (
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
            e.currentTarget.style.boxShadow = "0 0 24px rgba(37,211,102,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(37,211,102,0.3)";
            e.currentTarget.style.background = "rgba(37,211,102,0.06)";
            e.currentTarget.style.boxShadow = "none";
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
