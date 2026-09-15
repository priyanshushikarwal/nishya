export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'customer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string | null;
          price: number;
          original_price: number | null;
          image: string;
          secondary_image: string | null;
          gallery: string[];
          category: string;
          badge: string | null;
          description: string;
          story: string | null;
          details: string[];
          care: string[];
          material: string | null;
          dimensions: string | null;
          weight: string | null;
          closure: string | null;
          interior: string | null;
          strap: string | null;
          lining: string | null;
          sku: string | null;
          origin: string | null;
          color: string | null;
          colors: { name: string; hex: string }[];
          rating: number;
          review_count: number;
          in_stock: boolean;
          stock_quantity: number;
          featured: boolean;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline?: string | null;
          price: number;
          original_price?: number | null;
          image: string;
          secondary_image?: string | null;
          gallery?: string[];
          category: string;
          badge?: string | null;
          description: string;
          story?: string | null;
          details?: string[];
          care?: string[];
          material?: string | null;
          dimensions?: string | null;
          weight?: string | null;
          closure?: string | null;
          interior?: string | null;
          strap?: string | null;
          lining?: string | null;
          sku?: string | null;
          origin?: string | null;
          color?: string | null;
          colors?: { name: string; hex: string }[];
          rating?: number;
          review_count?: number;
          in_stock?: boolean;
          stock_quantity?: number;
          featured?: boolean;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          tagline?: string | null;
          price?: number;
          original_price?: number | null;
          image?: string;
          secondary_image?: string | null;
          gallery?: string[];
          category?: string;
          badge?: string | null;
          description?: string;
          story?: string | null;
          details?: string[];
          care?: string[];
          material?: string | null;
          dimensions?: string | null;
          weight?: string | null;
          closure?: string | null;
          interior?: string | null;
          strap?: string | null;
          lining?: string | null;
          sku?: string | null;
          origin?: string | null;
          color?: string | null;
          colors?: { name: string; hex: string }[];
          rating?: number;
          review_count?: number;
          in_stock?: boolean;
          stock_quantity?: number;
          featured?: boolean;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      hero_campaigns: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          cta_text: string;
          cta_url: string;
          desktop_image: string;
          mobile_image: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          cta_text?: string;
          cta_url?: string;
          desktop_image: string;
          mobile_image?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          cta_text?: string;
          cta_url?: string;
          desktop_image?: string;
          mobile_image?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      homepage_sections: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          content: Json;
          sort_order: number;
          is_visible: boolean;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          subtitle?: string | null;
          content?: Json;
          sort_order?: number;
          is_visible?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          content?: Json;
          sort_order?: number;
          is_visible?: boolean;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          shipping_address: Json;
          subtotal: number;
          shipping_fee: number;
          total: number;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          shipping_address: Json;
          subtotal: number;
          shipping_fee?: number;
          total: number;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          shipping_address?: Json;
          subtotal?: number;
          shipping_fee?: number;
          total?: number;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          price: number;
          quantity: number;
          selected_color: string | null;
          image: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          price: number;
          quantity?: number;
          selected_color?: string | null;
          image?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          price?: number;
          quantity?: number;
          selected_color?: string | null;
          image?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          author_name: string;
          rating: number;
          review_title: string | null;
          review_text: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          author_name: string;
          rating: number;
          review_title?: string | null;
          review_text: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          author_name?: string;
          rating?: number;
          review_title?: string | null;
          review_text?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
      store_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
    };
  };
}
