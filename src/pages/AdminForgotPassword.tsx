import { useState } from "react";
import { Link } from "react-router-dom";
import { assemblMark } from "@/assets/brand";
import BrandFooter from "@/components/BrandFooter";
import { Loader2, Shield, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <div className="inline-flex items-center gap-2 mb-6">
              <img loading="lazy" decoding="async" src={assemblMark} alt="Assembl" className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(212,168,67,0.25)]" />
              <span className="font-display font-light tracking-[3px] uppercase text-foreground">ASSEMBL</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield size={20} className="text-destructive" />
              <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
            </div>
            <p className="text-sm" style={{ color: '#ffffff38' }}>Enter your admin email to receive a reset link</p>
          </div>

          {sent ? (
            <div className="opacity-0 animate-fade-up text-center space-y-4" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <div className="bg-card border border-border rounded-lg p-6">
                <Mail size={32} className="mx-auto mb-3 text-destructive" />
                <p className="text-sm text-foreground mb-1 font-medium">Check your inbox</p>
                <p className="text-xs" style={{ color: '#ffffff55' }}>
                  If an account exists for <strong className="text-foreground">{email}</strong>, you'll receive a password reset link shortly.
                </p>
              </div>
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs hover:text-foreground transition-colors" style={{ color: '#ffffff38' }}>
                <ArrowLeft size={12} /> Back to Admin Login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 opacity-0 animate-fade-up"
              style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive/40 transition-colors"
                  placeholder="admin@assembl.co.nz"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: 'hsl(0 84% 60%)', color: '#3D4250' }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Send Reset Link
              </button>

              <p className="text-center text-xs" style={{ color: '#ffffff22' }}>
                <Link to="/admin" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft size={12} /> Back to Admin Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AdminForgotPassword;
