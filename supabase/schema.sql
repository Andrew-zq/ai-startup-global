create type public.membership_level as enum ('free', 'paid');
create type public.user_role as enum ('user', 'admin');
create type public.event_channel as enum ('luma', 'member');
create type public.request_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  membership_level public.membership_level not null default 'free',
  attended_events integer not null default 0 check (attended_events >= 0),
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id text primary key,
  channel public.event_channel not null,
  title text not null,
  title_zh text,
  description text,
  description_zh text,
  event_type text,
  event_type_zh text,
  location text,
  location_zh text,
  starts_at timestamptz not null,
  registration_url text,
  summary text,
  summary_zh text,
  ppt_url text,
  published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attended boolean not null default false,
  registered_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create table public.membership_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique(user_id, status)
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') = 'anqizhu105@gmail.com'
    or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'),
    false
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id,email,full_name,role)
  values(
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email,'@',1)),
    case when lower(new.email) = 'anqizhu105@gmail.com' then 'admin'::public.user_role else 'user'::public.user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.membership_requests enable row level security;

create policy "profiles read own" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "published events are public" on public.events for select to anon, authenticated using (published or public.is_admin());
create policy "admins manage events" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "users read own registrations" on public.event_registrations for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "paid members register" on public.event_registrations for insert to authenticated with check (
  user_id = auth.uid() and exists(select 1 from public.profiles where id = auth.uid() and membership_level = 'paid')
);
create policy "admins manage registrations" on public.event_registrations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "users read own requests" on public.membership_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "eligible users request membership" on public.membership_requests for insert to authenticated with check (
  user_id = auth.uid() and exists(select 1 from public.profiles where id = auth.uid() and attended_events >= 1)
);
create policy "admins review membership" on public.membership_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.profiles, public.event_registrations, public.membership_requests to authenticated;
grant insert on public.event_registrations, public.membership_requests to authenticated;
grant all on public.profiles, public.events, public.event_registrations, public.membership_requests to authenticated;
