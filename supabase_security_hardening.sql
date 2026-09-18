-- ==============================================================================
-- NISHYA LUXURY — DATABASE SECURITY HARDENING MIGRATION
-- ==============================================================================

-- 1. Secure SECURITY DEFINER functions with explicit search_path
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Always default to 'customer' role on signup; never trust client-supplied role in metadata for admin privileges
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Harden Profiles table policies
-- Prevent normal users from updating their own role to 'admin'
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Users can update own profile non-role fields" on public.profiles;

create policy "Users can update own profile non-role fields"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    -- If not admin, the role must remain 'customer'
    public.is_admin() or (role = 'customer')
  );

create policy "Admins have full access to profiles"
  on public.profiles for all
  using (public.is_admin());

-- 3. Harden Orders & Order Items RLS
-- Drop overly permissive check (true) policies
drop policy if exists "Anyone can insert order" on public.orders;
drop policy if exists "Anyone can insert order items" on public.order_items;
drop policy if exists "Customers can view own orders" on public.orders;
drop policy if exists "Customers can view own order items" on public.order_items;

-- Customers can only read orders associated with their email or user ID
create policy "Customers can view own orders"
  on public.orders for select
  using (
    customer_email = auth.jwt()->>'email'
    or public.is_admin()
  );

-- Orders can only be inserted if payment_status is 'pending' and totals are non-negative
create policy "Secure order insertion"
  on public.orders for insert
  with check (
    payment_status = 'pending'
    and total >= 0
    and subtotal >= 0
  );

-- Order items can be inserted only with positive quantities
create policy "Secure order items insertion"
  on public.order_items for insert
  with check (
    quantity > 0
    and price >= 0
  );

create policy "Customers can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.customer_email = auth.jwt()->>'email' or public.is_admin())
    )
  );

-- 4. Harden Storage Buckets (Revoke general authenticated uploads)
drop policy if exists "Admin Upload to media buckets" on storage.objects;
drop policy if exists "Admin Delete from media buckets" on storage.objects;

-- Only verified administrators can upload to product-media and cms-media
create policy "Admin Upload to media buckets"
  on storage.objects for insert
  with check (
    bucket_id in ('product-media', 'cms-media')
    and public.is_admin()
  );

create policy "Admin Delete from media buckets"
  on storage.objects for delete
  using (
    bucket_id in ('product-media', 'cms-media')
    and public.is_admin()
  );

-- 5. Add database check constraints if not present
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'check_positive_stock'
  ) then
    alter table public.products add constraint check_positive_stock check (stock_quantity >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'check_positive_price'
  ) then
    alter table public.products add constraint check_positive_price check (price >= 0);
  end if;
end $$;
