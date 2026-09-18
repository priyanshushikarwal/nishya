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
const ADMIN_SESSION_KEY = "nishya_admin_session_v1";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseActive = isSupabaseConfigured();

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseActive) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role, full_name")
              .eq("id", user.id)
              .single() as { data: { role?: string; full_name?: string } | null };

            if (profile?.role === "admin") {
              setUser({
                id: user.id,
                email: user.email || "",
                name: profile.full_name || "Atelier Master",
                role: "admin",
              });
              setIsLoading(false);
              return;
            }
          }
        } catch {}
      }

      setUser(null);
      setIsLoading(false);
    }

    initAuth();
  }, [isSupabaseActive]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (!isSupabaseActive) {
      setIsLoading(false);
      return {
        success: false,
        error: "Supabase backend is not configured. Please check your environment configuration.",
      };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile, error: profError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .single() as { data: { role?: string; full_name?: string } | null; error: any };

        if (profError || profile?.role !== "admin") {
          await supabase.auth.signOut();
          setIsLoading(false);
          return {
            success: false,
            error: "Access Denied. Only authorized atelier administrators can access this portal.",
          };
        }

        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: profile?.full_name || "Atelier Master",
          role: "admin",
        };

        setUser(adminUser);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Authentication failed. No user returned." };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "An unexpected error occurred." };
    }
  };

  const logout = async () => {
    if (isSupabaseActive) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
    }

    setUser(null);
    router.push("/admin/login");
    router.refresh();
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
