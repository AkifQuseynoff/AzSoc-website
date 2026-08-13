import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function getUserClient(token: string) {
  return createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function getAuthedUser(c: any) {
  const auth = c.req.header("Authorization");
  if (!auth) return null;
  const token = auth.replace("Bearer ", "");
  const supabase = getUserClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Health ──
app.get("/make-server-3f66e242/health", (c) => c.json({ status: "ok" }));

// ── Setup DB tables ──
app.post("/make-server-3f66e242/setup", async (c) => {
  const supabase = getServiceClient();
  try {
    // Create events table
    await supabase.rpc("exec_sql", { sql: `
      CREATE TABLE IF NOT EXISTS azsoc_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        description text,
        date text NOT NULL,
        location text,
        tag text DEFAULT 'Social',
        tag_color text DEFAULT '#c0392b',
        image_url text,
        is_featured boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS azsoc_profiles (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email text,
        full_name text,
        role text DEFAULT 'member',
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE azsoc_events ENABLE ROW LEVEL SECURITY;
      ALTER TABLE azsoc_profiles ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public can read events" ON azsoc_events;
      CREATE POLICY "Public can read events" ON azsoc_events FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Admins can manage events" ON azsoc_events;
      CREATE POLICY "Admins can manage events" ON azsoc_events FOR ALL
        USING (EXISTS (SELECT 1 FROM azsoc_profiles WHERE id = auth.uid() AND role = 'admin'));
      DROP POLICY IF EXISTS "Users read own profile" ON azsoc_profiles;
      CREATE POLICY "Users read own profile" ON azsoc_profiles FOR SELECT USING (auth.uid() = id);
      DROP POLICY IF EXISTS "Admins read all profiles" ON azsoc_profiles;
      CREATE POLICY "Admins read all profiles" ON azsoc_profiles FOR SELECT
        USING (EXISTS (SELECT 1 FROM azsoc_profiles WHERE id = auth.uid() AND role = 'admin'));
    ` });
    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// ── Register ──
app.post("/make-server-3f66e242/auth/register", async (c) => {
  const { email, password, full_name } = await c.req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name }
  });
  if (error) return c.json({ error: error.message }, 400);

  // Check if this is the first user — make them admin
  const { count } = await supabase.from("azsoc_profiles").select("*", { count: "exact", head: true });
  const role = count === 0 ? "admin" : "member";

  await supabase.from("azsoc_profiles").upsert({
    id: data.user.id,
    email,
    full_name,
    role,
  });

  // Sign them in to get a session
  const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: session, error: signInError } = await anonClient.auth.signInWithPassword({ email, password });
  if (signInError) return c.json({ error: signInError.message }, 400);

  const profile = { id: data.user.id, email, full_name, role };
  return c.json({ user: data.user, session: session.session, profile });
});

// ── Login ──
app.post("/make-server-3f66e242/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) return c.json({ error: error.message }, 400);

  const supabase = getServiceClient();
  const { data: profile } = await supabase.from("azsoc_profiles").select("*").eq("id", data.user.id).single();
  return c.json({ user: data.user, session: data.session, profile });
});

// ── Get current user profile ──
app.get("/make-server-3f66e242/auth/me", async (c) => {
  const user = await getAuthedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const supabase = getServiceClient();
  const { data: profile } = await supabase.from("azsoc_profiles").select("*").eq("id", user.id).single();
  return c.json({ user, profile });
});

// ── Events: public list ──
app.get("/make-server-3f66e242/events", async (c) => {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("azsoc_events").select("*").order("date", { ascending: true });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ events: data });
});

// ── Events: create (admin only) ──
app.post("/make-server-3f66e242/events", async (c) => {
  const user = await getAuthedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const supabase = getServiceClient();
  const { data: profile } = await supabase.from("azsoc_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);

  const body = await c.req.json();
  const { data, error } = await supabase.from("azsoc_events").insert(body).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ event: data });
});

// ── Events: update (admin only) ──
app.put("/make-server-3f66e242/events/:id", async (c) => {
  const user = await getAuthedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const supabase = getServiceClient();
  const { data: profile } = await supabase.from("azsoc_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const body = await c.req.json();
  const { data, error } = await supabase.from("azsoc_events").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ event: data });
});

// ── Events: delete (admin only) ──
app.delete("/make-server-3f66e242/events/:id", async (c) => {
  const user = await getAuthedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const supabase = getServiceClient();
  const { data: profile } = await supabase.from("azsoc_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param("id");
  const { error } = await supabase.from("azsoc_events").delete().eq("id", id);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ ok: true });
});

// ── Members: list (admin only) ──
app.get("/make-server-3f66e242/members", async (c) => {
  const user = await getAuthedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const supabase = getServiceClient();
  const { data: profile } = await supabase.from("azsoc_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  const { data, error } = await supabase.from("azsoc_profiles").select("*").order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ members: data });
});

// ── Members: update role (admin only) ──
app.put("/make-server-3f66e242/members/:id/role", async (c) => {
  const user = await getAuthedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const supabase = getServiceClient();
  const { data: profile } = await supabase.from("azsoc_profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  const id = c.req.param("id");
  const { role } = await c.req.json();
  const { data, error } = await supabase.from("azsoc_profiles").update({ role }).eq("id", id).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ member: data });
});

Deno.serve(app.fetch);
