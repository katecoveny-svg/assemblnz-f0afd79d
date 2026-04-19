import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { assemblMark } from "@/assets/brand";
import BrandFooter from "@/components/BrandFooter";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    // Try to bootstrap admin role via edge function
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-api", {
        body: { action: "ensure_admin_role" },
      });

      if (fnError || data?.error) {
        setError("Access denied. This login is restricted to administrators.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      navigate("/admin/dashboard");
    } catch {
      setError("Failed to verify admin access.");
      await supabase.auth.signOut();
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
              <h1 className="text-xl font-bold text-foreground">Admin Access</h1>
            </div>
            <p className="text-sm" style={{ color: '#ffffff38' }}>Restricted to authorised personnel</p>
          </div>

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

            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">Password</label>
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
              <Shield size={14} />
              Admin Sign In
            </button>
          </form>

          <div className="flex items-center justify-between mt-6 px-1">
            <Link to="/admin/forgot-password" className="text-xs hover:text-foreground transition-colors" style={{ color: '#ffffff38' }}>
              Forgot password?
            </Link>
            <Link to="/" className="text-xs hover:text-foreground transition-colors" style={{ color: '#ffffff22' }}>
              ← Back to Assembl
            </Link>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AdminLogin;
