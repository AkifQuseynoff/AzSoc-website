import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import logoSrc from "@/imports/UoE_AzSoc_LOGO.png";

type Props = { onDone: () => void };

export default function ResetPasswordPage({ onDone }: Props) {
    const { updatePassword, clearPasswordRecovery } = useAuth();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 16px", border: "1.5px solid #dde", borderRadius: 6,
        fontSize: 15, outline: "none", transition: "border-color 0.2s", backgroundColor: "#fafafa",
        fontFamily: "inherit",
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            await updatePassword(password);
            setDone(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        clearPasswordRecovery();
        onDone();
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0a1a42", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ position: "fixed", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1800&h=900&fit=crop&auto=format)", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.15)" }} />
            <div style={{ position: "fixed", inset: 0, background: "linear-gradient(160deg, rgba(15,37,96,0.92), rgba(10,26,66,0.97))" }} />

            <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
                <div style={{ backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
                    <div style={{ backgroundColor: "#0f2560", padding: "36px 40px 28px", textAlign: "center", borderBottom: "3px solid #c9a84c" }}>
                        <img src={logoSrc} alt="AzSoc" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: "2px solid rgba(201,168,76,0.5)" }} />
                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Set a New Password</div>
                        <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>Azerbaijan Society</div>
                    </div>

                    <div style={{ padding: "32px 40px 36px" }}>
                        {done ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                                <p style={{ fontSize: 16, color: "#3a3a4a", lineHeight: 1.6, marginBottom: 28 }}>
                                    Your password has been updated.
                                </p>
                                <button onClick={onDone}
                                        style={{ width: "100%", backgroundColor: "#0f2560", color: "#fff", padding: 15, borderRadius: 6, fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                                    Continue
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <p style={{ fontSize: 14, color: "#5a5a6a", lineHeight: 1.6, marginBottom: 24 }}>
                                    Choose a new password for your account.
                                </p>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Password</label>
                                    <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle}
                                           onFocus={e => (e.target.style.borderColor = "#0f2560")}
                                           onBlur={e => (e.target.style.borderColor = "#dde")} />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Confirm Password</label>
                                    <input type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle}
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
                                    {loading ? "Updating…" : "Update Password"}
                                </button>

                                <button type="button" onClick={handleCancel}
                                        style={{ display: "block", width: "100%", textAlign: "center", marginTop: 20, background: "none", border: "none", color: "#8a8a9a", fontSize: 13, cursor: "pointer" }}>
                                    Cancel
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}