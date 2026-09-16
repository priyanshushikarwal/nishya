"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ShoppingBagIcon,
  Users,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Hero & Campaigns", href: "/admin/hero", icon: Sparkles },
  { name: "Homepage CMS", href: "/admin/homepage", icon: Sliders },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout, isSupabaseActive } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render children without sidebar shell
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#151418] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm tracking-widest text-luxury-gold uppercase">
            Verifying Atelier Authority...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#1F1E24] flex">
      {/* ======================================================== */}
      {/* 1. DESKTOP & TABLET SIDEBAR                              */}
      {/* ======================================================== */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#18171C] text-white flex flex-col justify-between border-r border-white/10 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="space-y-0.5">
              <span className="font-serif text-xl font-bold tracking-[0.2em] text-white block">
                NISHYA
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-luxury-gold font-semibold block">
                Atelier CMS
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all",
                    isActive
                      ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20 font-semibold"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-luxury-gold/80")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Mode Indicator, View Store, Profile & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Supabase status badge */}
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-white/60">Backend</span>
            <span className={cn("font-semibold", isSupabaseActive ? "text-emerald-400" : "text-amber-400")}>
              {isSupabaseActive ? "Supabase Live" : "Local Standalone"}
            </span>
          </div>

          {/* View live storefront */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-luxury-gold" />
          </Link>

          {/* Admin User info & logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-white/50 truncate">{user.email}</div>
            </div>
            <button
              onClick={() => logout()}
              title="Log out"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-950/80 text-white/80 hover:text-red-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA WITH TOP BAR                       */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-luxury-border px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg border border-luxury-border flex items-center justify-center text-luxury-charcoal"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, orders, campaigns..."
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-luxury-soft/80 border border-luxury-border text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <button
                className="w-9 h-9 rounded-full bg-luxury-soft hover:bg-luxury-border/60 text-luxury-charcoal flex items-center justify-center transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-luxury-gold" />
              </button>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-luxury-charcoal hover:bg-luxury-gold text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
