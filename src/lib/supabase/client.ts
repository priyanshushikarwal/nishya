import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    !supabaseUrl.includes("placeholder")
  );
};

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    // Provide a safe placeholder client that doesn't crash during build or pre-setup
    return createBrowserClient<any>(
      "https://placeholder.supabase.co",
      "placeholder-anon-key"
    );
  }

  return createBrowserClient<any>(supabaseUrl, supabaseAnonKey);
};
