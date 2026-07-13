# AI Startup Global

Community, events, membership and AI intelligence platform for Vancouver and the global Chinese-speaking AI builder community.

## Architecture

- Static HTML, CSS and JavaScript hosted on GitHub Pages.
- Supabase Auth for email/password and Google sign-in.
- Supabase Postgres with Row Level Security for profiles, events, registrations and membership data.
- Supabase Storage and Edge Functions are the planned secure layer for member materials and Stripe webhooks.
- GitHub Actions refreshes the AI Radar every day.
- Google Apps Script sends selected operational notifications.

## Local preview

```powershell
node server.js
```

Open <http://localhost:5500>.

## Database setup

1. Apply `supabase/schema.sql` to a new Supabase project.
2. Apply `supabase/prd-v1.2-migration.sql` for subscription, directory, event pricing and materials fields.
3. Apply `supabase/storage-event-materials.sql` to create the `event-materials` Supabase Storage bucket and admin upload policies.
4. Configure the allowed OAuth origins and redirect URLs in Google Cloud and Supabase.

Always test migrations in a staging project first. Never add Stripe secret keys or the Supabase service-role key to frontend code.

## Commercial configuration

`subscription-config.js` contains public frontend endpoints only. Stripe secret operations must run in Supabase Edge Functions. Until `checkoutEndpoint` is configured, the join page operates as an eligibility preview and does not claim payment succeeded.

## Event materials storage

Admin users can upload PPT, PDF, Word and Markdown files from `admin.html` when creating or editing an event. Files are uploaded to the public `event-materials` bucket, and the generated public URL is saved on the event as the meeting material link. Upload permissions are restricted by Storage RLS policies to `public.is_admin()`.

## Product source of truth

See `PRD/AI-Startup-Global-PRD (1).md`.
