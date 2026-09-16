import { products as initialProducts } from "@/data/products";
import { categories, Category } from "@/data/categories";
import { Product } from "@/types/product";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const CMS_PRODUCTS_KEY = "nishya_cms_products_v1";

// Helper to get local memory/storage products
function getLocalProducts(): Product[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CMS_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  return initialProducts;
}

function saveLocalProducts(list: Product[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CMS_PRODUCTS_KEY, JSON.stringify(list));
      // Notify all listening components on the storefront immediately
      window.dispatchEvent(new CustomEvent("nishya_products_updated", { detail: list }));
    } catch {}
  }
}

// Convert DB snake_case row to frontend camelCase Product
function mapDbToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || undefined,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image: row.image,
    secondaryImage: row.secondary_image || undefined,
    gallery: Array.isArray(row.gallery) ? row.gallery : [row.image],
    category: row.category as any,
    badge: row.badge || undefined,
    description: row.description,
    story: row.story || undefined,
    details: Array.isArray(row.details) ? row.details : [],
    care: Array.isArray(row.care) ? row.care : [],
    material: row.material || undefined,
    dimensions: row.dimensions || undefined,
    weight: row.weight || undefined,
    closure: row.closure || undefined,
    interior: row.interior || undefined,
    strap: row.strap || undefined,
    lining: row.lining || undefined,
    sku: row.sku || undefined,
    origin: row.origin || undefined,
    color: row.color || undefined,
    colors: Array.isArray(row.colors) ? row.colors : [],
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.review_count || 0),
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
  };
}

// Convert frontend Product to DB snake_case row
function mapProductToDb(p: Product): any {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline || null,
    price: p.price,
    original_price: p.originalPrice || null,
    image: p.image,
    secondary_image: p.secondaryImage || null,
    gallery: p.gallery || [p.image],
    category: p.category,
    badge: p.badge || null,
    description: p.description,
    story: p.story || null,
    details: p.details || [],
    care: p.care || [],
    material: p.material || null,
    dimensions: p.dimensions || null,
    weight: p.weight || null,
    closure: p.closure || null,
    interior: p.interior || null,
    strap: p.strap || null,
    lining: p.lining || null,
    sku: p.sku || null,
    origin: p.origin || null,
    color: p.color || null,
    colors: p.colors || [],
    rating: p.rating || 5.0,
    review_count: p.reviewCount || 0,
    in_stock: p.inStock,
    featured: p.featured || false,
    status: "published",
    updated_at: new Date().toISOString(),
  };
}

// ==============================================================================
// PUBLIC STOREFRONT ACCESS
// ==============================================================================

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbToProduct);
      }
    } catch {}
  }

  return getLocalProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return mapDbToProduct(data);
      }
    } catch {}
  }

  const list = getLocalProducts();
  return list.find((p) => p.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.featured);
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getRelatedProducts(currentSlug: string, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  const current = all.find((p) => p.slug === currentSlug);
  if (!current) return all.slice(0, limit);

  const sameCategory = all.filter(
    (p) => p.slug !== currentSlug && p.category === current.category
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const others = all.filter(
    (p) => p.slug !== currentSlug && p.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

// ==============================================================================
// ADMIN CMS CRUD
// ==============================================================================

export async function adminGetAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbToProduct);
      }
    } catch {}
  }

  return getLocalProducts();
}

export async function adminSaveProduct(product: Product): Promise<boolean> {
  // 1. Supabase direct write if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const dbRow = mapProductToDb(product);
      await supabase.from("products").upsert(dbRow);
    } catch {}
  }

  // 2. Server API sync
  if (typeof window !== "undefined") {
    try {
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }).catch(() => {});
    } catch {}
  }

  // 3. Local storage synchronization
  const list = getLocalProducts();
  const index = list.findIndex((p) => p.id === product.id || p.slug === product.slug);
  let updated: Product[];
  if (index >= 0) {
    updated = [...list];
    updated[index] = product;
  } else {
    updated = [product, ...list];
  }
  saveLocalProducts(updated);
  return true;
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  // 1. Supabase direct delete if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase.from("products").delete().eq("id", id);
    } catch {}
  }

  // 2. Server API sync
  if (typeof window !== "undefined") {
    try {
      fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => {});
    } catch {}
  }

  // 3. Local storage synchronization
  const list = getLocalProducts();
  const filtered = list.filter((p) => p.id !== id);
  saveLocalProducts(filtered);
  return true;
}
