"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "customer" | "admin";
}

interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

interface CustomerAuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch/create profile in public.profiles table
  const fetchProfile = useCallback(async (supabaseUser: User): Promise<CustomerProfile> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      const metaName = (supabaseUser.user_metadata?.full_name as string) || "";
      const metaPhone = (supabaseUser.user_metadata?.phone as string) || "";

      if (data && !error) {
        return {
          id: data.id,
          email: data.email || supabaseUser.email || "",
          full_name: data.full_name || metaName || "Nishya Patron",
          phone: metaPhone,
          role: data.role || "customer",
        };
      }

      // If no profile found in table, create one gracefully
      const newProfile: CustomerProfile = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        full_name: metaName || "Nishya Patron",
        phone: metaPhone,
        role: "customer",
      };

      await supabase.from("profiles").upsert({
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.full_name,
        role: newProfile.role,
        updated_at: new Date().toISOString(),
      });

      return newProfile;
    } catch (err) {
      console.warn("Could not load user profile from database:", err);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        full_name: (supabaseUser.user_metadata?.full_name as string) || "Nishya Patron",
        phone: (supabaseUser.user_metadata?.phone as string) || "",
        role: "customer",
      };
    }
  }, []);

  // Sync current user session
  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        const prof = await fetchProfile(currentUser);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error("Error refreshing customer auth:", err);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    refreshUser();

    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, refreshUser]);

  // Sign In function
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Authentication service is temporarily unavailable." };
    }

    try {
      setIsLoading(true);
      const supabase = createClient();
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        setIsLoading(false);
        // User-friendly error messages
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Invalid email or password. Please try again." };
        }
        if (error.message.includes("Email not confirmed")) {
          return { success: false, error: "Please verify your email address to log in." };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        const prof = await fetchProfile(data.user);
        setProfile(prof);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Sign in failed. Please try again." };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "An unexpected error occurred during sign in." };
    }
  };

  // Sign Up function
  const signUp = async ({
    email,
    password,
    fullName,
    phone,
  }: SignUpParams): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Authentication service is temporarily unavailable." };
    }

    try {
      setIsLoading(true);
      const supabase = createClient();
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();
      const cleanPhone = phone?.trim() || "";

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            role: "customer",
          },
        },
      });

      if (error) {
        setIsLoading(false);
        if (error.message.includes("already registered") || error.message.includes("User already exists")) {
          return { success: false, error: "An account with this email already exists. Please sign in instead." };
        }
        if (error.message.includes("Password should be at least")) {
          return { success: false, error: "Password must be at least 6 characters." };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        const prof = await fetchProfile(data.user);
        setProfile(prof);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Account creation failed. Please try again." };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "An unexpected error occurred during sign up." };
    }
  };

  // Sign Out function
  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Sign out encountered an error:", err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Authentication service is temporarily unavailable." };
    }

    try {
      const supabase = createClient();
      const cleanEmail = email.trim().toLowerCase();
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to send password reset email." };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}

// Convenient alias
export const useAuth = useCustomerAuth;
