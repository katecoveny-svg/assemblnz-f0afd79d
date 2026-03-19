import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AssemblLogo from "@/components/AssemblLogo";
import { Loader2 } from "lucide-react";
import ParticleField from "@/components/ParticleField";

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
    <div className="min-h-screen star-field flex items-center justify-center px-4 relative">
      <ParticleField />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <AssemblLogo size={36} />
            <span className="font-syne font-extrabold tracking-[3px] uppercase text-foreground">ASSEMBL</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#ffffff38' }}>
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
            <p className="text-[10px] text-center" style={{ color: '#ffffff22' }}>
              By signing up you agree to our Terms of Service.
            </p>
          )}
        </form>

        <p className="text-center text-xs mt-6 opacity-0 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "forwards", color: '#ffffff38' }}>
          {mode === "signup" ? (
            <>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>
          ) : (
            <>Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up free</Link></>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
