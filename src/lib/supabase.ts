import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL as string) || "https://placeholder.supabase.co";
const supabaseAnonKey = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string) || "public-anon-key-placeholder";

if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "Faltan PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY. Configura tu .env (ver .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
