-- ==============================================================================
-- NISHYA LUXURY — HIGH-VOLUME PERFORMANCE & CONCURRENCY OPTIMIZATION
-- Designed for 10,000+ completed orders/day workload
-- ==============================================================================

-- 1. High-Performance B-Tree Indexes for Fast Reads & Joins
-- Eliminates sequential scans across orders, items, products, and categories

-- Orders table indexes
create index if not exists idx_orders_customer_email on public.orders (customer_email);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_payment_status on public.orders (payment_status);
create index if not exists idx_orders_order_status on public.orders (order_status);

-- Order items table indexes (crucial for join performance)
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- Products catalog indexes (serves high-volume catalog queries)
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_status_created on public.products (status, created_at desc);
create index if not exists idx_products_featured on public.products (featured) where featured = true;
create index if not exists idx_products_slug on public.products (slug);

-- CMS and Hero sorting indexes
create index if not exists idx_hero_campaigns_sort on public.hero_campaigns (is_active, sort_order);
create index if not exists idx_homepage_sections_sort on public.homepage_sections (is_visible, sort_order);
create index if not exists idx_reviews_product on public.reviews (product_id, status);

-- 2. Idempotency Support for Orders
-- Prevents duplicate order creation and double billing on network retries
alter table public.orders add column if not exists idempotency_key text unique;
create index if not exists idx_orders_idempotency on public.orders (idempotency_key) where idempotency_key is not null;

-- 3. Concurrency-Safe Atomic Stock Decrement RPC
-- Completely prevents race conditions, overselling, and TOCTOU bugs under concurrent checkout bursts
create or replace function public.decrement_product_stock(p_product_id text, p_quantity integer)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_rows_updated integer;
begin
  -- Decrement stock atomically ONLY if sufficient stock exists
  update public.products
  set stock_quantity = stock_quantity - p_quantity,
      in_stock = (stock_quantity - p_quantity > 0),
      updated_at = timezone('utc'::text, now())
  where id = p_product_id
    and stock_quantity >= p_quantity;

  get diagnostics v_rows_updated = row_count;
  return v_rows_updated > 0;
end;
$$;

-- 4. Atomic Stock Restoration RPC (For Order Cancellation / Payment Failure)
create or replace function public.restore_product_stock(p_product_id text, p_quantity integer)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.products
  set stock_quantity = stock_quantity + p_quantity,
      in_stock = true,
      updated_at = timezone('utc'::text, now())
  where id = p_product_id;

  return true;
end;
$$;
