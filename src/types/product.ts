export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  gallery?: string[];
  category:
    | "Laptop Bags"
    | "Artisan Storage"
    | "Handbags"
    | "Shoulder Bags"
    | "Clutches"
    | "Pouch Bags"
    | "Totes"
    | "Mini Bags"
    | "Wallets"
    | "Backpacks"
    | "Sling Bags"
    | "Hats & Headwear"
    | "Yoga & Gym Bags"
    | string;
  badge?: string;
  description: string;
  details?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  closure?: string;
  interior?: string;
  strap?: string;
  lining?: string;
  sku?: string;
  origin?: string;
  story?: string;
  care?: string[];
  color?: string;
  colors?: { name: string; hex: string }[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface FilterOptions {
  category: string;
  priceRange: [number, number];
  sortBy: "featured" | "price-asc" | "price-desc" | "newest";
  inStockOnly: boolean;
  searchQuery: string;
}
