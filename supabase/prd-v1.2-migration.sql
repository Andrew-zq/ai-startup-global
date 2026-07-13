-- AI Startup Global PRD v1.2 database migration.
-- Review in a staging project before running in production.

create type public.subscription_state as enum ('inactive','trialing','active','past_due','canceled');
create type public.event_pricing_type as enum ('free_public','paid_public','member_only');
create type public.material_visibility as enum ('public','member');
create type public.material_kind as enum ('ppt','exercise','video','other');

alter table public.profiles
  add column stripe_customer_id text unique,
  add column subscription_status public.subscription_state not null default 'inactive',
  add column membership_expires_at timestamptz,
  add column trial_used boolean not null default false,
  add column directory_visible boolean not null default false,
  add column directory_headline text,
  add column directory_focus text,
  add column directory_project text,
  add column directory_links jsonb not null default '[]'::jsonb;

alter table public.events
  add column pricing_type public.event_pricing_type not null default 'free_public',
  add column ticket_price numeric(10,2),
  add column luma_promo_note text;

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  event_id text references public.events(id) on delete set null,
  title text not null,
  title_zh text,
  description text,
  description_zh text,
  visibility public.material_visibility not null default 'public',
  kind public.material_kind not null default 'other',
  storage_path text,
  public_url text,
  published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_path is not null or public_url is not null)
);

alter table public.materials enable row level security;

create policy "public or paid materials metadata" on public.materials for select
to anon, authenticated using (
  published and (
    visibility = 'public'
    or public.is_admin()
    or exists (
      select 1 from public.profiles p where p.id = auth.uid()
      and p.membership_level = 'paid'
      and p.subscription_status in ('trialing','active')
    )
  )
);
create policy "admins manage materials" on public.materials for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Members may only change their voluntary directory fields, never role or billing state.
create policy "users update own directory profile" on public.profiles for update to authenticated
using (id = auth.uid()) with check (
  id = auth.uid()
  and role = (select role from public.profiles where id = auth.uid())
  and membership_level = (select membership_level from public.profiles where id = auth.uid())
  and subscription_status = (select subscription_status from public.profiles where id = auth.uid())
  and trial_used = (select trial_used from public.profiles where id = auth.uid())
  and attended_events = (select attended_events from public.profiles where id = auth.uid())
);

grant select on public.materials to anon, authenticated;
grant all on public.materials to authenticated;
