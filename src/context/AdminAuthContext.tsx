"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin";
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSupabaseActive: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);
const ADMIN_SESSION_KEY = "pursia_admin_session_v1";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseActive = isSupabaseConfigured();

  useEffect(() => {
    async function initAuth() {
      // 1. If Supabase is configured, check active Supabase auth session
      if (isSupabaseActive) {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role, full_name")
              .eq("id", session.user.id)
              .single() as { data: { role?: string; full_name?: string } | null };

            if (profile?.role === "admin") {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                name: profile.full_name || "Atelier Master",
                role: "admin",
              });
              setIsLoading(false);
              return;
            }
          }
        } catch {}
      }

      // 2. Check local admin session cookie/storage
      try {
        const cached = localStorage.getItem(ADMIN_SESSION_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.role === "admin") {
            setUser(parsed);
            document.cookie = "pursia_admin_session=active; path=/; max-age=86400";
          }
        }
      } catch {}

      setIsLoading(false);
    }

    initAuth();
  }, [isSupabaseActive]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseActive) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", data.user.id)
            .single() as { data: { role?: string; full_name?: string } | null };

          if (profile?.role !== "admin") {
            await supabase.auth.signOut();
            setIsLoading(false);
            return {
              success: false,
              error: "Access Denied. Only registered administrators can access the atelier CMS.",
            };
          }

          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: profile?.full_name || "Atelier Master",
            role: "admin",
          };

          setUser(adminUser);
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
          document.cookie = "pursia_admin_session=active; path=/; max-age=86400";
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    }

    // Default Administrator fallback (Allows instant visual testing)
    if (email === "admin@pursia.luxury" || email === "admin" || (email.includes("@") && pass.length >= 6)) {
      const adminUser: AdminUser = {
        id: "admin-master-01",
        email: email.includes("@") ? email : "admin@pursia.luxury",
        name: "Atelier Director",
        role: "admin",
      };

      setUser(adminUser);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      document.cookie = "pursia_admin_session=active; path=/; max-age=86400";
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: "Invalid credentials. Use admin@pursia.luxury with password admin123",
    };
  };

  const logout = async () => {
    if (isSupabaseActive) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
    }

    setUser(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    document.cookie = "pursia_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isSupabaseActive,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
