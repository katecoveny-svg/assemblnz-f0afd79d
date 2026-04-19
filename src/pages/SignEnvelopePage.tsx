import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, CheckCircle2, FileText, Shield, AlertCircle } from "lucide-react";
import SEO from "@/components/SEO";

const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

interface Envelope {
  id: string;
  document_name: string;
  document_url: string;
  signer_name: string;
  signer_email: string;
  message?: string | null;
  status: string;
  sent_at: string;
  signed_at?: string | null;
  expires_at: string;
}

interface Tenant {
  name: string;
  brand_color?: string | null;
  logo_url?: string | null;
}

export default function SignEnvelopePage() {
  const { token } = useParams();
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`${EDGE_BASE}/esign-view?token=${token}`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        });
        const data = await r.json();
        if (!r.ok) {
          setError(data.error || "Could not load document");
        } else {
          setEnvelope(data.envelope);
          setTenant(data.tenant);
          setTypedName(data.envelope.signer_name || "");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSign = async () => {
    if (!typedName.trim() || !agreed) return;
    setSigning(true);
    try {
      const r = await fetch(`${EDGE_BASE}/esign-sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ token, typed_name: typedName.trim() }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Could not sign");
      } else {
        setCompleted(true);
      }
    } catch {
      setError("Network error");
    } finally {
      setSigning(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm("Decline to sign this document?")) return;
    setSigning(true);
    await fetch(`${EDGE_BASE}/esign-sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ token, action: "decline" }),
    });
    setError("declined");
    setSigning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFBFC" }}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error === "not_found") {
    return <Centered icon={<AlertCircle size={32} />} title="Document not found" subtitle="This signing link is invalid or has been revoked." />;
  }
  if (error === "expired" || envelope?.status === "expired") {
    return <Centered icon={<AlertCircle size={32} />} title="This link has expired" subtitle="Please contact the sender for a new signing link." />;
  }
  if (error === "declined" || envelope?.status === "declined") {
    return <Centered icon={<AlertCircle size={32} />} title="You declined to sign" subtitle="The sender has been notified." />;
  }
  if (completed || envelope?.status === "signed") {
    return (
      <Centered
        icon={<CheckCircle2 size={32} className="text-emerald-600" />}
        title="Signature confirmed"
        subtitle={`A confirmation email has been sent to ${envelope?.signer_email}. The signed document and audit trail are now on file.`}
      />
    );
  }
  if (error || !envelope) {
    return <Centered icon={<AlertCircle size={32} />} title="Something went wrong" subtitle={error || "Please try again later."} />;
  }

  const brandColor = tenant?.brand_color || "#3D4250";

  return (
    <>
      <SEO title={`Sign: ${envelope.document_name}`} description="Securely sign your document" />

      <div className="min-h-screen pb-12" style={{ background: "#FAFBFC" }}>
        <header className="border-b border-black/5 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tenant?.logo_url && <img src={tenant.logo_url} alt="" className="h-7" >}
              <span className="text-sm font-medium" style={{ color: brandColor }}>{tenant?.name || "Document signing"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Shield size={12} /> Secure signature
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 pt-8 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Please review and sign</p>
            <h1 className="text-2xl font-light text-[#3D4250]">{envelope.document_name}</h1>
            <p className="text-sm text-gray-500 mt-2">For: <strong>{envelope.signer_name}</strong> · {envelope.signer_email}</p>
          </div>

          {envelope.message && (
            <div className="rounded-xl bg-white border border-black/5 p-4 text-sm text-gray-700 italic">
              "{envelope.message}"
            </div>
          )}

          <div className="rounded-xl bg-white border border-black/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-gray-400" />
                <span className="text-gray-700">{envelope.document_name}</span>
              </div>
              <a href={envelope.document_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                Open in new tab
              </a>
            </div>
            <iframe
              src={envelope.document_url}
              title={envelope.document_name}
              className="w-full h-[60vh] bg-gray-50"
            />
          </div>

          <div className="rounded-xl bg-white border border-black/5 p-6 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Type your full name to sign</label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-4 py-3 text-2xl font-serif italic text-[#3D4250] focus:outline-none focus:border-primary"
                placeholder="Your full legal name"
              />
            </div>

            <label className="flex items-start gap-3 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I confirm my identity and intend to sign this document electronically. I understand my typed name,
                IP address, and timestamp will be recorded as legal evidence of my signature in accordance with the
                NZ Electronic Transactions Act 2002.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSign}
                disabled={!typedName.trim() || !agreed || signing}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: brandColor }}
              >
                {signing ? "Signing…" : "Sign document"}
              </button>
              <button
                onClick={handleDecline}
                disabled={signing}
                className="px-4 py-3 rounded-lg text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                Decline
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center pt-4">
            Powered by Assembl · This signature is captured securely and tied to your IP address and timestamp.
          </p>
        </div>
      </div>
    </>
  );
}

function Centered({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FAFBFC" }}>
      <div className="max-w-md text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-black/5">
          {icon}
        </div>
        <h1 className="text-xl font-light text-[#3D4250]">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
