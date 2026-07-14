import Stripe from "npm:stripe@^18.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    serviceRoleKey(),
    { auth: { persistSession: false } },
  );
}

function keyFromJsonEnv(name: string) {
  try {
    const raw = Deno.env.get(name);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return String(parsed.default || Object.values(parsed)[0] || "");
  } catch {
    return "";
  }
}

function serviceRoleKey() {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || keyFromJsonEnv("SUPABASE_SECRET_KEYS");
}

function subscriptionState(status?: Stripe.Subscription.Status | null) {
  if (status === "trialing") return { membership_level: "paid", subscription_status: "trialing" };
  if (status === "active") return { membership_level: "paid", subscription_status: "active" };
  if (status === "past_due" || status === "unpaid") return { membership_level: "free", subscription_status: "past_due" };
  if (status === "canceled" || status === "incomplete_expired") return { membership_level: "free", subscription_status: "canceled" };
  return { membership_level: "free", subscription_status: "inactive" };
}

async function userIdFromCustomer(customerId: string) {
  const { data } = await adminClient()
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id as string | undefined;
}

async function updateProfileFromSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;
  if (!customerId) return;

  const userId = subscription.metadata?.supabase_user_id || await userIdFromCustomer(customerId);
  if (!userId) return;

  const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end ||
    (subscription.items.data[0] as Stripe.SubscriptionItem & { current_period_end?: number })?.current_period_end;
  const currentPeriodEnd = periodEnd
    ? new Date(periodEnd * 1000).toISOString()
    : null;
  const mapped = subscriptionState(subscription.status);

  await adminClient()
    .from("profiles")
    .update({
      ...mapped,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      membership_expires_at: currentPeriodEnd,
      trial_used: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!signature || !webhookSecret) return jsonResponse({ error: "Webhook is not configured." }, 500);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Invalid Stripe signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await updateProfileFromSubscription(subscription);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await updateProfileFromSubscription(event.data.object as Stripe.Subscription);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Webhook handler failed." }, 500);
  }
});
