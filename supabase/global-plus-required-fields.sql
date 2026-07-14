-- Global+ Stripe subscription required fields.
-- Safe to run multiple times in Supabase SQL Editor.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_state') then
    create type public.subscription_state as enum ('inactive','trialing','active','past_due','canceled');
  end if;
end
$$;

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status public.subscription_state not null default 'inactive',
  add column if not exists membership_expires_at timestamptz,
  add column if not exists trial_used boolean not null default false;

create unique index if not exists profiles_stripe_customer_id_unique
  on public.profiles(stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_id_unique
  on public.profiles(stripe_subscription_id)
  where stripe_subscription_id is not null;
