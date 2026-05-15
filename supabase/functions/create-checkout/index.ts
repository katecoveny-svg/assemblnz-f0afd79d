import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const body = await req.json();
    const priceId =
      body.priceId ||
      Deno.env.get("STRIPE_INDUSTRY_PACK_PRICE_ID") ||
      Deno.env.get("INDUSTRY_PACK_PRICE_ID");
    if (!priceId) throw new Error("priceId is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://assembl.co.nz";
    const successUrl =
      typeof body.successUrl === "string" && body.successUrl.includes("{CHECKOUT_SESSION_ID}")
        ? body.successUrl
        : `${origin}/app/${body.slug || "tenant"}/onboarding?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      typeof body.cancelUrl === "string"
        ? body.cancelUrl
        : `${origin}/start/signup?checkout=cancelled`;
    const metadata = {
      plan: String(body.plan || "industry-pack"),
      kete: String(body.kete || ""),
      company_name: String(body.companyName || ""),
      tenant_slug: String(body.slug || ""),
      contact_name: String(body.contactName || ""),
      contact_phone: String(body.phone || ""),
      auth_user_id: user.id,
      user_email: user.email,
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      client_reference_id: user.id,
      metadata,
      subscription_data: { metadata },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
