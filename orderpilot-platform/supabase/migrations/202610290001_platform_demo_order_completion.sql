-- Allow restaurant demo orders to be marked completed after customer approval.
alter table public.platform_demo_orders
  drop constraint if exists platform_demo_orders_status_check;

alter table public.platform_demo_orders
  add constraint platform_demo_orders_status_check
  check (status in ('pending', 'proposed', 'accepted', 'change_requested', 'completed'));
