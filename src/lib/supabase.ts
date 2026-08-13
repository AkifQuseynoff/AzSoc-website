import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

// Placeholder values let the app show a useful configuration error instead of
// failing during its initial module load when .env.local has not been added yet.
export const supabase = createClient(
  url || "https://project-not-configured.supabase.co",
  publishableKey || "project-not-configured",
);
