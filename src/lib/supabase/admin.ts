import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createSupabaseClient<any>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
