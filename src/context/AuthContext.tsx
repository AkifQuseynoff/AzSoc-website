import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Profile } from "@/lib/api";

type AuthState = {
  token: string | null;
  profile: Profile | null;
  loading: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, profile: null, loading: true });

  useEffect(() => {
    const token = localStorage.getItem("azsoc_token");
    if (token) {
      api.me(token)
        .then(({ profile }) => setState({ token, profile, loading: false }))
        .catch(() => { localStorage.removeItem("azsoc_token"); setState({ token: null, profile: null, loading: false }); });
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  async function login(email: string, password: string) {
    const { session, profile } = await api.login(email, password);
    localStorage.setItem("azsoc_token", session.access_token);
    setState({ token: session.access_token, profile, loading: false });
  }

  async function register(email: string, password: string, full_name: string) {
    const { session, profile } = await api.register(email, password, full_name);
    localStorage.setItem("azsoc_token", session.access_token);
    setState({ token: session.access_token, profile, loading: false });
  }

  function logout() {
    localStorage.removeItem("azsoc_token");
    setState({ token: null, profile: null, loading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
