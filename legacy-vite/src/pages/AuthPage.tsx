import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex flex-col relative bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)]" aria-hidden />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <Link to="/" className="inline-flex items-center justify-center mb-7">
              <span
                className="font-display text-5xl font-light italic leading-none text-[color:var(--assembl-pounamu)]"
              >
                assembl
              </span>
            </Link>
            <h1 className="font-display text-4xl font-light italic leading-none text-[color:var(--text-primary)]">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
              {mode === "signup" ? "Get 10 free messages per day" : "Sign in to continue"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_18px_56px_rgba(35,33,31,0.08)] opacity-0 animate-fade-up"
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[color:var(--assembl-paper)] border border-[rgba(35,33,31,0.14)] rounded-[8px] px-3.5 py-2.5 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:outline-none focus:border-[color:var(--assembl-pounamu)] transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[color:var(--assembl-paper)] border border-[rgba(35,33,31,0.14)] rounded-[8px] px-3.5 py-2.5 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:outline-none focus:border-[color:var(--assembl-pounamu)] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[color:var(--assembl-paper)] border border-[rgba(35,33,31,0.14)] rounded-[8px] px-3.5 py-2.5 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:outline-none focus:border-[color:var(--assembl-pounamu)] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-[8px] px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[color:var(--assembl-pounamu)] text-[color:var(--assembl-paper)] rounded-[8px] py-2.5 text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>

            {mode === "signup" && (
              <p className="text-[10px] text-center text-[color:var(--text-secondary)]">
                By signing up you agree to our <Link to="/terms" className="text-[color:var(--assembl-pounamu)] hover:underline">Terms of Service</Link>.
              </p>
            )}
          </form>

          <p className="text-center text-xs mt-6 opacity-0 animate-fade-up text-[color:var(--text-secondary)]" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            {mode === "signup" ? (
              <>Already have an account? <Link to="/login" className="text-[color:var(--assembl-pounamu)] hover:underline">Sign in</Link></>
            ) : (
              <>Don't have an account? <Link to="/signup" className="text-[color:var(--assembl-pounamu)] hover:underline">Sign up free</Link></>
            )}
          </p>
          <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            mahi that earns its proof · built in aotearoa · assembl@assembl.co.nz
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
