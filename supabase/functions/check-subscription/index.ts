import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !serviceKey) {
      logStep("Missing Supabase env, returning unsubscribed");
      return json({ subscribed: false, fallback: true });
    }
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not set, returning unsubscribed");
      return json({ subscribed: false, fallback: true });
    }

    const supabaseClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header, returning unsubscribed");
      return json({ subscribed: false });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("Auth failed, returning unsubscribed", { message: userError?.message });
      return json({ subscribed: false });
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customers;
    try {
      customers = await stripe.customers.list({ email: user.email, limit: 1 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logStep("Stripe customers.list failed, fallback unsubscribed", { msg });
      return json({ subscribed: false, fallback: true });
    }

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return json({ subscribed: false });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    let subscriptions;
    try {
      subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logStep("Stripe subscriptions.list failed, fallback unsubscribed", { msg });
      return json({ subscribed: false, fallback: true });
    }

    const hasActiveSub = subscriptions.data.length > 0;
    let productId: string | null = null;
    let priceId: string | null = null;
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      priceId = subscription.items.data[0].price.id;
      logStep("Active subscription found", { productId, priceId, subscriptionEnd });
    } else {
      logStep("No active subscription found");
    }

    return json({
      subscribed: hasActiveSub,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CHECK-SUBSCRIPTION] FATAL", errorMessage);
    // Never let the function 503 — always return a graceful fallback
    return json({ subscribed: false, fallback: true, error: errorMessage }, 200);
  }
});
