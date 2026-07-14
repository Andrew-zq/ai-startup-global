import Stripe from "npm:stripe@^18.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
});

const siteUrl = Deno.env.get("SITE_URL") || "https://andrew-zq.github.io/ai-startup-global";
const priceId = Deno.env.get("STRIPE_GLOBAL_PLUS_PRICE_ID") || "";

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    serviceRoleKey(),
    { auth: { persistSession: false } },
  );
}

function userClient(authHeader: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    anonKey(),
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    },
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

function anonKey() {
  return Deno.env.get("SUPABASE_ANON_KEY") || keyFromJsonEnv("SUPABASE_PUBLISHABLE_KEYS");
}

function serviceRoleKey() {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || keyFromJsonEnv("SUPABASE_SECRET_KEYS");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    if (!Deno.env.get("STRIPE_SECRET_KEY") || !priceId) {
      return jsonResponse({ error: "Stripe is not configured yet." }, 500);
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return jsonResponse({ error: "Sign in required." }, 401);

    const supabaseUser = userClient(authHeader);
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData.user) return jsonResponse({ error: "Invalid session." }, 401);

    const supabaseAdmin = adminClient();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id,email,full_name,attended_events,membership_level,trial_used,stripe_customer_id")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profile) return jsonResponse({ error: "Profile not found." }, 404);
    if ((profile.attended_events || 0) < 1) {
      return jsonResponse({ error: "Attend one event before starting Global+." }, 403);
    }
    if (profile.membership_level === "paid") {
      return jsonResponse({ error: "Global+ is already active." }, 409);
    }
    if (profile.trial_used) {
      return jsonResponse({ error: "This account has already used the free trial." }, 403);
    }

    let customerId = profile.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || userData.user.email || undefined,
        name: profile.full_name || undefined,
        metadata: { supabase_user_id: profile.id },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: profile.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard.html?checkout=success`,
      cancel_url: `${siteUrl}/join.html?checkout=cancelled`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 30,
        metadata: { supabase_user_id: profile.id, plan: "global_plus" },
      },
      metadata: { supabase_user_id: profile.id, plan: "global_plus" },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Checkout unavailable." }, 500);
  }
});
