import { projectId } from "../../utils/supabase/info";

export const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3f66e242`;

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

async function req(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export const api = {
  setup: () => req("/setup", { method: "POST" }),

  register: (email: string, password: string, full_name: string) =>
    req("/auth/register", { method: "POST", body: JSON.stringify({ email, password, full_name }) }),

  login: (email: string, password: string) =>
    req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  me: (token: string) => req("/auth/me", {}, token),

  getEvents: () => req("/events"),

  createEvent: (token: string, event: Omit<AzEvent, "id" | "created_at">) =>
    req("/events", { method: "POST", body: JSON.stringify(event) }, token),

  updateEvent: (token: string, id: string, event: Partial<AzEvent>) =>
    req(`/events/${id}`, { method: "PUT", body: JSON.stringify(event) }, token),

  deleteEvent: (token: string, id: string) =>
    req(`/events/${id}`, { method: "DELETE" }, token),

  getMembers: (token: string) => req("/members", {}, token),

  updateMemberRole: (token: string, id: string, role: string) =>
    req(`/members/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }, token),
};
