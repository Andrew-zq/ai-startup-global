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

### Stripe Global+ subscription setup

Global+ is wired for Stripe Checkout at CA$29.99 CAD/month with a 30-day trial.

1. In Stripe Dashboard, create:
   - Product: `Global+ Membership`
   - Recurring price: `CA$29.99`, monthly
   - Copy the Price ID, for example `price_...`
2. In Supabase SQL Editor, run:
   - `supabase/prd-v1.2-migration.sql`
   - `supabase/stripe-subscriptions.sql`
3. In Supabase Edge Functions secrets, add:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_GLOBAL_PLUS_PRICE_ID=price_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `SITE_URL=https://andrew-zq.github.io/ai-startup-global`
   - `SUPABASE_URL=...`
   - `SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
4. Deploy Edge Functions:
   - `supabase functions deploy create-checkout-session`
   - `supabase functions deploy stripe-webhook --no-verify-jwt`
5. In Stripe Dashboard, add a webhook endpoint:
   - URL: `https://ruynkwrgvylmphgerspa.supabase.co/functions/v1/stripe-webhook`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
6. Confirm `subscription-config.js` points to:
   - `https://ruynkwrgvylmphgerspa.supabase.co/functions/v1/create-checkout-session`

Never put `sk_live_...`, `whsec_...`, or `service_role` keys in frontend JavaScript or GitHub.

## Event materials storage

Admin users can upload PPT, PDF, Word and Markdown files from `admin.html` when creating or editing an event. Files are uploaded to the public `event-materials` bucket, and the generated public URL is saved on the event as the meeting material link. Upload permissions are restricted by Storage RLS policies to `public.is_admin()`.

## Product source of truth

See `PRD/AI-Startup-Global-PRD (1).md`.
