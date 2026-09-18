import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthCheckResult {
  authorized: boolean;
  userId?: string;
  email?: string;
  role?: "admin" | "customer";
  error?: string;
  status: number;
}

/**
 * Verifies that the current request comes from an authenticated user with 'admin' role.
 * Used in server route handlers and actions.
 */
export async function verifyAdminAuth(): Promise<AuthCheckResult> {
  if (!isSupabaseConfigured()) {
    return {
      authorized: false,
      error: "Supabase backend is not configured",
      status: 503,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authorized: false,
        error: "Unauthorized. Authentication token is missing or expired.",
        status: 401,
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || (profile as any)?.role !== "admin") {
      return {
        authorized: false,
        error: "Forbidden. Administrative privileges are required for this action.",
        status: 403,
      };
    }

    return {
      authorized: true,
      userId: user.id,
      email: user.email,
      role: "admin",
      status: 200,
    };
  } catch (err: any) {
    return {
      authorized: false,
      error: "Authorization check encountered an internal error",
      status: 500,
    };
  }
}
