-- READ-ONLY PREFLIGHT AND AUDIT. SELECT statements only; never apply as a migration.
-- Run PRE-MIGRATION before an approved migration and save every result.
-- Record max_order_id as the boundary between old and subsequently inserted orders.
-- Run POST-MIGRATION only after a separately approved migration; compare its
-- baseline values with the saved PRE-MIGRATION output.

-- ---------------------------------------------------------------------------
-- PRE-MIGRATION: environment, source schema, RLS, policies and grants
-- ---------------------------------------------------------------------------
select current_database() as database_name,
       current_setting('server_version') as postgres_version;

select table_name, column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('orders', 'order_items')
order by table_name, ordinal_position;

select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and c.relname in ('orders', 'order_items');

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('orders', 'order_items', 'customers', 'customer_phones',
                    'delivery_addresses', 'customer_delivery_addresses',
                    'customer_match_reviews', 'customer_match_review_candidates',
                    'customer_marketing_consent_events', 'customer_merge_events')
order by tablename, policyname;

select table_name, grantee, privilege_type, is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('orders', 'order_items')
order by table_name, grantee, privilege_type;

select conrelid::regclass as table_name, conname, contype,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in ('public.orders'::regclass, 'public.order_items'::regclass)
order by table_name, conname;

-- Save this complete result row as the baseline. max_order_id is the explicit
-- cutoff for counting pre-existing (old) versus later (new) orders after DDL.
-- The checksum removes only columns introduced by this CRM draft.
select
  (select count(*) from public.orders) as orders_count,
  (select max(id) from public.orders) as max_order_id,
  (select count(*) from public.orders where status = 'completed') as completed_orders_count,
  (select count(*) from public.orders where status = 'cancelled') as cancelled_orders_count,
  (select coalesce(sum(total), 0) from public.orders) as all_orders_total_sum,
  (select coalesce(sum(total), 0) from public.orders where status = 'completed') as completed_total_sum,
  (select md5(coalesce(string_agg(
      (to_jsonb(o) - 'customer_id' - 'customer_phone_id' - 'delivery_address_id' - 'delivery_note' - 'communication_channel' - 'agreed_time')::text,
      E'\n' order by o.id
    ), '')) from public.orders o) as original_orders_checksum,
  (select count(*) from public.order_items) as order_items_count,
  (select count(distinct order_id) from public.order_items) as orders_with_items,
  (select coalesce(sum(quantity), 0) from public.order_items) as order_items_quantity_sum,
  (select coalesce(sum(line_total), 0) from public.order_items) as order_items_line_total_sum,
  (select md5(coalesce(string_agg(to_jsonb(i)::text, E'\n' order by i.id), ''))
   from public.order_items i) as original_order_items_checksum;

select status, count(*) as orders_count, coalesce(sum(total), 0) as total_sum
from public.orders
group by status
order by status;

-- ---------------------------------------------------------------------------
-- POST-MIGRATION: compare baseline and audit CRM relationships
-- ---------------------------------------------------------------------------
-- Compare every returned baseline value with the saved pre-migration row,
-- including max_order_id and both checksums. Any unexplained difference means stop.
select
  (select count(*) from public.orders) as orders_count,
  (select max(id) from public.orders) as max_order_id,
  (select count(*) from public.orders where status = 'completed') as completed_orders_count,
  (select count(*) from public.orders where status = 'cancelled') as cancelled_orders_count,
  (select coalesce(sum(total), 0) from public.orders) as all_orders_total_sum,
  (select coalesce(sum(total), 0) from public.orders where status = 'completed') as completed_total_sum,
  (select md5(coalesce(string_agg(
      (to_jsonb(o) - 'customer_id' - 'customer_phone_id' - 'delivery_address_id' - 'delivery_note' - 'communication_channel' - 'agreed_time')::text,
      E'\n' order by o.id
    ), '')) from public.orders o) as original_orders_checksum,
  (select count(*) from public.order_items) as order_items_count,
  (select count(distinct order_id) from public.order_items) as orders_with_items,
  (select coalesce(sum(quantity), 0) from public.order_items) as order_items_quantity_sum,
  (select coalesce(sum(line_total), 0) from public.order_items) as order_items_line_total_sum,
  (select md5(coalesce(string_agg(to_jsonb(i)::text, E'\n' order by i.id), ''))
   from public.order_items i) as original_order_items_checksum;

select status, count(*) as orders_count, coalesce(sum(total), 0) as total_sum
from public.orders
group by status
order by status;

-- Replace every 'PASTE_SAVED_MAX_ORDER_ID' literal with the max_order_id
-- recorded above before running these audit SELECTs. Old-order
-- CRM links must remain NULL pending manual confirmation. New links are counted
-- separately and are allowed only when explicitly created by reviewed app logic.
select
  case when o.id <= 'PASTE_SAVED_MAX_ORDER_ID'::bigint then 'old' else 'new' end as order_cohort,
  count(*) as orders_count,
  count(*) filter (where o.customer_id is not null) as linked_customers,
  count(*) filter (where o.customer_phone_id is not null) as linked_phones,
  count(*) filter (where o.delivery_address_id is not null) as linked_addresses,
  count(*) filter (where o.customer_id is null) as unlinked_orders
from public.orders o
group by order_cohort
order by order_cohort;

-- Expect zero rows. These SELECTs identify inconsistent order↔phone↔customer
-- relationships and do not modify or expose customer contact details.
select o.id as order_id, o.customer_id, o.customer_phone_id,
       cp.customer_id as phone_customer_id
from public.orders o
left join public.customer_phones cp on cp.id = o.customer_phone_id
where (o.customer_phone_id is not null and cp.id is null)
   or (o.customer_phone_id is not null and cp.customer_id is distinct from o.customer_id)
   or (o.customer_phone_id is not null and o.customer_id is null)
order by o.id;

-- Expect zero rows. Address reuse by multiple customers is valid: the shared
-- address row is associated through customer_delivery_addresses. An address
-- match alone never links a customer or an order automatically.
select o.id as order_id, o.customer_id, o.delivery_address_id,
       cda.customer_id as associated_customer_id
from public.orders o
left join public.delivery_addresses da on da.id = o.delivery_address_id
left join public.customer_delivery_addresses cda
  on cda.customer_id = o.customer_id
 and cda.delivery_address_id = o.delivery_address_id
where (o.delivery_address_id is not null and da.id is null)
   or (o.delivery_address_id is not null and o.customer_id is null)
   or (o.delivery_address_id is not null and cda.customer_id is null)
order by o.id;

-- Expect zero rows: old orders must not receive CRM links without manual review.
select o.id as order_id, o.customer_id, o.customer_phone_id, o.delivery_address_id
from public.orders o
where o.id <= 'PASTE_SAVED_MAX_ORDER_ID'::bigint
  and (o.customer_id is not null
       or o.customer_phone_id is not null
       or o.delivery_address_id is not null)
order by o.id;

-- This file is SELECT-only. Never run SQL from this file as a migration.
