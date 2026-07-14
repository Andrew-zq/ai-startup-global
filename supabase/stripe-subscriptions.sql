-- Stripe subscription fields required by the Edge Functions.
-- Run this after supabase/prd-v1.2-migration.sql.

alter table public.profiles
  add column if not exists stripe_subscription_id text unique;

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles(stripe_customer_id);

create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles(stripe_subscription_id);
