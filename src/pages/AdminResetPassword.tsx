import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { assemblMark } from "@/assets/brand";
import BrandFooter from "@/components/BrandFooter";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/admin"), 2500);
    }
    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen star-field flex flex-col relative">
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <img loading="lazy" decoding="async" src={assemblMark} alt="Assembl" className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(212,168,67,0.25)]" >
              <span className="font-display font-light tracking-[3px] uppercase text-foreground">ASSEMBL</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This page is only accessible via a password reset link. Please check your email.
            </p>
            <Link to="/admin" className="text-xs hover:text-foreground transition-colors" style={{ color: '#ffffff38' }}>
              ← Back to Admin Login
            </Link>
          </div>
        </div>
        <div className="relative z-10 mt-auto">
          <BrandFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <div className="inline-flex items-center gap-2 mb-6">
              <img loading="lazy" decoding="async" src={assemblMark} alt="Assembl" className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(212,168,67,0.25)]" >
              <span className="font-display font-light tracking-[3px] uppercase text-foreground">ASSEMBL</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield size={20} className="text-destructive" />
              <h1 className="text-xl font-bold text-foreground">Set New Password</h1>
            </div>
          </div>

          {success ? (
            <div className="opacity-0 animate-fade-up text-center space-y-3" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <div className="bg-card border border-border rounded-lg p-6">
                <CheckCircle2 size={32} className="mx-auto mb-3 text-green-500" />
                <p className="text-sm text-foreground font-medium">Password updated</p>
                <p className="text-xs mt-1" style={{ color: '#ffffff55' }}>Redirecting to admin login…</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 opacity-0 animate-fade-up"
              style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive/40 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive/40 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
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
                Update Password
              </button>
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

export default AdminResetPassword;
