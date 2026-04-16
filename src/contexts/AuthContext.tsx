import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DbProfile, UserRole } from "@/types/database";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo profile for when Supabase isn't configured
const DEMO_PROFILE: DbProfile = {
  id: "demo-user",
  email: "demo@capitalbridge.com",
  full_name: "Demo User",
  role: "admin",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_SESSION_KEY = "capitalbridge_demo_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured();

  useEffect(() => {
    if (isDemo) {
      // Demo mode: require explicit sign-in ceremony (any credentials work)
      // Only auto-restore if there's a previous demo session in this browser
      try {
        const stored = sessionStorage.getItem(DEMO_SESSION_KEY);
        if (stored) {
          const demoProfile = JSON.parse(stored) as DbProfile;
          setProfile(demoProfile);
        }
      } catch {
        // ignore parse errors
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isDemo]);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as DbProfile);
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    if (isDemo) {
      // Demo mode: accept any credentials, create a demo session
      const demoProfile: DbProfile = {
        ...DEMO_PROFILE,
        email: email || DEMO_PROFILE.email,
        full_name: email ? email.split("@")[0] : DEMO_PROFILE.full_name,
      };
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoProfile));
      setProfile(demoProfile);
      return { error: null };
    }
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (isDemo) {
      // Demo mode: accept signup, auto sign-in
      const demoProfile: DbProfile = {
        ...DEMO_PROFILE,
        email: email || DEMO_PROFILE.email,
        full_name: fullName || (email ? email.split("@")[0] : DEMO_PROFILE.full_name),
      };
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoProfile));
      setProfile(demoProfile);
      return { error: null };
    }
    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: "viewer" } },
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    if (isDemo) {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      setProfile(null);
      return;
    }
    await supabase!.auth.signOut();
  }

  function hasRole(...roles: UserRole[]) {
    if (!profile) return false;
    return roles.includes(profile.role);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, isDemo, signIn, signUp, signOut, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
