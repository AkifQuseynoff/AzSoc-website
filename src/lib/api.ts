// Local mock API to allow the frontend to run without a backend.
// Data is persisted in browser localStorage under names used below.

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "member";
  created_at: string;
};

export type AzEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  tag: string;
  tag_color: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
};

const EVENTS_KEY = "azsoc_events_local";
const PROFILES_KEY = "azsoc_profiles_local";
const TOKENS_KEY = "azsoc_tokens_local"; // map token -> profile id

function read<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : null; } catch { return null; }
}

function write(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function nowISO() { return new Date().toISOString(); }

function ensureSeed() {
  if (!read(EVENTS_KEY)) {
    const sample: AzEvent[] = [
      { id: "1", title: "Novruz Cultural Evening", description: "Celebrate Novruz with music and food.", date: "Mar 20, 2026", location: "Pleasance Courtyard", tag: "Cultural", tag_color: "#2a9d8f", image_url: "", is_featured: true, created_at: nowISO() }
    ];
    write(EVENTS_KEY, sample);
  }
  if (!read(PROFILES_KEY)) write(PROFILES_KEY, [] as Profile[]);
  if (!read(TOKENS_KEY)) write(TOKENS_KEY, {} as Record<string,string>);
}

function generateId() { return Math.random().toString(36).slice(2, 9); }

export const api = {
  setup: async () => { ensureSeed(); return { ok: true }; },

  register: async (email: string, password: string, full_name: string) => {
    ensureSeed();
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    if (profiles.find(p => p.email === email)) throw new Error("Email already registered");
    const id = generateId();
    const role = profiles.length === 0 ? "admin" : "member";
    const profile: Profile = { id, email, full_name, role, created_at: nowISO() };
    profiles.push(profile);
    write(PROFILES_KEY, profiles);
    // store password locally (not secure, but for dev only)
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const token = "tok_" + generateId();
    tokens[token] = id;
    write(TOKENS_KEY, tokens);
    return { user: { id }, session: { access_token: token }, profile };
  },

  login: async (email: string, password: string) => {
    ensureSeed();
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    const profile = profiles.find(p => p.email === email);
    if (!profile) throw new Error("No such user");
    // accept any password locally for simplicity
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const token = "tok_" + generateId();
    tokens[token] = profile.id;
    write(TOKENS_KEY, tokens);
    return { user: { id: profile.id }, session: { access_token: token }, profile };
  },

  me: async (token: string) => {
    ensureSeed();
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const id = tokens[token];
    if (!id) throw new Error("Unauthorized");
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    const profile = profiles.find(p => p.id === id) || null;
    return { user: { id }, profile };
  },

  getEvents: async () => {
    ensureSeed();
    const events = read<AzEvent[]>(EVENTS_KEY) || [];
    return { events };
  },

  createEvent: async (token: string | undefined, event: Omit<AzEvent, "id" | "created_at">) => {
    ensureSeed();
    if (!token) throw new Error("Unauthorized");
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const id = tokens[token];
    if (!id) throw new Error("Unauthorized");
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    const profile = profiles.find(p => p.id === id);
    if (!profile || profile.role !== "admin") throw new Error("Forbidden");
    const events = read<AzEvent[]>(EVENTS_KEY) || [];
    const newEv: AzEvent = { ...event, id: generateId(), created_at: nowISO() } as AzEvent;
    events.push(newEv);
    write(EVENTS_KEY, events);
    return { event: newEv };
  },

  updateEvent: async (token: string | undefined, id: string, event: Partial<AzEvent>) => {
    ensureSeed();
    if (!token) throw new Error("Unauthorized");
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const pid = tokens[token];
    if (!pid) throw new Error("Unauthorized");
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    const profile = profiles.find(p => p.id === pid);
    if (!profile || profile.role !== "admin") throw new Error("Forbidden");
    const events = read<AzEvent[]>(EVENTS_KEY) || [];
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new Error("Not found");
    events[idx] = { ...events[idx], ...event } as AzEvent;
    write(EVENTS_KEY, events);
    return { event: events[idx] };
  },

  deleteEvent: async (token: string | undefined, id: string) => {
    ensureSeed();
    if (!token) throw new Error("Unauthorized");
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const pid = tokens[token];
    if (!pid) throw new Error("Unauthorized");
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    const profile = profiles.find(p => p.id === pid);
    if (!profile || profile.role !== "admin") throw new Error("Forbidden");
    let events = read<AzEvent[]>(EVENTS_KEY) || [];
    events = events.filter(e => e.id !== id);
    write(EVENTS_KEY, events);
    return { ok: true };
  },

  getMembers: async (token: string | undefined) => {
    ensureSeed();
    if (!token) throw new Error("Unauthorized");
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const pid = tokens[token];
    if (!pid) throw new Error("Unauthorized");
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    const me = profiles.find(p => p.id === pid);
    if (!me || me.role !== "admin") throw new Error("Forbidden");
    return { members: profiles };
  },

  updateMemberRole: async (token: string | undefined, id: string, role: string) => {
    ensureSeed();
    if (!token) throw new Error("Unauthorized");
    const tokens = read<Record<string,string>>(TOKENS_KEY) || {};
    const pid = tokens[token];
    if (!pid) throw new Error("Unauthorized");
    const profiles = read<Profile[]>(PROFILES_KEY) || [];
    const me = profiles.find(p => p.id === pid);
    if (!me || me.role !== "admin") throw new Error("Forbidden");
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Not found");
    profiles[idx].role = role as "admin" | "member";
    write(PROFILES_KEY, profiles);
    return { member: profiles[idx] };
  },
};
