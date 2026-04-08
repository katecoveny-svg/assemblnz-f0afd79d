import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roleFromProductId } from "@/data/stripeTiers";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "free" | "essentials" | "business" | "enterprise" | "admin";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: { full_name: string } | null;
  role: AppRole | null;
  loading: boolean;
  dailyMessageCount: number;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  incrementMessageCount: () => Promise<boolean>;
  isPaid: boolean;
  isAdmin: boolean;
  canUseFeature: (feature: "upload" | "templates" | "brand_scan" | "pdf_download") => boolean;
  messageLimitReached: boolean;
  dailyLimit: number;
  checkSubscription: () => Promise<void>;
  subscriptionEnd: string | null;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

/** Safe version that returns null instead of throwing when outside AuthProvider */
export const useAuthSafe = () => useContext(AuthContext);

const PREVIEW_MSG_KEY = "assembl_preview_msgs";
const PREVIEW_LIMIT = 3;
const FREE_DAILY_LIMIT = 10;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const isAdmin = role === "admin";
  const isPaid = isAdmin || role === "essentials" || role === "business" || role === "enterprise";
  const dailyLimit = isPaid ? Infinity : FREE_DAILY_LIMIT;
  const messageLimitReached = !isPaid && user !== null && dailyMessageCount >= FREE_DAILY_LIMIT;

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error || !data) return;
      if (data.subscribed && data.product_id) {
        const stripeRole = roleFromProductId(data.product_id);
        if (stripeRole) {
          setRole((prev) => (prev === "admin" ? "admin" : stripeRole));
        }
        setSubscriptionEnd(data.subscription_end || null);
      }
    } catch {
      // Silently fail — DB role is the fallback
    }
  }, [session?.access_token]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchRole(session.user.id);
          fetchDailyCount(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
        setDailyMessageCount(0);
        setSubscriptionEnd(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRole(session.user.id);
        fetchDailyCount(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check Stripe subscription after session is set
  useEffect(() => {
    if (session?.access_token && user) {
      checkSubscription();
    }
  }, [session?.access_token, user, checkSubscription]);

  // Periodic refresh every 60s
  useEffect(() => {
    if (!session?.access_token || !user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session?.access_token, user, checkSubscription]);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("full_name").eq("id", uid).single();
    if (data) setProfile({ full_name: data.full_name || "" });
  };

  const fetchRole = async (uid: string) => {
    const { data: adminCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin" as any)
      .single();
    
    if (adminCheck) {
      setRole("admin");
      return;
    }

    const { data } = await supabase.rpc("get_user_role", { _user_id: uid });
    if (data) setRole(data as AppRole);
    else setRole("free");
  };

  const fetchDailyCount = async (uid: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_messages")
      .select("message_count")
      .eq("user_id", uid)
      .eq("message_date", today)
      .single();
    setDailyMessageCount(data?.message_count ?? 0);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (!error) {
      // Fire welcome email asynchronously — don't block signup
      supabase.functions.invoke("send-welcome-email", {
        body: { record: { email, full_name: fullName } },
      }).catch((err) => console.error("Welcome email error:", err));
    }
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const incrementMessageCount = async (): Promise<boolean> => {
    if (!user) {
      const count = parseInt(sessionStorage.getItem(PREVIEW_MSG_KEY) || "0", 10);
      if (count >= PREVIEW_LIMIT) return false;
      sessionStorage.setItem(PREVIEW_MSG_KEY, String(count + 1));
      return true;
    }

    if (isPaid) return true;

    if (dailyMessageCount >= FREE_DAILY_LIMIT) return false;

    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("daily_messages")
      .select("id, message_count")
      .eq("user_id", user.id)
      .eq("message_date", today)
      .single();

    if (existing) {
      await supabase
        .from("daily_messages")
        .update({ message_count: existing.message_count + 1 })
        .eq("id", existing.id);
      setDailyMessageCount(existing.message_count + 1);
    } else {
      await supabase
        .from("daily_messages")
        .insert({ user_id: user.id, message_date: today, message_count: 1 });
      setDailyMessageCount(1);
    }
    return true;
  };

  const canUseFeature = (feature: "upload" | "templates" | "brand_scan" | "pdf_download") => {
    if (isAdmin) return true;
    // Brand scan is available to all logged-in users — it drives onboarding
    if (feature === "brand_scan") return !!user;
    if (isPaid) return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, role, loading,
      dailyMessageCount, signUp, signIn, signOut,
      incrementMessageCount, isPaid, isAdmin, canUseFeature,
      messageLimitReached, dailyLimit, checkSubscription, subscriptionEnd,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
