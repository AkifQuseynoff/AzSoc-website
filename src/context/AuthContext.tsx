import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Profile } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type AuthState = {
  token: string | null;
  profile: Profile | null;
  loading: boolean;
  passwordRecovery: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, profile: null, loading: true, passwordRecovery: false });

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (active) setState(prev => ({ ...prev, token: null, profile: null, loading: false }));
        return;
      }
      try {
        const { profile } = await api.me(data.session.access_token);
        if (active) setState(prev => ({ ...prev, token: data.session.access_token, profile, loading: false }));
      } catch {
        if (active) setState(prev => ({ ...prev, token: null, profile: null, loading: false }));
      }
    }

    restoreSession();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "SIGNED_OUT") {
        setState(prev => ({ ...prev, token: null, profile: null, loading: false, passwordRecovery: false }));
      }
      if (event === "PASSWORD_RECOVERY") {
        // Fired when the user lands back on the app after clicking the
        // reset-password link in their email. App.tsx watches this flag
        // to route them to the "set a new password" screen.
        setState(prev => ({ ...prev, loading: false, passwordRecovery: true }));
      }
    });

    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function login(email: string, password: string) {
    const { session, profile } = await api.login(email, password);
    setState(prev => ({ ...prev, token: session.access_token, profile, loading: false }));
  }

  async function register(email: string, password: string, fullName: string) {
    const { session, profile } = await api.register(email, password, fullName);
    if (session && profile) setState(prev => ({ ...prev, token: session.access_token, profile, loading: false }));
    return { requiresEmailConfirmation: !session };
  }

  function logout() {
    void supabase.auth.signOut();
    setState(prev => ({ ...prev, token: null, profile: null, loading: false, passwordRecovery: false }));
  }

  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setState(prev => ({ ...prev, passwordRecovery: false }));
  }

  function clearPasswordRecovery() {
    setState(prev => ({ ...prev, passwordRecovery: false }));
  }

  return (
      <AuthContext.Provider
          value={{ ...state, login, register, logout, requestPasswordReset, updatePassword, clearPasswordRecovery }}
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