-- ==============================================================================
-- NISHYA LUXURY HANDBAGS — COMPLETE SUPABASE DATABASE & CMS SCHEMA
-- ==============================================================================

-- 1. Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 2. User Profiles and Roles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to create profile upon new auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'role', 'customer'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Categories Table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  sort_order integer default 0,
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  tagline text,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  image text not null,
  secondary_image text,
  gallery jsonb default '[]'::jsonb,
  category text not null,
  badge text,
  description text not null,
  story text,
  details jsonb default '[]'::jsonb,
  care jsonb default '[]'::jsonb,
  material text,
  dimensions text,
  weight text,
  closure text,
  interior text,
  strap text,
  lining text,
  sku text,
  origin text,
  color text,
  colors jsonb default '[]'::jsonb,
  rating numeric(3, 2) default 5.0,
  review_count integer default 0,
  in_stock boolean default true,
  stock_quantity integer default 25,
  featured boolean default false,
  status text default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Hero Campaigns Table (Controls Storefront Desktop & Mobile Hero Carousel)
create table if not exists public.hero_campaigns (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  description text,
  cta_text text not null default 'SHOP NOW',
  cta_url text not null default '/products',
  desktop_image text not null,
  mobile_image text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Homepage Sections Table (Controls Section Ordering, Visibility & Text/Image Content)
create table if not exists public.homepage_sections (
  id text primary key,
  title text not null,
  subtitle text,
  content jsonb default '{}'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Orders & Order Items Tables
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null,
  subtotal numeric(10, 2) not null,
  shipping_fee numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status text default 'pending' check (order_status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id text references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  price numeric(10, 2) not null,
  quantity integer not null default 1,
  selected_color text,
  image text
);

-- 8. Customer Reviews Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text references public.products(id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_title text,
  review_text text not null,
  status text default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Store Settings Table
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.hero_campaigns enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.store_settings enable row level security;

-- Helper function to check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Profiles policies
create policy "Users can read own profile or admin can read all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin());

-- Categories policies (Public can view visible categories, admin has full access)
create policy "Public can view visible categories"
  on public.categories for select
  using (is_visible = true or public.is_admin());

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- Products policies (Public can view published products, admin has full access)
create policy "Public can view published products"
  on public.products for select
  using (status = 'published' or public.is_admin());

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- Hero Campaigns policies
create policy "Public can view active campaigns"
  on public.hero_campaigns for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage hero campaigns"
  on public.hero_campaigns for all
  using (public.is_admin());

-- Homepage Sections policies
create policy "Public can view visible homepage sections"
  on public.homepage_sections for select
  using (is_visible = true or public.is_admin());

create policy "Admins can manage homepage sections"
  on public.homepage_sections for all
  using (public.is_admin());

-- Orders policies (Customers can create, Admins can read & update all)
create policy "Anyone can insert order"
  on public.orders for insert
  with check (true);

create policy "Admins can view and manage orders"
  on public.orders for all
  using (public.is_admin());

create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);

create policy "Admins can view and manage order items"
  on public.order_items for all
  using (public.is_admin());

-- Reviews policies
create policy "Public can view approved reviews"
  on public.reviews for select
  using (status = 'approved' or public.is_admin());

create policy "Customers can submit review"
  on public.reviews for insert
  with check (true);

create policy "Admins can manage reviews"
  on public.reviews for all
  using (public.is_admin());

-- Store Settings policies
create policy "Public can view store settings"
  on public.store_settings for select
  using (true);

create policy "Admins can manage store settings"
  on public.store_settings for all
  using (public.is_admin());

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- ==============================================================================

-- Create buckets for product media and CMS media
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true),
       ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

create policy "Public Access to product-media"
  on storage.objects for select
  using (bucket_id in ('product-media', 'cms-media'));

create policy "Admin Upload to media buckets"
  on storage.objects for insert
  with check (bucket_id in ('product-media', 'cms-media') and (auth.role() = 'authenticated' or public.is_admin()));

create policy "Admin Delete from media buckets"
  on storage.objects for delete
  using (bucket_id in ('product-media', 'cms-media') and (auth.role() = 'authenticated' or public.is_admin()));

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Categories
insert into public.categories (name, slug, description, sort_order, is_visible) values
('Laptop Bags', 'laptop-bags', 'Artisanal quilted laptop protection', 1, true),
('Handbags', 'handbags', 'Architectural luxury handbags in calfskin', 2, true),
('Shoulder Bags', 'shoulder-bags', 'Parisian crescent silhouettes & saddlebags', 3, true),
('Totes', 'totes', 'Spacious everyday luxury totes', 4, true),
('Clutches', 'clutches', 'Evening minaudières and pleated clutches', 5, true),
('Mini Bags', 'mini-bags', 'Petite micro statement pieces', 6, true),
('Wallets', 'wallets', 'Bifold calfskin cardholders & pouches', 7, true),
('Artisan Storage', 'artisan-storage', 'Hand-braided natural cotton rope baskets', 8, true)
on conflict (slug) do nothing;

-- Seed Hero Campaigns
insert into public.hero_campaigns (title, subtitle, description, cta_text, cta_url, desktop_image, mobile_image, sort_order, is_active) values
('Safari Quilted Laptop Bag', 'Carry Your Story', 'Everyday elegance in every detail. Quilted blush canvas with Jaipur fauna motif.', 'SHOP NOW', '/product/safari-quilted-laptop-bag', '/images/nishya/carry_your_story_pink_arch.jpg', '/images/nishya/carry_your_story_pink_arch.jpg', 1, true),
('Mughal Forest Edition', 'Heritage in Every Detail', 'Indian miniature forest art rendered in midnight green, noir and antique gold.', 'EXPLORE', '/product/mughal-forest-laptop-bag', '/images/nishya/carry_your_story_black_gold.jpg', '/images/nishya/carry_your_story_black_gold.jpg', 2, true),
('Architectural Geometry', 'Sculptural Poise', 'Full-grain Italian calfskin with hand-polished 18k gilded pyramid accents.', 'DISCOVER', '/product/golden-pyramid-handbag', '/images/nishya/carry_your_story_pink_float.jpg', '/images/nishya/carry_your_story_pink_float.jpg', 3, true),
('Artisan Rope Storage', 'Little Things Big Joys', 'Handcrafted braided natural cotton rope animal basket for daily essentials.', 'SHOP NOW', '/product/penguin-artisan-rope-basket', '/images/nishya/little_things_big_joys_basket.jpg', '/images/nishya/little_things_big_joys_basket.jpg', 4, true);

-- Seed Homepage Sections
insert into public.homepage_sections (id, title, subtitle, sort_order, is_visible, content) values
('announcement', 'Announcement Bar', 'Top marquee banner', 1, true, '{"text": "✦ COMPLIMENTARY INSURED PRIORITY DELIVERY ON ORDERS OVER ₹5,000 | ATELIER GUARANTEE ✦", "link": "/products"}'),
('hero', 'Hero Showcase', 'Editorial asymmetrical desktop hero & swipe mobile carousel', 2, true, '{"heading": "Your Ultimate Destination for Luxe Handbags", "subheading": "Crafted for elegance, designed for confidence. Architectural handbag creations sculpted in full-grain Italian leather."}'),
('whats_new', 'What''s New', 'Autumn / Winter Collection highlights', 3, true, '{"heading": "What''s New", "season": "Autumn / Winter 2026 Collection"}'),
('brand_strip', 'Brand Atelier Strip', 'Trust points & craftsmanship marquee', 4, true, '{"strip_text": "100% ITALIAN CALFSKIN • HAND-FINISHED IN JAIPUR & FLORENCE • LIFETIME ATELIER GUARANTEE"}'),
('circular_showcase', 'Featured Circular Showcase', 'The Signature Safari architectural arch spotlight', 5, true, '{"tagline": "The Signature Safari", "subtitle": "Where artisanal craftsmanship meets everyday elegance", "discount": "50%"}'),
('product_discovery', 'Curated Selection Grid', '4-Column luxury handbag discovery grid', 6, true, '{"heading": "Discover the finest bags that combine style, elegance and perfection.", "button_text": "Explore All Pieces"}'),
('promo_banner', 'Promotional Spotlight Banner', 'Dark gilded luxury spotlight banner', 7, true, '{"title": "New Season, New Icons", "subtitle": "Discover our latest collection crafted for modern elegance.", "button_text": "Shop Now"}'),
('lifestyle_model', 'Editorial Showcase', 'Effortless grace portrait model layout', 8, true, '{"heading": "Effortless Grace for Every Occasion", "handwritten": "Designed for every occasion"}'),
('everyday_section', 'Daily Belongings Section', 'Everyday split editorial with gold seal', 9, true, '{"heading": "For your everyday Belongings", "seal_text": "ATELIER GENUINE LEATHER"}'),
('uniqueness_section', 'Designed for Uniqueness', 'Artisanal individuality magazine block', 10, true, '{"heading": "Designed for Uniqueness", "quote": "True luxury is having what nobody else possesses."}'),
('instagram_gallery', 'Social Editorial Gallery', '#NISHYA BAGS seasonal lookbook grid', 11, true, '{"hashtag": "#NISHYA BAGS", "heading": "Unbox Your New Favourite"}'),
('footer', 'Footer & Newsletter', 'Atelier multi-column footer', 12, true, '{"tagline": "Timeless handbags crafted for modern elegance.", "email": "concierge@nishya.luxury"}')
on conflict (id) do nothing;

-- Seed Store Settings
insert into public.store_settings (key, value) values
('brand', '{"name": "Nishya", "tagline": "Haute Maroquinerie", "currency": "INR", "symbol": "₹"}'),
('announcement', '{"text": "✦ COMPLIMENTARY EXPRESS INSURED SHIPPING ON ORDERS OVER ₹5,000 ✦", "active": true}'),
('shipping', '{"free_shipping_threshold": 5000, "standard_fee": 250, "estimated_days": "2-4 Business Days"}'),
('seo', '{"default_title": "Nishya — Luxe Handbags & Purses", "default_description": "Discover timeless luxury handbags crafted with architectural elegance in full-grain calfskin."}')
on conflict (key) do nothing;
