import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import BrandFooter from "@/components/BrandFooter";

const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      if (!fullName.trim()) { setError("Name is required"); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName);
      if (error) setError(error);
      else navigate("/");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <ParticleField />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(74,165,168,0.8)) drop-shadow(0 0 18px rgba(74,165,168,0.4))" }}>
                <defs>
                  <radialGradient id="auth-g" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#A8DDDB"/><stop offset="50%" stopColor="#4AA5A8"/><stop offset="100%" stopColor="#8B6020"/></radialGradient>
                  <radialGradient id="auth-p" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#7ACFC2"/><stop offset="50%" stopColor="#3A7D6E"/><stop offset="100%" stopColor="#1E5044"/></radialGradient>
                  <radialGradient id="auth-pl" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#5AADA0"/><stop offset="50%" stopColor="#2E6B5E"/><stop offset="100%" stopColor="#153D35"/></radialGradient>
                  <radialGradient id="auth-hi" cx="35%" cy="30%" r="28%"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
                  <linearGradient id="auth-l" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4AA5A8" stopOpacity="0.7"/><stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.65"/></linearGradient>
                </defs>
                <line x1="18" y1="8" x2="8" y2="26" stroke="url(#auth-l)" strokeWidth="1.3"/>
                <line x1="18" y1="8" x2="28" y2="26" stroke="url(#auth-l)" strokeWidth="1.3"/>
                <line x1="8" y1="26" x2="28" y2="26" stroke="url(#auth-l)" strokeWidth="1.3"/>
                <circle cx="18" cy="8" r="4.8" fill="url(#auth-g)"/><circle cx="18" cy="8" r="4.8" fill="url(#auth-hi)"/>
                <circle cx="8" cy="26" r="4.8" fill="url(#auth-p)"/><circle cx="8" cy="26" r="4.8" fill="url(#auth-hi)"/>
                <circle cx="28" cy="26" r="4.8" fill="url(#auth-pl)"/><circle cx="28" cy="26" r="4.8" fill="url(#auth-hi)"/>
              </svg>
              <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", fontSize: "13px", background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 48%, #4AA5A8 72%, #3A7D6E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ASSEMBL</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground" style={{ textShadow: "0 0 24px rgba(74,165,168,0.5), 0 0 48px rgba(74,165,168,0.2)" }}>
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm mt-1 text-muted-foreground">
              {mode === "signup" ? "Get 10 free messages per day" : "Sign in to continue"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 opacity-0 animate-fade-up"
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
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
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>

            {mode === "signup" && (
              <p className="text-[10px] text-center text-muted-foreground/40">
                By signing up you agree to our <Link to="/terms" className="text-primary/50 hover:text-primary">Terms of Service</Link>.
              </p>
            )}
          </form>

          <p className="text-center text-xs mt-6 opacity-0 animate-fade-up text-muted-foreground" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            {mode === "signup" ? (
              <>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>
            ) : (
              <>Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up free</Link></>
            )}
          </p>
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AuthPage;
