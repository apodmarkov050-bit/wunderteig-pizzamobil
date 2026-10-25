-- REVIEW-ONLY DRAFT. This file contains DDL only; it is not approved for
-- execution until separately reviewed and deliberately applied by the owner.
-- One website and one Supabase database per restaurant. No shared restaurant
-- registry, restaurant_memberships, or admin_users table is introduced.
--
-- This draft does not backfill or update existing orders/order_items. New CRM
-- relationship columns have no default and therefore remain NULL on old rows.
-- Run the read-only preflight before any separately approved application of
-- this draft. Before/after audit SELECTs live separately in
-- supabase/checks/customer_crm_preflight_and_audit.sql.

begin;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(btrim(display_name)) > 0),
  email text,
  normalized_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_normalized_email_idx
  on public.customers (normalized_email)
  where normalized_email is not null;

create function public.touch_customer_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger customers_updated_at
before update on public.customers
for each row execute function public.touch_customer_updated_at();

create table public.customer_phones (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null
    references public.customers(id) on delete restrict,
  phone_original text not null check (length(btrim(phone_original)) > 0),
  -- E.164 syntax (country-aware number validation is also required in the API).
  -- The server normalization library must use this restaurant's configured
  -- country. The normalized value is deliberately NOT globally unique.
  normalized_phone text not null
    check (normalized_phone ~ '^\+[1-9][0-9]{1,14}$'),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  unique (customer_id, normalized_phone),
  -- Supports a composite FK that guarantees an order phone belongs to its client.
  unique (id, customer_id)
);

create index customer_phones_normalized_idx
  on public.customer_phones (normalized_phone);
create unique index customer_phones_one_primary_idx
  on public.customer_phones (customer_id)
  where is_primary;

create table public.delivery_addresses (
  id uuid primary key default gen_random_uuid(),
  street text not null,
  house_number text not null,
  postal_code text not null,
  city text not null,
  apartment_or_floor text,
  address_extra text,
  -- Server-generated strict key from postal code, city, street, house number,
  -- and apartment_or_floor when supplied. Preserve all original components
  -- above. This unique key deduplicates address rows only within this restaurant
  -- database; it never identifies, merges, or links a customer by itself.
  normalized_address text not null unique
    check (length(btrim(normalized_address)) > 0),
  created_at timestamptz not null default now()
);

-- One address can be associated with many clients; one client can have many
-- addresses. Deduplicating an address row never associates a customer by itself.
create table public.customer_delivery_addresses (
  customer_id uuid not null
    references public.customers(id) on delete restrict,
  delivery_address_id uuid not null
    references public.delivery_addresses(id) on delete restrict,
  is_primary boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (customer_id, delivery_address_id)
);

create index customer_delivery_addresses_address_idx
  on public.customer_delivery_addresses (delivery_address_id);
create unique index customer_delivery_addresses_one_primary_idx
  on public.customer_delivery_addresses (customer_id)
  where is_primary;

-- Pending order match review and candidate rows are separate. Candidate address
-- matches are suggestions only; neither candidate rows nor an address match
-- assign orders.customer_id. An administrator must explicitly confirm a link.
create table public.customer_match_reviews (
  order_id bigint primary key
    references public.orders(id) on delete restrict,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'linked', 'dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  check (
    (review_status = 'pending' and reviewed_at is null)
    or (review_status in ('linked', 'dismissed') and reviewed_at is not null)
  )
);

create table public.customer_match_review_candidates (
  order_id bigint not null
    references public.customer_match_reviews(order_id) on delete cascade,
  customer_id uuid not null
    references public.customers(id) on delete restrict,
  match_reason text not null
    check (match_reason in ('phone', 'address', 'phone_and_address', 'manual')),
  primary key (order_id, customer_id, match_reason)
);

create index customer_match_candidates_customer_idx
  on public.customer_match_review_candidates (customer_id);

-- Append-only audit ledger. A normal order creates no consent event. A grant
-- requires a separate explicit customer action in the future UI/API.
create table public.customer_marketing_consent_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null
    references public.customers(id) on delete restrict,
  event_type text not null check (event_type in ('granted', 'withdrawn')),
  purpose text not null check (length(btrim(purpose)) > 0),
  channel text not null check (channel in ('email', 'sms', 'phone')),
  consent_text_version text not null
    check (length(btrim(consent_text_version)) > 0),
  occurred_at timestamptz not null default now(),
  source text not null check (length(btrim(source)) > 0),
  contact_type text not null check (contact_type in ('email', 'phone')),
  contact_value_snapshot text not null
    check (length(btrim(contact_value_snapshot)) > 0),
  related_grant_id uuid
    references public.customer_marketing_consent_events(id) on delete restrict,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (event_type = 'granted' and related_grant_id is null)
    or (event_type = 'withdrawn' and related_grant_id is not null)
  ),
  check (
    (channel = 'email' and contact_type = 'email')
    or (channel in ('sms', 'phone') and contact_type = 'phone')
  )
);

create index customer_consent_customer_idx
  on public.customer_marketing_consent_events (customer_id, occurred_at desc);
create unique index customer_consent_one_withdrawal_per_grant_idx
  on public.customer_marketing_consent_events (related_grant_id)
  where event_type = 'withdrawn';

create function public.validate_consent_withdrawal()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  grant_event public.customer_marketing_consent_events%rowtype;
begin
  if new.event_type = 'withdrawn' then
    select * into grant_event
    from public.customer_marketing_consent_events
    where id = new.related_grant_id
    for key share;

    if not found
       or grant_event.event_type <> 'granted'
       or grant_event.customer_id <> new.customer_id
       or grant_event.purpose <> new.purpose
       or grant_event.channel <> new.channel then
      raise exception 'Withdrawal must reference a matching consent grant';
    end if;
  end if;
  return new;
end;
$$;

create trigger consent_withdrawal_check
before insert on public.customer_marketing_consent_events
for each row execute function public.validate_consent_withdrawal();

create function public.reject_consent_row_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Consent events are append-only';
end;
$$;

create trigger consent_events_no_update_delete
before update or delete on public.customer_marketing_consent_events
for each row execute function public.reject_consent_row_mutation();

create function public.reject_consent_truncate()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Consent events cannot be truncated';
end;
$$;

create trigger consent_events_no_truncate
before truncate on public.customer_marketing_consent_events
for each statement execute function public.reject_consent_truncate();

-- Audit trail for future explicit manual merges only; no merge operation or
-- automatic merge is implemented by this migration.
create table public.customer_merge_events (
  id uuid primary key default gen_random_uuid(),
  source_customer_id uuid not null
    references public.customers(id) on delete restrict,
  target_customer_id uuid not null
    references public.customers(id) on delete restrict,
  merged_by uuid references auth.users(id) on delete set null,
  merged_at timestamptz not null default now(),
  note text,
  check (source_customer_id <> target_customer_id)
);

-- New relationship columns have no defaults: old orders remain NULL until
-- manual confirmation. This draft performs no historical CRM backfill.
-- Existing snapshot columns are not updated. delivery_note is a new nullable
-- snapshot field for the current checkout's optional instruction.
alter table public.orders
  add column customer_id uuid,
  add column customer_phone_id uuid,
  add column delivery_address_id uuid,
  add column delivery_note text;

alter table public.orders
  add constraint orders_customer_fk
    foreign key (customer_id)
    references public.customers(id) on delete restrict,
  add constraint orders_phone_customer_fk
    foreign key (customer_phone_id, customer_id)
    references public.customer_phones(id, customer_id) on delete restrict,
  add constraint orders_address_fk
    foreign key (delivery_address_id)
    references public.delivery_addresses(id) on delete restrict,
  add constraint orders_phone_requires_customer
    check (customer_phone_id is null or customer_id is not null),
  add constraint orders_customer_address_fk
    foreign key (customer_id, delivery_address_id)
    references public.customer_delivery_addresses(customer_id, delivery_address_id)
    on delete restrict;

create index orders_customer_idx on public.orders (customer_id);
create index orders_phone_idx on public.orders (customer_phone_id);
create index orders_address_idx on public.orders (delivery_address_id);

-- No direct anon/authenticated policies are created. The CRM is accessed only
-- by server routes that call getAdminUser() before using SUPABASE_SECRET_KEY.
-- Existing orders/order_items RLS, grants, rows, totals, statuses and items are
-- not changed. service_role bypasses RLS, so server authorization is mandatory.
alter table public.customers enable row level security;
alter table public.customer_phones enable row level security;
alter table public.delivery_addresses enable row level security;
alter table public.customer_delivery_addresses enable row level security;
alter table public.customer_match_reviews enable row level security;
alter table public.customer_match_review_candidates enable row level security;
alter table public.customer_marketing_consent_events enable row level security;
alter table public.customer_merge_events enable row level security;

revoke all on public.customers, public.customer_phones, public.delivery_addresses,
  public.customer_delivery_addresses, public.customer_match_reviews,
  public.customer_match_review_candidates, public.customer_marketing_consent_events,
  public.customer_merge_events from public, anon, authenticated, service_role;

grant select, insert, update on public.customers, public.customer_phones,
  public.delivery_addresses, public.customer_delivery_addresses,
  public.customer_match_reviews, public.customer_match_review_candidates
  to service_role;
grant select, insert on public.customer_marketing_consent_events,
  public.customer_merge_events to service_role;

-- Explicitly document that service_role receives no TRUNCATE on the ledger.
revoke truncate on public.customer_marketing_consent_events
  from public, anon, authenticated, service_role;

commit;

-- Future matching contract (implemented by server code, not by this DDL):
-- * Normalize phone with a server library and restaurant country context.
-- * No phone candidate => create a customer; one non-conflicting candidate may
--   be proposed; multiple candidates or conflicting identity signals => review.
-- * Address match => add review candidate only; never set customer_id by itself.
-- * Link order.customer_phone_id only with that phone's customer_id. Link an
--   order address to a customer only after a customer/address association exists.
-- * Preserve order snapshots; do not backfill unconfirmed historic links.
