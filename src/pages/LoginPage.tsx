import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import logoSrc from "@/imports/UoE_AzSoc_LOGO.png";

type Props = { onBack: () => void };

export default function LoginPage({ onBack }: Props) {
  const { login, register, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", confirm: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (mode === "register" && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        const { requiresEmailConfirmation } = await register(form.email, form.password, form.full_name);
        if (requiresEmailConfirmation) {
          setMessage("Account created. Check your email to confirm your address, then sign in.");
          setMode("login");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await requestPasswordReset(form.email);
      setMessage("If an account exists for that email, a reset link is on its way. Check your inbox.");
      setMode("login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1.5px solid #dde", borderRadius: 6,
    fontSize: 15, outline: "none", transition: "border-color 0.2s", backgroundColor: "#fafafa",
    fontFamily: "inherit",
  };

  return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0a1a42", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        {/* Background */}
        <div style={{ position: "fixed", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1800&h=900&fit=crop&auto=format)", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.15)" }} />
        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(160deg, rgba(15,37,96,0.92), rgba(10,26,66,0.97))" }} />

        <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
          {/* Back */}
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, marginBottom: 32, display: "flex", alignItems: "center", gap: 6, padding: 0, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
            ← Back to site
          </button>

          <div style={{ backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
            {/* Header */}
            <div style={{ backgroundColor: "#0f2560", padding: "36px 40px 28px", textAlign: "center", borderBottom: "3px solid #c9a84c" }}>
              <img src={logoSrc} alt="AzSoc" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: "2px solid rgba(201,168,76,0.5)" }} />
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Azerbaijan Society</div>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>University of Edinburgh</div>
            </div>

            {/* Tabs (hidden in forgot-password mode) */}
            {mode !== "forgot" && (
                <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
                  {(["login", "register"] as const).map(m => (
                      <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
                              style={{ flex: 1, padding: "14px", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.2s", backgroundColor: mode === m ? "#fff" : "#f8f8f8", color: mode === m ? "#0f2560" : "#999", borderBottom: mode === m ? "2px solid #c9a84c" : "2px solid transparent" }}>
                        {m === "login" ? "Sign In" : "Register"}
                      </button>
                  ))}
                </div>
            )}

            {mode === "forgot" ? (
                <form onSubmit={handleForgotSubmit} style={{ padding: "32px 40px 36px" }}>
                  <p style={{ fontSize: 14, color: "#5a5a6a", lineHeight: 1.6, marginBottom: 24 }}>
                    Enter the email address on your account and we will send you a link to reset your password.
                  </p>
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email Address</label>
                    <input type="email" placeholder="s1234567@ed.ac.uk" value={form.email} onChange={set("email")} required style={inputStyle}
                           onFocus={e => (e.target.style.borderColor = "#0f2560")}
                           onBlur={e => (e.target.style.borderColor = "#dde")} />
                  </div>

                  {error && (
                      <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", fontSize: 14, color: "#c0392b", marginBottom: 20 }}>
                        {error}
                      </div>
                  )}

                  <button type="submit" disabled={loading}
                          style={{ width: "100%", backgroundColor: loading ? "#93a3c8" : "#0f2560", color: "#fff", padding: 15, borderRadius: 6, fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}
                          onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = "#1a3575"); }}
                          onMouseLeave={e => { if (!loading) (e.currentTarget.style.backgroundColor = "#0f2560"); }}>
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>

                  <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                          style={{ display: "block", width: "100%", textAlign: "center", marginTop: 20, background: "none", border: "none", color: "#0f2560", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                    ← Back to sign in
                  </button>
                </form>
            ) : (
                <form onSubmit={handleSubmit} style={{ padding: "32px 40px 36px" }}>
                  {mode === "register" && (
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Name</label>
                        <input type="text" placeholder="Leyla Hasanova" value={form.full_name} onChange={set("full_name")} required style={inputStyle}
                               onFocus={e => (e.target.style.borderColor = "#0f2560")}
                               onBlur={e => (e.target.style.borderColor = "#dde")} />
                      </div>
                  )}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email Address</label>
                    <input type="email" placeholder="s1234567@ed.ac.uk" value={form.email} onChange={set("email")} required style={inputStyle}
                           onFocus={e => (e.target.style.borderColor = "#0f2560")}
                           onBlur={e => (e.target.style.borderColor = "#dde")} />
                  </div>
                  <div style={{ marginBottom: mode === "register" ? 20 : 12 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
                    <input type="password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} required style={inputStyle}
                           onFocus={e => (e.target.style.borderColor = "#0f2560")}
                           onBlur={e => (e.target.style.borderColor = "#dde")} />
                  </div>

                  {mode === "login" && (
                      <div style={{ textAlign: "right", marginBottom: 16 }}>
                        <button type="button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                                style={{ background: "none", border: "none", color: "#0f2560", fontSize: 13, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                          Forgot your password?
                        </button>
                      </div>
                  )}

                  {mode === "register" && (
                      <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Confirm Password</label>
                        <input type="password" placeholder="Repeat password" value={form.confirm} onChange={set("confirm")} required style={inputStyle}
                               onFocus={e => (e.target.style.borderColor = "#0f2560")}
                               onBlur={e => (e.target.style.borderColor = "#dde")} />
                      </div>
                  )}

                  {error && (
                      <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", fontSize: 14, color: "#c0392b", marginBottom: 20 }}>
                        {error}
                      </div>
                  )}

                  {message && (
                      <div style={{ backgroundColor: "#eef8f6", border: "1px solid #bde5dc", borderRadius: 6, padding: "10px 14px", fontSize: 14, color: "#176b60", marginBottom: 20 }}>
                        {message}
                      </div>
                  )}

                  <button type="submit" disabled={loading}
                          style={{ width: "100%", backgroundColor: loading ? "#93a3c8" : "#0f2560", color: "#fff", padding: 15, borderRadius: 6, fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}
                          onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = "#1a3575"); }}
                          onMouseLeave={e => { if (!loading) (e.currentTarget.style.backgroundColor = "#0f2560"); }}>
                    {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
                  </button>

                  {mode === "register" && (
                      <p style={{ fontSize: 12, color: "#8a8a9a", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
                        The first account created automatically becomes <strong>admin</strong>. Subsequent accounts are regular members.
                      </p>
                  )}
                </form>
            )}
          </div>
        </div>
      </div>
  );
}