import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  const authorization = request.headers.get("Authorization");
  if (!authorization) return Response.json({ error: "Please sign in to register." }, { status: 401, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authorization } } },
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return Response.json({ error: "Please sign in to register." }, { status: 401, headers: corsHeaders });

  const { eventId } = await request.json().catch(() => ({}));
  if (typeof eventId !== "string") return Response.json({ error: "A valid event is required." }, { status: 400, headers: corsHeaders });

  const [{ data: event, error: eventError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from("events").select("id, title, date, location").eq("id", eventId).single(),
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
  ]);
  if (eventError || !event || profileError || !profile) return Response.json({ error: "Event or member profile not found." }, { status: 404, headers: corsHeaders });

  const { data: registration, error: registrationError } = await supabase
    .from("event_registrations")
    .insert({ event_id: event.id, user_id: user.id })
    .select("id, event_id, user_id, created_at")
    .single();

  if (registrationError) {
    const message = registrationError.code === "23505" ? "You are already registered for this event." : registrationError.message;
    return Response.json({ error: message }, { status: registrationError.code === "23505" ? 409 : 400, headers: corsHeaders });
  }

  const webhookUrl = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
  const sharedSecret = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_SECRET");
  if (!webhookUrl || !sharedSecret) {
    await supabase.from("event_registrations").delete().eq("id", registration.id);
    return Response.json({ error: "The registrations sheet has not been configured yet." }, { status: 503, headers: corsHeaders });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: sharedSecret,
        registration: { name: profile.full_name, email: profile.email, registered_at: registration.created_at },
        event: { title: event.title, date: event.date, location: event.location },
      }),
    });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
    if (!result?.ok) throw new Error(result?.error || "The Google Apps Script returned an invalid response");
  } catch (error) {
    await supabase.from("event_registrations").delete().eq("id", registration.id);
    const reason = error instanceof Error ? error.message : "Unknown webhook error";
    return Response.json({ error: `Google Sheets could not accept this registration: ${reason}` }, { status: 502, headers: corsHeaders });
  }

  return Response.json({ registration }, { headers: corsHeaders });
});
