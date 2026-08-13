import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type AzEvent, type Profile } from "@/lib/api";
import logoSrc from "@/imports/UoE_AzSoc_LOGO.png";

const TAG_OPTIONS = [
  { label: "Social", color: "#c0392b" },
  { label: "Cultural", color: "#2a9d8f" },
  { label: "Academic", color: "#c9a84c" },
  { label: "Arts", color: "#0f2560" },
  { label: "Language", color: "#2a9d8f" },
  { label: "Sport", color: "#27ae60" },
];

const EMPTY_EVENT = { title: "", description: "", date: "", location: "", tag: "Social", tag_color: "#c0392b", image_url: "", is_featured: false };

type Tab = "events" | "members" | "settings";

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { profile, token, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("events");
  const [events, setEvents] = useState<AzEvent[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AzEvent | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_EVENT });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    initSetup();
  }, []);

  async function initSetup() {
    try { await api.setup(); } catch {}
    setSetupDone(true);
    await loadData();
  }

  async function loadData() {
    setLoading(true);
    try {
      const [evRes, memRes] = await Promise.all([
        api.getEvents(),
        token ? api.getMembers(token).catch(() => ({ members: [] })) : Promise.resolve({ members: [] }),
      ]);
      setEvents(evRes.events || []);
      setMembers(memRes.members || []);
    } catch {}
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setFormData({ ...EMPTY_EVENT });
    setShowForm(true);
    setError("");
  }

  function openEdit(ev: AzEvent) {
    setEditing(ev);
    setFormData({ title: ev.title, description: ev.description, date: ev.date, location: ev.location, tag: ev.tag, tag_color: ev.tag_color, image_url: ev.image_url || "", is_featured: ev.is_featured });
    setShowForm(true);
    setError("");
  }

  async function saveEvent() {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.updateEvent(token, editing.id, formData);
      } else {
        await api.createEvent(token, formData as any);
      }
      setShowForm(false);
      await loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!token) return;
    try { await api.deleteEvent(token, id); await loadData(); } catch {}
    setDeleteConfirm(null);
  }

  async function changeRole(id: string, role: Profile["role"]) {
    if (!token) return;
    try { await api.updateMemberRole(token, id, role); await loadData(); } catch {}
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1.5px solid #dde", borderRadius: 6, fontSize: 14, outline: "none", fontFamily: "inherit", backgroundColor: "#fafafa" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f8", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Sidebar */}
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 240, backgroundColor: "#0a1a42", display: "flex", flexDirection: "column", zIndex: 50 }}>
        <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logoSrc} alt="AzSoc" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "Playfair Display, serif" }}>AzSoc Admin</div>
              <div style={{ fontSize: 11, color: "#c9a84c", letterSpacing: "0.06em" }}>UoE</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {([
            { id: "events", icon: "📅", label: "Events" },
            { id: "members", icon: "👥", label: "Members" },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ] as { id: Tab; icon: string; label: string }[]).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 6, border: "none", cursor: "pointer", marginBottom: 4, fontSize: 14, fontWeight: 500, transition: "all 0.15s", backgroundColor: tab === item.id ? "rgba(201,168,76,0.15)" : "transparent", color: tab === item.id ? "#c9a84c" : "rgba(255,255,255,0.65)" }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, padding: "0 14px" }}>Signed in as</div>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 500, padding: "0 14px", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.full_name || profile?.email}</div>
          <button onClick={onBack} style={{ width: "100%", padding: "9px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13, marginBottom: 6, textAlign: "left" }}>← Back to site</button>
          <button onClick={logout} style={{ width: "100%", padding: "9px 14px", borderRadius: 6, border: "none", background: "rgba(192,57,43,0.2)", color: "#e74c3c", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left" }}>Sign Out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 240, padding: "36px 40px", minHeight: "100vh" }}>

        {/* ── Events Tab ── */}
        {tab === "events" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 700, color: "#0f2560", marginBottom: 4 }}>Events</h1>
                <p style={{ fontSize: 15, color: "#6a6a7a" }}>{events.length} event{events.length !== 1 ? "s" : ""} total</p>
              </div>
              <button onClick={openCreate} style={{ backgroundColor: "#0f2560", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1a3575")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0f2560")}>
                + Add Event
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 80, color: "#6a6a7a" }}>Loading events…</div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, backgroundColor: "#fff", borderRadius: 10, border: "2px dashed #dde" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, color: "#0f2560", marginBottom: 8 }}>No events yet</div>
                <p style={{ color: "#6a6a7a", marginBottom: 24 }}>Add your first event to get started.</p>
                <button onClick={openCreate} style={{ backgroundColor: "#c9a84c", color: "#0a1a42", border: "none", padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Add Event</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {events.map(ev => (
                  <div key={ev.id} style={{ backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,37,96,0.08)", borderTop: `4px solid ${ev.tag_color}` }}>
                    <div style={{ padding: "22px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ev.tag_color, backgroundColor: `${ev.tag_color}18`, padding: "3px 10px", borderRadius: 3 }}>{ev.tag}</span>
                        {ev.is_featured && <span style={{ fontSize: 11, color: "#c9a84c", fontWeight: 700 }}>★ Featured</span>}
                      </div>
                      <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, color: "#0f2560", marginBottom: 6, lineHeight: 1.3 }}>{ev.title}</h3>
                      <div style={{ fontSize: 13, color: "#8a8a9a", marginBottom: 6 }}>📅 {ev.date}</div>
                      {ev.location && <div style={{ fontSize: 13, color: "#8a8a9a", marginBottom: 10 }}>📍 {ev.location}</div>}
                      <p style={{ fontSize: 14, color: "#5a5a6a", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ev.description}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(ev)} style={{ flex: 1, padding: "8px", border: "1.5px solid #0f2560", borderRadius: 5, backgroundColor: "transparent", color: "#0f2560", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0f2560"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#0f2560"; }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(ev.id)} style={{ padding: "8px 14px", border: "1.5px solid #fecaca", borderRadius: 5, backgroundColor: "transparent", color: "#c0392b", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Members Tab ── */}
        {tab === "members" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 700, color: "#0f2560", marginBottom: 4 }}>Members</h1>
              <p style={{ fontSize: 15, color: "#6a6a7a" }}>{members.length} registered account{members.length !== 1 ? "s" : ""}</p>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 80, color: "#6a6a7a" }}>Loading members…</div>
            ) : (
              <div style={{ backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,37,96,0.08)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f5f0", borderBottom: "2px solid #eee" }}>
                      {["Name", "Email", "Role", "Joined", "Actions"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6a6a7a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? "1px solid #f0f0f0" : "none", transition: "background 0.15s" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#fafafa")}
                        onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")}>
                        <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{m.full_name || "—"}</td>
                        <td style={{ padding: "14px 20px", fontSize: 14, color: "#5a5a6a" }}>{m.email}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 3, backgroundColor: m.role === "admin" ? "rgba(201,168,76,0.15)" : "rgba(42,157,143,0.12)", color: m.role === "admin" ? "#b8860b" : "#2a9d8f" }}>
                            {m.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#8a8a9a" }}>{new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={{ padding: "14px 20px" }}>
                          {m.id !== profile?.id && (
                            <button onClick={() => changeRole(m.id, m.role === "admin" ? "member" : "admin")}
                              style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 4, border: "1.5px solid #dde", backgroundColor: "transparent", cursor: "pointer", color: "#5a5a6a", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f2560"; e.currentTarget.style.color = "#0f2560"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "#dde"; e.currentTarget.style.color = "#5a5a6a"; }}>
                              Make {m.role === "admin" ? "Member" : "Admin"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Settings Tab ── */}
        {tab === "settings" && (
          <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 700, color: "#0f2560", marginBottom: 8 }}>Settings</h1>
            <p style={{ fontSize: 15, color: "#6a6a7a", marginBottom: 40 }}>Manage your account and society settings.</p>

            <div style={{ backgroundColor: "#fff", borderRadius: 10, padding: "28px 32px", boxShadow: "0 2px 12px rgba(15,37,96,0.08)", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "#0f2560", marginBottom: 20 }}>Account</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9a9aaa", marginBottom: 6 }}>Name</div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", fontWeight: 500 }}>{profile?.full_name || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9a9aaa", marginBottom: 6 }}>Email</div>
                  <div style={{ fontSize: 15, color: "#1a1a2e" }}>{profile?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9a9aaa", marginBottom: 6 }}>Role</div>
                  <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 3, backgroundColor: "rgba(201,168,76,0.15)", color: "#b8860b" }}>{profile?.role}</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "24px 32px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c0392b", marginBottom: 10 }}>Sign Out</h2>
              <p style={{ fontSize: 14, color: "#7a3a3a", marginBottom: 16 }}>You will be returned to the public site.</p>
              <button onClick={logout} style={{ backgroundColor: "#c0392b", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Sign Out</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Event Form Modal ── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: "36px 40px", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 26, fontWeight: 700, color: "#0f2560", marginBottom: 28 }}>
              {editing ? "Edit Event" : "New Event"}
            </h2>

            {[
              { key: "title", label: "Event Title", type: "text", placeholder: "Novruz Cultural Evening" },
              { key: "date", label: "Date", type: "text", placeholder: "Mar 20, 2026" },
              { key: "location", label: "Location", type: "text", placeholder: "Pleasance Courtyard, Edinburgh" },
              { key: "image_url", label: "Image URL (optional)", type: "text", placeholder: "https://images.unsplash.com/…" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(formData as any)[f.key]}
                  onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#0f2560")}
                  onBlur={e => (e.target.style.borderColor = "#dde")} />
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tag</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TAG_OPTIONS.map(t => (
                  <button key={t.label} type="button" onClick={() => setFormData(prev => ({ ...prev, tag: t.label, tag_color: t.color }))}
                    style={{ padding: "6px 14px", borderRadius: 4, border: `1.5px solid ${formData.tag === t.label ? t.color : "#dde"}`, backgroundColor: formData.tag === t.label ? `${t.color}18` : "transparent", color: formData.tag === t.label ? t.color : "#6a6a7a", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3a3a4a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</label>
              <textarea placeholder="Describe the event…" value={formData.description} rows={4}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={e => (e.target.style.borderColor = "#0f2560")}
                onBlur={e => (e.target.style.borderColor = "#dde")} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, cursor: "pointer" }}>
              <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#c9a84c" }} />
              <span style={{ fontSize: 14, color: "#3a3a4a", fontWeight: 500 }}>Featured event (shown prominently)</span>
            </label>

            {error && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", fontSize: 14, color: "#c0392b", marginBottom: 20 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={saveEvent} disabled={saving}
                style={{ flex: 1, backgroundColor: saving ? "#93a3c8" : "#0f2560", color: "#fff", border: "none", padding: 14, borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Event"}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: "14px 20px", border: "1.5px solid #dde", borderRadius: 6, backgroundColor: "transparent", color: "#6a6a7a", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: "36px 40px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "#0f2560", marginBottom: 12 }}>Delete Event?</h3>
            <p style={{ fontSize: 15, color: "#6a6a7a", marginBottom: 28 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => deleteEvent(deleteConfirm)} style={{ flex: 1, backgroundColor: "#c0392b", color: "#fff", border: "none", padding: 13, borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Delete</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, border: "1.5px solid #dde", backgroundColor: "transparent", color: "#6a6a7a", padding: 13, borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
