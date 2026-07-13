-- AI Startup Global Supabase Storage setup for event meeting materials.
-- Run this once in Supabase SQL Editor after the main schema/migrations.
-- Bucket purpose: PPT, PDF, Word and Markdown files attached to events.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'event-materials',
  'event-materials',
  true,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/markdown',
    'text/plain',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read event materials" on storage.objects;
drop policy if exists "Admins upload event materials" on storage.objects;
drop policy if exists "Admins update event materials" on storage.objects;
drop policy if exists "Admins delete event materials" on storage.objects;

create policy "Public read event materials"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'event-materials');

create policy "Admins upload event materials"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-materials'
  and public.is_admin()
);

create policy "Admins update event materials"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'event-materials'
  and public.is_admin()
)
with check (
  bucket_id = 'event-materials'
  and public.is_admin()
);

create policy "Admins delete event materials"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-materials'
  and public.is_admin()
);

