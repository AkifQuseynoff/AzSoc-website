import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

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
  id: string;
  name: string;
  email: string;
  year: string;
  message: string;
  created_at: string;
};

export type CommitteeMember = {
  id: string;
  name: string;
  role: string;
  display_order: number;
  created_at: string;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
};

function requireConfiguration() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.");
  }
}

function clientForToken(token?: string) {
  // For client-side operations, prefer the existing `supabase` instance which
  // maintains the browser auth session. Creating a new client with the anon
  // key plus an Authorization header may not establish the same auth context
  // for Storage RLS. If no token provided, return the anon client.
  if (!token) return supabase;
  return supabase;
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

  requestPasswordReset: async (email: string) => {
    requireConfiguration();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    });
    throwIfError(error);
    return { ok: true };
  },

  updatePassword: async (newPassword: string) => {
    requireConfiguration();
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    throwIfError(error);
    if (!data.user) throw new Error("Unable to update password. Try requesting a new reset link.");
    return { user: data.user, profile: await getProfile(data.user.id) };
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
    const client = clientForToken(_token);
    const { data, error } = await client.from("events").insert(event).select().single();
    throwIfError(error);
    return { event: data as AzEvent };
  },

  updateEvent: async (_token: string | undefined, id: string, event: Partial<AzEvent>) => {
    requireConfiguration();
    const client = clientForToken(_token);
    const { data, error } = await client.from("events").update(event).eq("id", id).select().single();
    throwIfError(error);
    return { event: data as AzEvent };
  },

  deleteEvent: async (_token: string | undefined, id: string) => {
    requireConfiguration();
    const client = clientForToken(_token);
    const { error } = await client.from("events").delete().eq("id", id);
    throwIfError(error);
    return { ok: true };
  },

  uploadToStorage: async (_token: string | undefined, bucket: string, path: string, file: any) => {
    requireConfiguration();
    const client = clientForToken(_token);
    // upload only; return the storage path so the app can reference it from the bucket
    const { error: uploadError } = await client.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true });
    if (uploadError) throw uploadError;
    return { path };
  },
  downloadFromStorage: async (_token: string | undefined, bucket: string, path: string) => {
    requireConfiguration();
    const client = clientForToken(_token);
    const { data, error } = await client.storage.from(bucket).download(path);
    if (error) throw error;
    // convert to object URL for immediate use in <img>
    const blob = await data.arrayBuffer().then(buf => new Blob([buf]));
    const objectUrl = URL.createObjectURL(blob);
    return { url: objectUrl };
  },
  deleteFromStorage: async (_token: string | undefined, bucket: string, path: string) => {
    requireConfiguration();
    const client = clientForToken(_token);
    const { error } = await client.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { ok: true };
  },

  getMyEventRegistrations: async () => {
    requireConfiguration();
    const { data, error } = await supabase.from("event_registrations").select("id, event_id, user_id, created_at");
    throwIfError(error);
    return { registrations: (data || []) as EventRegistration[] };
  },

  registerForEvent: async (eventId: string) => {
    requireConfiguration();
    const { data, error } = await supabase.functions.invoke("register-for-event", { body: { eventId } });
    if (error) {
      const response = "context" in error ? error.context : null;
      if (response instanceof Response) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        if (body?.error) throw new Error(body.error);
      }
      throw new Error("Registration service is unavailable. Please try again.");
    }
    return { registration: data.registration as EventRegistration };
  },

  getMembers: async (_token: string | undefined) => {
    requireConfiguration();
    const client = clientForToken(_token);
    const { data, error } = await client.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: true });
    throwIfError(error);
    return { members: (data || []) as Profile[] };
  },

  updateMemberRole: async (_token: string | undefined, id: string, role: "admin" | "member") => {
    requireConfiguration();
    const client = clientForToken(_token);
    const { data, error } = await client.from("profiles").update({ role }).eq("id", id).select("id, email, full_name, role, created_at").single();
    throwIfError(error);
    return { member: data as Profile };
  },

  getCommitteeMembers: async () => {
    requireConfiguration();
    const { data, error } = await supabase.from("committee_members").select("*").order("display_order", { ascending: true });
    throwIfError(error);
    return { members: (data || []) as CommitteeMember[] };
  },

  createCommitteeMember: async (member: Pick<CommitteeMember, "name" | "role" | "display_order">) => {
    requireConfiguration();
    const { data, error } = await supabase.from("committee_members").insert(member).select().single();
    throwIfError(error);
    return { member: data as CommitteeMember };
  },

  updateCommitteeMember: async (id: string, member: Partial<Pick<CommitteeMember, "name" | "role" | "display_order">>) => {
    requireConfiguration();
    const { data, error } = await supabase.from("committee_members").update(member).eq("id", id).select().single();
    throwIfError(error);
    return { member: data as CommitteeMember };
  },

  deleteCommitteeMember: async (id: string) => {
    requireConfiguration();
    const { error } = await supabase.from("committee_members").delete().eq("id", id);
    throwIfError(error);
    return { ok: true };
  },

  createContactMessage: async (message: Omit<ContactMessage, "id" | "created_at">) => {
    requireConfiguration();
    const { error } = await supabase.from("contact_messages").insert(message);
    throwIfError(error);
    return { ok: true };
  },
  deleteContactMessage: async (_token: string | undefined, id: string) => {
    requireConfiguration();
    const client = clientForToken(_token);
    const { error } = await client.from('contact_messages').delete().eq('id', id);
    throwIfError(error);
    return { ok: true };
  },

  getContactMessages: async () => {
    requireConfiguration();
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    throwIfError(error);
    return { messages: (data || []) as ContactMessage[] };
  },
};
