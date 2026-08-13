import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Profile } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type AuthState = {
  token: string | null;
  profile: Profile | null;
  loading: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, profile: null, loading: true });

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (active) setState({ token: null, profile: null, loading: false });
        return;
      }
      try {
        const { profile } = await api.me(data.session.access_token);
        if (active) setState({ token: data.session.access_token, profile, loading: false });
      } catch {
        if (active) setState({ token: null, profile: null, loading: false });
      }
    }

    restoreSession();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && active) setState({ token: null, profile: null, loading: false });
    });

    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function login(email: string, password: string) {
    const { session, profile } = await api.login(email, password);
    setState({ token: session.access_token, profile, loading: false });
  }

  async function register(email: string, password: string, fullName: string) {
    const { session, profile } = await api.register(email, password, fullName);
    if (session && profile) setState({ token: session.access_token, profile, loading: false });
    return { requiresEmailConfirmation: !session };
  }

  function logout() {
    void supabase.auth.signOut();
    setState({ token: null, profile: null, loading: false });
  }

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
