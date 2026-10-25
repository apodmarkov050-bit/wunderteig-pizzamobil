-- Draft only: review and apply manually in the restaurant's Supabase project.
-- Adds nullable fields only. Existing orders, items, prices, statuses and CRM links
-- are not updated or backfilled by this migration.

begin;

alter table public.orders
  add column if not exists communication_channel text,
  add column if not exists agreed_time text,
  add column if not exists delivery_note text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_communication_channel_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_communication_channel_check
      check (communication_channel is null or communication_channel in ('whatsapp', 'telegram'));
  end if;
end
$$;

comment on column public.orders.communication_channel is
  'Customer-selected channel for follow-up; nullable for historical orders.';
comment on column public.orders.agreed_time is
  'Time agreed by restaurant staff; nullable until confirmed.';
comment on column public.orders.delivery_note is
  'Delivery instruction snapshot submitted with the order.';

commit;
