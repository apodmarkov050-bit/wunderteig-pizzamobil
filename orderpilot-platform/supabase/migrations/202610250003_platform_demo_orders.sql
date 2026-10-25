-- Shared test orders for the restaurant/customer platform preview.
-- Browser clients never access this table directly. Server routes use the
-- Supabase secret key; RLS stays enabled with no anon/authenticated policies.

create table if not exists public.platform_demo_orders (
  id uuid primary key,
  order_number text not null,
  restaurant_id text not null check (restaurant_id in ('wunderteig', 'green-table', 'pasta-club')),
  status text not null default 'pending'
    check (status in ('pending', 'proposed', 'accepted', 'change_requested')),
  order_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_demo_orders_restaurant_created_idx
  on public.platform_demo_orders (restaurant_id, created_at desc);

alter table public.platform_demo_orders enable row level security;
revoke all on table public.platform_demo_orders from anon, authenticated;
revoke all on table public.platform_demo_orders from public;
grant all on table public.platform_demo_orders to service_role;
