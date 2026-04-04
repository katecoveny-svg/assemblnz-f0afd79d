import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_LIMITS: Record<string, { plan: string; limit: number }> = {
  price_starter: { plan: "starter", limit: 100 },
  price_family: { plan: "family", limit: 500 },
  price_plus: { plan: "plus", limit: 999999 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("TOROA_STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    console.log(`[toroa-stripe] Event: ${event.type}`);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id || "";
        const config = PLAN_LIMITS[priceId] || { plan: "starter", limit: 100 };

        // Find customer email → phone mapping
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const phone = customer.phone || customer.metadata?.phone;

        if (phone) {
          await sb
            .from("toroa_families")
            .update({
              status: sub.status === "active" ? "active" : "paused",
              plan: config.plan,
              monthly_sms_limit: config.limit,
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
            })
            .eq("primary_phone", phone);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await sb
          .from("toroa_families")
          .update({ status: "cancelled" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Reset monthly SMS counter
        await sb
          .from("toroa_families")
          .update({ sms_used_this_month: 0 })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[toroa-stripe] Payment failed for customer ${invoice.customer}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("toroa-stripe-webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed", message: error instanceof Error ? error.message : "Unknown" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
