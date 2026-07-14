-- Allow users to cancel their own event registration before the event starts.
-- Run in Supabase SQL Editor after the main schema.

drop policy if exists "users cancel own registrations before event starts" on public.event_registrations;

create policy "users cancel own registrations before event starts"
on public.event_registrations
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events e
    where e.id = event_registrations.event_id
    and e.starts_at > now()
  )
);

