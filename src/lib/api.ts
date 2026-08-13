import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

export type ContactMessage = {
  name: string;
  email: string;
  year: string;
  message: string;
};

function requireConfiguration() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.");
  }
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("id, email, full_name, role, created_at").eq("id", userId).single();
  throwIfError(error);
  return data as Profile;
}

export const api = {
  setup: async () => {
    requireConfiguration();
    return { ok: true };
  },

  register: async (email: string, password: string, fullName: string) => {
    requireConfiguration();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    throwIfError(error);

    const profile = data.session && data.user ? await getProfile(data.user.id) : null;
    return { user: data.user, session: data.session, profile };
  },

  login: async (email: string, password: string) => {
    requireConfiguration();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    throwIfError(error);
    if (!data.user || !data.session) throw new Error("Unable to start a session.");
    return { user: data.user, session: data.session, profile: await getProfile(data.user.id) };
  },

  me: async (token?: string) => {
    requireConfiguration();
    const { data, error } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    throwIfError(error);
    if (!data.user) throw new Error("Unauthorized");
    return { user: data.user, profile: await getProfile(data.user.id) };
  },

  getEvents: async () => {
    requireConfiguration();
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    throwIfError(error);
    return { events: (data || []) as AzEvent[] };
  },

  createEvent: async (_token: string | undefined, event: Omit<AzEvent, "id" | "created_at">) => {
    requireConfiguration();
    const { data, error } = await supabase.from("events").insert(event).select().single();
    throwIfError(error);
    return { event: data as AzEvent };
  },

  updateEvent: async (_token: string | undefined, id: string, event: Partial<AzEvent>) => {
    requireConfiguration();
    const { data, error } = await supabase.from("events").update(event).eq("id", id).select().single();
    throwIfError(error);
    return { event: data as AzEvent };
  },

  deleteEvent: async (_token: string | undefined, id: string) => {
    requireConfiguration();
    const { error } = await supabase.from("events").delete().eq("id", id);
    throwIfError(error);
    return { ok: true };
  },

  getMembers: async (_token: string | undefined) => {
    requireConfiguration();
    const { data, error } = await supabase.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: true });
    throwIfError(error);
    return { members: (data || []) as Profile[] };
  },

  updateMemberRole: async (_token: string | undefined, id: string, role: "admin" | "member") => {
    requireConfiguration();
    const { data, error } = await supabase.from("profiles").update({ role }).eq("id", id).select("id, email, full_name, role, created_at").single();
    throwIfError(error);
    return { member: data as Profile };
  },

  createContactMessage: async (message: ContactMessage) => {
    requireConfiguration();
    const { error } = await supabase.from("contact_messages").insert(message);
    throwIfError(error);
    return { ok: true };
  },
};
