import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { products as localProducts } from "@/data/products";
import { categories as localCategories } from "@/data/categories";
import { heroSlidesData as localHeroSlides } from "@/data/heroSlides";

export interface HeroCampaign {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_text: string;
  cta_url: string;
  desktop_image: string;
  mobile_image?: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomepageSection {
  id: string;
  title: string;
  subtitle?: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  items_count: number;
}

// Local mock initial state if Supabase not yet connected
const defaultHomepageSections: HomepageSection[] = [
  { id: "announcement", title: "Announcement Bar", subtitle: "Top marquee banner", sort_order: 1, is_visible: true, content: { text: "✦ COMPLIMENTARY INSURED PRIORITY DELIVERY ON ORDERS OVER ₹5,000 | ATELIER GUARANTEE ✦" } },
  { id: "hero", title: "Hero Showcase", subtitle: "Asymmetric desktop hero & swipe mobile carousel", sort_order: 2, is_visible: true, content: { heading: "Your Ultimate Destination for Luxe Handbags", subheading: "Crafted for elegance, designed for confidence. Architectural handbag creations sculpted in full-grain Italian leather." } },
  { id: "whats_new", title: "What's New", subtitle: "Autumn / Winter Collection highlights", sort_order: 3, is_visible: true, content: { heading: "What's New", season: "Autumn / Winter 2026 Collection" } },
  { id: "brand_strip", title: "Brand Atelier Strip", subtitle: "Craftsmanship marquee", sort_order: 4, is_visible: true, content: { strip_text: "100% ITALIAN CALFSKIN • HAND-FINISHED IN JAIPUR & FLORENCE • LIFETIME ATELIER GUARANTEE" } },
  { id: "circular_showcase", title: "Featured Circular Showcase", subtitle: "The Signature Safari architectural arch spotlight", sort_order: 5, is_visible: true, content: { tagline: "The Signature Safari", subtitle: "Where artisanal craftsmanship meets everyday elegance", discount: "50%" } },
  { id: "product_discovery", title: "Curated Selection Grid", subtitle: "4-Column luxury handbag discovery grid", sort_order: 6, is_visible: true, content: { heading: "Discover the finest bags that combine style, elegance and perfection.", button_text: "Explore All Pieces" } },
  { id: "promo_banner", title: "Promotional Spotlight Banner", subtitle: "Dark gilded luxury spotlight banner", sort_order: 7, is_visible: true, content: { title: "New Season, New Icons", subtitle: "Discover our latest collection crafted for modern elegance.", button_text: "Shop Now" } },
  { id: "lifestyle_model", title: "Editorial Showcase", subtitle: "Effortless grace portrait model layout", sort_order: 8, is_visible: true, content: { heading: "Effortless Grace for Every Occasion", handwritten: "Designed for every occasion" } },
  { id: "everyday_section", title: "Daily Belongings Section", subtitle: "Everyday split editorial with gold seal", sort_order: 9, is_visible: true, content: { heading: "For your everyday Belongings", seal_text: "ATELIER GENUINE LEATHER" } },
  { id: "uniqueness_section", title: "Designed for Uniqueness", subtitle: "Artisanal individuality magazine block", sort_order: 10, is_visible: true, content: { heading: "Designed for Uniqueness", quote: "True luxury is having what nobody else possesses." } },
  { id: "instagram_gallery", title: "Social Editorial Gallery", subtitle: "#PURSIA BAGS seasonal lookbook grid", sort_order: 11, is_visible: true, content: { hashtag: "#PURSIA BAGS", heading: "Unbox Your New Favourite" } },
  { id: "footer", title: "Footer & Newsletter", subtitle: "Atelier multi-column footer", sort_order: 12, is_visible: true, content: { tagline: "Timeless handbags crafted for modern elegance.", email: "concierge@pursia.luxury" } },
];

const defaultHeroCampaigns: HeroCampaign[] = localHeroSlides.map((slide, idx) => ({
  id: `hero-${slide.id}`,
  title: idx === 0 ? "Safari Quilted Laptop Bag" : idx === 1 ? "Mughal Forest Laptop Bag" : idx === 2 ? "Architectural Geometry" : "Artisan Rope Basket",
  subtitle: idx === 0 ? "Carry Your Story" : idx === 1 ? "Heritage in Every Detail" : idx === 2 ? "Sculptural Poise" : "Little Things Big Joys",
  description: "Handcrafted in full-grain Italian leather with hand-polished 18k gold hardware.",
  cta_text: slide.ctaText,
  cta_url: slide.ctaLink,
  desktop_image: slide.image,
  mobile_image: slide.image,
  sort_order: idx + 1,
  is_active: true,
}));

// Local storage key helpers for seamless client demo state persistence
const CMS_HERO_KEY = "pursia_cms_hero_campaigns_v1";
const CMS_SECTIONS_KEY = "pursia_cms_sections_v1";
const CMS_PRODUCTS_KEY = "pursia_cms_products_v1";
const CMS_ORDERS_KEY = "pursia_cms_orders_v1";

// ==============================================================================
// HERO CAMPAIGNS
// ==============================================================================

export async function getHeroCampaigns(): Promise<HeroCampaign[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("hero_campaigns")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as HeroCampaign[];
      }
    } catch {
      // Fallback to local storage/defaults
    }
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CMS_HERO_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return defaultHeroCampaigns;
}

export async function saveHeroCampaign(campaign: HeroCampaign): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("hero_campaigns")
        .upsert(campaign as any);
      if (!error) return true;
    } catch {}
  }

  if (typeof window !== "undefined") {
    const list = await getHeroCampaigns();
    const existingIndex = list.findIndex((c) => c.id === campaign.id);
    let updated: HeroCampaign[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = campaign;
    } else {
      updated = [...list, campaign];
    }
    localStorage.setItem(CMS_HERO_KEY, JSON.stringify(updated));
  }
  return true;
}

export async function saveHeroCampaignsOrder(campaigns: HeroCampaign[]): Promise<boolean> {
  const reordered = campaigns.map((c, index) => ({
    ...c,
    sort_order: index + 1,
  }));

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      for (const item of reordered) {
        await supabase
          .from("hero_campaigns")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }
      return true;
    } catch {}
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CMS_HERO_KEY, JSON.stringify(reordered));
  }
  return true;
}

export async function deleteHeroCampaign(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase.from("hero_campaigns").delete().eq("id", id);
      return true;
    } catch {}
  }

  if (typeof window !== "undefined") {
    const list = await getHeroCampaigns();
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(CMS_HERO_KEY, JSON.stringify(filtered));
  }
  return true;
}

// ==============================================================================
// HOMEPAGE SECTIONS
// ==============================================================================

export async function getHomepageSections(): Promise<HomepageSection[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as HomepageSection[];
      }
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CMS_SECTIONS_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return defaultHomepageSections;
}

export async function saveHomepageSections(sections: HomepageSection[]): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      for (const sec of sections) {
        await supabase
          .from("homepage_sections")
          .upsert({
            id: sec.id,
            title: sec.title,
            subtitle: sec.subtitle,
            content: sec.content as any,
            sort_order: sec.sort_order,
            is_visible: sec.is_visible,
          });
      }
      return true;
    } catch {}
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CMS_SECTIONS_KEY, JSON.stringify(sections));
  }
  return true;
}

// ==============================================================================
// ORDERS
// ==============================================================================

const defaultOrders: AdminOrder[] = [
  {
    id: "ORD-9481",
    customer_name: "Arya Singhania",
    customer_email: "arya.s@vogue.in",
    customer_phone: "+91 98200 12345",
    subtotal: 3499,
    shipping_fee: 0,
    total: 3499,
    payment_status: "paid",
    order_status: "processing",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    items_count: 1,
  },
  {
    id: "ORD-9480",
    customer_name: "Devika Oberoi",
    customer_email: "devika@oberoi.luxury",
    customer_phone: "+91 98111 54321",
    subtotal: 6498,
    shipping_fee: 0,
    total: 6498,
    payment_status: "paid",
    order_status: "shipped",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items_count: 2,
  },
  {
    id: "ORD-9479",
    customer_name: "Karan Johar",
    customer_email: "karan@dharma.in",
    customer_phone: "+91 99300 98765",
    subtotal: 2999,
    shipping_fee: 0,
    total: 2999,
    payment_status: "pending",
    order_status: "pending",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    items_count: 1,
  },
];

export async function getAdminOrders(): Promise<AdminOrder[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((o: any) => ({
          id: o.id,
          customer_name: o.customer_name,
          customer_email: o.customer_email,
          customer_phone: o.customer_phone,
          subtotal: Number(o.subtotal),
          shipping_fee: Number(o.shipping_fee || 0),
          total: Number(o.total),
          payment_status: o.payment_status,
          order_status: o.order_status,
          created_at: o.created_at,
          items_count: 1,
        }));
      }
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CMS_ORDERS_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return defaultOrders;
}

export async function updateOrderStatus(orderId: string, status: AdminOrder["order_status"]): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase.from("orders").update({ order_status: status }).eq("id", orderId);
      return true;
    } catch {}
  }

  if (typeof window !== "undefined") {
    const list = await getAdminOrders();
    const updated = list.map((o) => (o.id === orderId ? { ...o, order_status: status } : o));
    localStorage.setItem(CMS_ORDERS_KEY, JSON.stringify(updated));
  }
  return true;
}

// ==============================================================================
// MEDIA UPLOAD TO SUPABASE STORAGE
// ==============================================================================

export async function uploadMediaFile(
  file: File,
  bucket: "product-media" | "cms-media" = "product-media"
): Promise<{ url: string; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return { url: data.publicUrl };
      }
      return { url: "", error: uploadError.message };
    } catch (err: any) {
      return { url: "", error: err.message };
    }
  }

  // Fallback: create an object URL or data URL for instant live preview
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string });
    };
    reader.readAsDataURL(file);
  });
}
